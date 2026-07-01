#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { getDashboard, getDashboardCharts, getDashboardDatasets, getDashboardTabs } from "../../skills/superset-dev-benchmark/scripts/query_dashboard.mjs";
import { screenshotDashboard } from "../../skills/superset-dev-benchmark/scripts/screenshot.mjs";
import { ROOT, loadTasks, parseArgs, readJson, resultPath, safeError, truncate } from "./common.mjs";

const CSV = "tasks/nl2bi-benchmark.csv";
const OUT_DIR = "results/financial-formal";
const SYSTEM = "SkillGuidedAgent";
const EVIDENCE_DIR = "results/financial-formal/dashboard-evidence";
const SCREENSHOT_DIR = "results/financial-formal/dashboard-evidence/screenshots";

const FINANCIAL_DATASET_IDS = new Set([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]);

const EXPECTED_CHARTS = {
  self_financial_dashboard_01: 4,
  self_financial_dashboard_02: 2,
  self_financial_dashboard_03: 3,
  self_financial_dashboard_04: 3,
  self_financial_dashboard_05: 4,
  self_financial_dashboard_06: 6,
  self_financial_dashboard_07: 3,
  self_financial_dashboard_08: 3,
  self_financial_dashboard_09: 3,
  self_financial_dashboard_10: 4,
};

function normalizeViz(viz) {
  const v = String(viz || "").toLowerCase();
  if (!v) return "";
  if (v.includes("big_number") || v === "kpi") return "kpi";
  if (v.includes("line")) return "line";
  if (v.includes("bar")) return v.includes("stack") ? "stacked_bar" : "bar";
  if (v.includes("pie")) return "pie";
  if (v.includes("table")) return "table";
  if (v.includes("pivot")) return "pivot_table";
  if (v.includes("histogram")) return "histogram";
  if (v.includes("scatter") || v.includes("bubble")) return "scatter";
  if (v.includes("heatmap")) return "heatmap";
  if (v.includes("funnel")) return "funnel";
  return v.replace(/^echarts_timeseries_/, "");
}

function splitSemi(value) {
  return String(value || "").split(";").map((v) => normalizeViz(v.trim())).filter(Boolean);
}

function typeMatches(expected, actual) {
  if (expected === actual) return true;
  if (expected === "bar" && actual === "stacked_bar") return true;
  if (expected === "stacked_bar" && actual === "bar") return true;
  if (expected === "kpi" && actual === "big_number") return true;
  if (expected === "table" && actual === "pivot_table") return true;
  if (expected === "big_number" && actual === "kpi") return true;
  return false;
}

function coverageScore(expected, actual) {
  if (!expected.length) return 2;
  let matched = 0;
  for (const e of expected) {
    if (actual.some((a) => typeMatches(e, a))) matched += 1;
  }
  if (matched === expected.length) return 2;
  if (matched > 0) return 1;
  return 0;
}

function pngDimensions(buffer) {
  if (buffer.length < 24) return null;
  const sig = buffer.subarray(0, 8).toString("hex");
  if (sig !== "89504e470d0a1a0a") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function retry(label, fn, attempts = 2) {
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.error(`[evidence] ${label} failed on attempt ${i}/${attempts}: ${safeError(err)}`);
    }
  }
  throw lastErr;
}

function resultCharts(result) {
  return Array.isArray(result?.artifact?.charts) ? result.artifact.charts : [];
}

function rowcounts(result) {
  return resultCharts(result).map((chart) => chart.chart_data?.rowcount).filter((n) => typeof n === "number");
}

function gradeDashboard(task, result, evidence) {
  const expectedCount = EXPECTED_CHARTS[task.id] || splitSemi(task.expected_viz_type).length;
  const charts = resultCharts(result);
  const actualCount = evidence.api_chart_count ?? charts.length;
  const expectedTypes = splitSemi(task.expected_viz_type);
  const actualTypes = charts.map((chart) => normalizeViz(chart.viz_type));
  const validationOk = charts.every((chart) => (chart.validation?.errors || []).length === 0);
  const datasetOk = charts.every((chart) => FINANCIAL_DATASET_IDS.has(chart.dataset_id));
  const dataOk = rowcounts(result).length === charts.length && rowcounts(result).every((n) => n > 0);
  const screenshotOk = evidence.screenshot_ok && evidence.screenshot_bytes > 5000;
  const screenshotDimsOk = evidence.screenshot_width >= 1200 && evidence.screenshot_height >= 700;

  return {
    dashboard_create_success: {
      score: evidence.dashboard_ok && result?.artifact?.dashboard_id ? 2 : 0,
      comment: evidence.dashboard_ok
        ? `Superset dashboard #${result.artifact.dashboard_id} metadata was fetched successfully.`
        : `Dashboard metadata fetch failed: ${evidence.dashboard_error || "no dashboard id"}.`,
    },
    expected_charts_present: {
      score: actualCount >= expectedCount ? 2 : (actualCount > 0 ? 1 : 0),
      comment: `Expected at least ${expectedCount} chart(s); dashboard API reports ${actualCount}, artifact records ${charts.length}.`,
    },
    dataset_metric_correctness: {
      score: datasetOk && validationOk && dataOk ? 2 : (dataOk ? 1 : 0),
      comment: `Financial dataset IDs=${datasetOk}; chart validation=${validationOk}; non-empty chart-data rowcounts=${rowcounts(result).join(", ") || "-"}.`,
    },
    viz_type_appropriateness: {
      score: coverageScore(expectedTypes, actualTypes),
      comment: `Expected viz families: ${expectedTypes.join(", ") || "-"}; actual: ${actualTypes.join(", ") || "-"}.`,
    },
    layout_legibility: {
      score: screenshotOk && screenshotDimsOk && actualCount >= expectedCount ? 2 : (screenshotOk ? 1 : 0),
      comment: screenshotOk
        ? `Dashboard screenshot rendered as ${evidence.screenshot_width}x${evidence.screenshot_height} PNG; visual spot-check still recommended for final paper numbers.`
        : `Screenshot failed or was too small: ${evidence.screenshot_error || "no screenshot"}.`,
    },
    render_and_screenshot: {
      score: screenshotOk ? 2 : 0,
      comment: screenshotOk
        ? `Serial screenshot API succeeded; saved local PNG (${evidence.screenshot_bytes} bytes, sha256 ${evidence.screenshot_sha256.slice(0, 12)}...).`
        : `Serial screenshot API failed: ${evidence.screenshot_error || "unknown"}.`,
    },
  };
}

function average(grades) {
  const vals = Object.values(grades).map((g) => g.score);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function artifactUrlRedacted(result) {
  return result?.artifact?.dashboard_url ? "(internal URL omitted)" : "-";
}

async function collectOne(task, args) {
  const resultFile = resultPath(OUT_DIR, SYSTEM, task.id);
  if (!existsSync(resultFile)) throw new Error(`Missing result JSON for ${task.id}: ${resultFile}`);
  const result = readJson(resultFile);
  const dashboardId = result?.artifact?.dashboard_id;
  if (!dashboardId) throw new Error(`Missing dashboard_id in ${resultFile}`);

  console.error(`[evidence] ${task.id}: dashboard #${dashboardId}`);

  const evidence = {
    task_id: task.id,
    dashboard_id: dashboardId,
    dashboard_title: result.artifact.dashboard_title || "",
    artifact_url: artifactUrlRedacted(result),
    dashboard_ok: false,
    dashboard_error: null,
    api_chart_count: null,
    api_dataset_count: null,
    api_tab_count: null,
    screenshot_ok: false,
    screenshot_error: null,
    screenshot_path: path.join(SCREENSHOT_DIR, `${task.id}_dashboard_${dashboardId}.png`),
    screenshot_bytes: 0,
    screenshot_width: null,
    screenshot_height: null,
    screenshot_sha256: "",
  };

  try {
    const [detail, charts, datasets, tabs] = await retry(`metadata ${task.id}`, async () => {
      const d = await getDashboard(dashboardId);
      const c = await getDashboardCharts(dashboardId);
      const ds = await getDashboardDatasets(dashboardId);
      const t = await getDashboardTabs(dashboardId);
      return [d, c, ds, t];
    });
    evidence.dashboard_ok = Boolean(detail?.result);
    evidence.dashboard_title = detail?.result?.dashboard_title || evidence.dashboard_title;
    evidence.api_chart_count = Array.isArray(charts?.result) ? charts.result.length : null;
    evidence.api_dataset_count = Array.isArray(datasets?.result) ? datasets.result.length : null;
    evidence.api_tab_count = Array.isArray(tabs?.result) ? tabs.result.length : null;
  } catch (err) {
    evidence.dashboard_error = safeError(err);
  }

  if (!args["skip-screenshot"]) {
    try {
      mkdirSync(path.resolve(ROOT, SCREENSHOT_DIR), { recursive: true });
      const outPath = path.resolve(ROOT, evidence.screenshot_path);
      const buffer = args["reuse-screenshots"] && existsSync(outPath)
        ? readFileSync(outPath)
        : await retry(`screenshot ${task.id}`, () => screenshotDashboard(dashboardId, {
          windowSize: [parseInt(args.width || "1600", 10), parseInt(args.height || "1200", 10)],
          format: "png",
        }), 2);
      if (!args["reuse-screenshots"] || !existsSync(outPath)) writeFileSync(outPath, buffer);
      const dims = pngDimensions(buffer) || {};
      evidence.screenshot_ok = true;
      evidence.screenshot_bytes = statSync(outPath).size;
      evidence.screenshot_width = dims.width || null;
      evidence.screenshot_height = dims.height || null;
      evidence.screenshot_sha256 = sha256(buffer);
    } catch (err) {
      evidence.screenshot_error = safeError(err);
    }
  }

  const grades = gradeDashboard(task, result, evidence);
  return { task, result, evidence, grades };
}

function writeOutputs(items) {
  const outAbs = path.resolve(ROOT, EVIDENCE_DIR);
  mkdirSync(outAbs, { recursive: true });
  const generatedAt = new Date().toISOString();

  const manifest = [];
  manifest.push(["task_id", "dashboard_id", "dashboard_title", "chart_count", "dataset_count", "screenshot_ok", "screenshot_path", "screenshot_bytes", "screenshot_dimensions", "sha256"].join("\t"));
  for (const item of items) {
    const e = item.evidence;
    manifest.push([
      e.task_id,
      e.dashboard_id,
      e.dashboard_title.replace(/\t/g, " "),
      e.api_chart_count ?? "",
      e.api_dataset_count ?? "",
      e.screenshot_ok,
      e.screenshot_path,
      e.screenshot_bytes,
      e.screenshot_width && e.screenshot_height ? `${e.screenshot_width}x${e.screenshot_height}` : "",
      e.screenshot_sha256,
    ].join("\t"));
  }

  const md = [];
  md.push("# Financial Dashboard Screenshot Evidence");
  md.push("");
  md.push(`Generated: ${generatedAt}`);
  md.push("");
  md.push("Scope: 10 `SkillGuidedAgent` BIRD `financial` NL2Dashboard tasks. Dashboard screenshots were collected serially (`concurrency=1`) through the dev Superset screenshot API.");
  md.push("");
  md.push("Screenshot PNGs are local generated evidence and intentionally gitignored. Use the paths below for visual spot-checking; internal Superset URLs are omitted.");
  md.push("");
  md.push("## Manifest");
  md.push("");
  md.push("| Task | Dashboard | Charts | Datasets | Screenshot | Size | Dimensions |");
  md.push("|---|---:|---:|---:|---|---:|---|");
  for (const item of items) {
    const e = item.evidence;
    md.push(`| ${e.task_id} | ${e.dashboard_id} | ${e.api_chart_count ?? ""} | ${e.api_dataset_count ?? ""} | ${e.screenshot_ok ? e.screenshot_path : `FAILED: ${truncate(e.screenshot_error, 80)}`} | ${e.screenshot_bytes || ""} | ${e.screenshot_width && e.screenshot_height ? `${e.screenshot_width}x${e.screenshot_height}` : ""} |`);
  }
  md.push("");
  md.push("## Per-Dashboard Evidence");
  for (const item of items) {
    const { task, result, evidence: e } = item;
    const charts = resultCharts(result);
    md.push("");
    md.push(`### ${task.id} — dashboard #${e.dashboard_id}`);
    md.push("");
    md.push(`NL request: ${task.nl_request}`);
    md.push("");
    md.push(`Expected viz families: ${splitSemi(task.expected_viz_type).join(", ") || "-"}`);
    md.push("");
    md.push(`Screenshot: ${e.screenshot_ok ? e.screenshot_path : `failed (${e.screenshot_error || "unknown"})`}`);
    md.push("");
    md.push("| Chart | Viz | Dataset | Rowcount | Validation |");
    md.push("|---:|---|---:|---:|---|");
    for (const chart of charts) {
      md.push(`| ${chart.chart_id} | ${chart.viz_type} | ${chart.dataset_id} | ${chart.chart_data?.rowcount ?? ""} | ${(chart.validation?.errors || []).length ? "errors" : "ok"} |`);
    }
  }

  const prefill = [];
  prefill.push("# Dashboard Grading Agent Prefill - Financial Formal Benchmark");
  prefill.push("");
  prefill.push(`Generated: ${generatedAt}`);
  prefill.push("");
  prefill.push("This is an agent-assisted prefill for the 10 `SkillGuidedAgent` dashboard tasks. It combines stored chart-data evidence, Superset dashboard metadata, and serial dashboard screenshots. Treat it as a grading aid; final paper numbers should still receive human spot-checking.");
  prefill.push("");
  prefill.push("Score scale: 0 / 1 / 2.");
  prefill.push("");
  prefill.push("## Aggregate");
  prefill.push("");
  prefill.push("| System | Tasks | Dimensions | Avg / 2 | Normalized % |");
  prefill.push("|---|---:|---:|---:|---:|");
  const total = items.reduce((sum, item) => sum + Object.values(item.grades).reduce((s, g) => s + g.score, 0), 0);
  const dims = items.reduce((sum, item) => sum + Object.keys(item.grades).length, 0);
  prefill.push(`| ${SYSTEM} | ${items.length} | ${dims} | ${(total / dims).toFixed(2)} | ${((total / (dims * 2)) * 100).toFixed(1)} |`);
  prefill.push("");
  for (const item of items) {
    prefill.push("---", "");
    prefill.push(`## task: ${item.task.id} | system: ${SYSTEM}`);
    prefill.push("");
    prefill.push(`NL request: ${truncate(item.task.nl_request, 260)}`);
    prefill.push("");
    prefill.push(`Artifact link: Superset dashboard #${item.evidence.dashboard_id} (internal URL omitted)`);
    prefill.push(`Screenshot: ${item.evidence.screenshot_ok ? item.evidence.screenshot_path : `failed (${item.evidence.screenshot_error || "unknown"})`}`);
    prefill.push("");
    prefill.push("### Rubric: rubric_dashboard");
    prefill.push("");
    for (const [name, grade] of Object.entries(item.grades)) {
      prefill.push(`- dimension: ${name}`);
      prefill.push(`  score: ${grade.score}`);
      prefill.push(`  comment: [agent_prefill] ${grade.comment.replace(/\s+/g, " ").trim()}`);
      prefill.push("");
    }
    prefill.push(`Average score: ${average(item.grades).toFixed(2)} / 2`);
    prefill.push("");
  }

  writeFileSync(path.join(outAbs, "screenshot-manifest.tsv"), `${manifest.join("\n")}\n`);
  writeFileSync(path.join(outAbs, "dashboard-evidence.md"), `${md.join("\n")}\n`);
  writeFileSync(path.join(outAbs, "dashboard-grading-agent-prefill.md"), `${prefill.join("\n").replace(/\n+$/u, "")}\n`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "screenshot-manifest.tsv"))}`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "dashboard-evidence.md"))}`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "dashboard-grading-agent-prefill.md"))}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const tasks = loadTasks(CSV).filter((task) => task.dataset === "financial" && task.class === "dashboard");
  const selected = args["task-id"] ? tasks.filter((task) => task.id === args["task-id"]) : tasks;
  if (!selected.length) throw new Error("No financial dashboard tasks selected.");

  const items = [];
  for (const task of selected) {
    items.push(await collectOne(task, args));
  }
  writeOutputs(items);
}

main().catch((err) => {
  console.error(`Error: ${safeError(err)}`);
  process.exitCode = 1;
});
