#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, SYSTEMS, loadTasks, parseArgs, readJson, resultPath, splitSemi } from "./common.mjs";

const OUT_DIR = "results/nvbench-layer2-formal";

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function words(value) {
  return String(value || "").toLowerCase().match(/[a-z0-9]+/g) || [];
}

function expectedVizToken(viz) {
  const n = norm(viz);
  if (n.includes("groupingline")) return "line";
  if (n.includes("stackedbar")) return "bar";
  if (n.includes("groupingscatter")) return "scatter";
  if (n.includes("line")) return "line";
  if (n.includes("bar")) return "bar";
  if (n.includes("pie")) return "pie";
  if (n.includes("scatter")) return "scatter";
  return n;
}

function actualVizToken(result) {
  const values = [
    result?.chart_spec?.viz_type,
    result?.chart_spec?.superset_viz_type,
    result?.raw_response?.chart_spec?.viz_type,
  ].filter(Boolean).join(" ");
  return expectedVizToken(values);
}

function specText(result, key) {
  const direct = result?.chart_spec?.[key];
  const raw = result?.raw_response?.chart_spec?.[key];
  return JSON.stringify(direct ?? raw ?? "");
}

function coverageScore(expected, actualText) {
  const expectedParts = splitSemi(expected).flatMap(words).filter((w) => !["count", "sum", "avg", "average"].includes(w));
  if (!expectedParts.length) return { score: 1, matched: [], expected: [] };
  const haystack = norm(actualText);
  const matched = expectedParts.filter((part) => haystack.includes(norm(part)));
  return { score: matched.length / expectedParts.length, matched, expected: expectedParts };
}

function classify(task, system, result) {
  if (!result) {
    return {
      task_id: task.id,
      system,
      status: "missing",
      artifact_execution: 0,
      viz_type: 0,
      metric: 0,
      dimension: 0,
      auto_score_2pt: 0,
      notes: "result file missing",
    };
  }

  const expectedViz = expectedVizToken(task.expected_viz_type);
  const actualViz = actualVizToken(result);
  const vizType = expectedViz && actualViz && actualViz.includes(expectedViz) ? 1 : 0;
  const metric = coverageScore(task.expected_metrics, specText(result, "metrics"));
  const dimension = coverageScore(task.expected_dimensions, specText(result, "dimensions"));
  const requiresArtifactExecution = system === "SkillGuidedAgent" || system === "NoChartParamRefsAgent";
  const execution = requiresArtifactExecution
    ? (result.success && result.artifact?.verification?.ok ? 1 : 0)
    : null;

  const specScore = (vizType + metric.score + dimension.score) / 3;
  const autoScore = requiresArtifactExecution
    ? 2 * ((specScore * 0.6) + ((execution || 0) * 0.4))
    : 2 * specScore;

  const notes = [];
  if (!requiresArtifactExecution) notes.push("spec-only; no Superset artifact execution");
  if (requiresArtifactExecution) {
    if (result.artifact?.verification?.ok) {
      notes.push(`chart #${result.artifact?.chart_id}; rows=${result.artifact?.verification?.row_count}`);
    } else if (result.success) {
      notes.push("chart spec produced but no Superset artifact execution/verification evidence");
    } else {
      notes.push(`artifact failed: ${result.error}`);
    }
  }
  if (!vizType) notes.push(`viz mismatch expected=${task.expected_viz_type} actual=${result.chart_spec?.viz_type || result.chart_spec?.superset_viz_type || ""}`);
  if (metric.score < 1) notes.push(`metric partial matched=${metric.matched.join("/") || "-"} expected=${metric.expected.join("/")}`);
  if (dimension.score < 1) notes.push(`dimension partial matched=${dimension.matched.join("/") || "-"} expected=${dimension.expected.join("/")}`);

  return {
    task_id: task.id,
    system,
    status: result.success ? "ok" : "error",
    artifact_execution: execution,
    viz_type: vizType,
    metric: metric.score,
    dimension: dimension.score,
    auto_score_2pt: Number(autoScore.toFixed(2)),
    notes: notes.join("; "),
  };
}

function mean(values) {
  const nums = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function writeOutputs(verdicts, tasks, outDir, systems = SYSTEMS) {
  const bySystem = new Map();
  for (const v of verdicts) {
    const g = bySystem.get(v.system) || [];
    g.push(v);
    bySystem.set(v.system, g);
  }

  const summary = [];
  summary.push("# NVBench Layer-2 NL2Chart Benchmark Summary");
  summary.push("");
  summary.push(`Generated: ${new Date().toISOString()}`);
  summary.push(`Tasks: ${tasks.length}`);
  summary.push("");
  summary.push("| System | Results | Artifact execution | Mean viz type | Mean metric | Mean dimension | Mean auto score / 2 |");
  summary.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const system of systems) {
    const rows = bySystem.get(system) || [];
    const present = rows.filter((r) => r.status !== "missing").length;
    const artifactRows = rows.filter((r) => typeof r.artifact_execution === "number");
    const artifactOk = artifactRows.filter((r) => r.artifact_execution === 1).length;
    summary.push(`| ${system} | ${present}/${tasks.length} | ${artifactRows.length ? `${artifactOk}/${artifactRows.length}` : "n/a"} | ${mean(rows.map((r) => r.viz_type))?.toFixed(2) ?? "n/a"} | ${mean(rows.map((r) => r.metric))?.toFixed(2) ?? "n/a"} | ${mean(rows.map((r) => r.dimension))?.toFixed(2) ?? "n/a"} | ${mean(rows.map((r) => r.auto_score_2pt))?.toFixed(2) ?? "n/a"} |`);
  }
  summary.push("");
  summary.push("## Interpretation Notes");
  summary.push("");
  summary.push("- DirectLLM and SchemaGroundedLLM rows are scored as chart-spec generation only when their result JSON exists; they do not prove a Superset artifact can be created.");
  summary.push("- SkillGuidedAgent includes Superset artifact execution: task-level virtual dataset creation from validated PostgreSQL oracle SQL, chart creation, chart-data query, and serial screenshot verification.");
  summary.push("- `auto_score_2pt` is a prefilled heuristic, not the final paper score. Human/agent spot-check should inspect ambiguous chart semantics and screenshots before copying numbers into the manuscript.");
  summary.push("");
  summary.push("## Per-task Status");
  summary.push("");
  summary.push("| Task | System | Status | Artifact | Viz | Metric | Dimension | Auto / 2 | Notes |");
  summary.push("|---|---|---|---:|---:|---:|---:|---:|---|");
  for (const v of verdicts) {
    summary.push(`| ${v.task_id} | ${v.system} | ${v.status} | ${v.artifact_execution ?? "n/a"} | ${v.viz_type.toFixed(2)} | ${v.metric.toFixed(2)} | ${v.dimension.toFixed(2)} | ${v.auto_score_2pt.toFixed(2)} | ${v.notes.replace(/\|/g, "\\|")} |`);
  }

  const grading = [];
  grading.push("# NVBench Layer-2 Grading Sheet - Prefilled");
  grading.push("");
  grading.push(`Generated: ${new Date().toISOString()}`);
  grading.push("");
  grading.push("Score scale: 0 / 1 / 2. This sheet is prefilled by deterministic checks and should be spot-checked before manuscript use.");
  grading.push("");
  for (const v of verdicts) {
    grading.push("---");
    grading.push("");
    grading.push(`## task: ${v.task_id} | system: ${v.system}`);
    grading.push("");
    grading.push(`prefilled_score: ${v.auto_score_2pt}`);
    grading.push(`status: ${v.status}`);
    grading.push(`artifact_execution: ${v.artifact_execution ?? "n/a"}`);
    grading.push(`viz_type_match: ${v.viz_type}`);
    grading.push(`metric_coverage: ${v.metric.toFixed(2)}`);
    grading.push(`dimension_coverage: ${v.dimension.toFixed(2)}`);
    grading.push(`comment: ${v.notes}`);
    grading.push("");
  }

  const ablation = [];
  const skillRows = bySystem.get("SkillGuidedAgent") || [];
  ablation.push("# NVBench Layer-2 Ablation Summary");
  ablation.push("");
  ablation.push(`Generated: ${new Date().toISOString()}`);
  ablation.push("");
  ablation.push("| Arm | Removed capability | Evidence captured | Current result |");
  ablation.push("|---|---|---|---|");
  ablation.push("| DirectLLM | schema grounding and Superset skill/tool execution | chart spec only | scored if archived result JSON exists |");
  ablation.push("| SchemaGroundedLLM | Superset skill/tool execution | schema-grounded chart spec only | scored if archived result JSON exists |");
  ablation.push(`| SkillGuidedAgent | none | virtual dataset + chart + chart-data + serial screenshot | ${skillRows.filter((r) => r.artifact_execution === 1).length}/${tasks.length} artifacts verified |`);
  ablation.push("");
  ablation.push("The most concrete Layer-2 ablation signal is execution capability: only SkillGuidedAgent proves that the generated chart can be materialized and rendered in Superset. DirectLLM and SchemaGroundedLLM may still produce plausible chart specs, but without the skill/tool layer those specs remain unexecuted plans.");

  mkdirSync(path.resolve(ROOT, outDir), { recursive: true });
  writeFileSync(path.resolve(ROOT, outDir, "summary.md"), `${summary.join("\n")}\n`);
  writeFileSync(path.resolve(ROOT, outDir, "grading-sheet-prefilled.md"), `${grading.join("\n")}\n`);
  writeFileSync(path.resolve(ROOT, outDir, "ablation-summary.md"), `${ablation.join("\n")}\n`);
}

const args = parseArgs(process.argv.slice(2));
const csv = args.csv || "tasks/nl2bi-benchmark.csv";
const outDir = args.out || OUT_DIR;
const tasks = loadTasks(csv).filter((task) => task.layer === "2" && task.class === "chart");
const verdicts = [];
const systems = args.systems
  ? String(args.systems).split(",").map((s) => s.trim()).filter(Boolean)
  : SYSTEMS;
for (const task of tasks) {
  for (const system of systems) {
    const file = resultPath(outDir, system, task.id);
    const result = existsSync(file) ? readJson(file) : null;
    verdicts.push(classify(task, system, result));
  }
}
writeOutputs(verdicts, tasks, outDir, systems);
console.log(`wrote ${path.relative(ROOT, path.resolve(ROOT, outDir, "summary.md"))}`);
console.log(`wrote ${path.relative(ROOT, path.resolve(ROOT, outDir, "grading-sheet-prefilled.md"))}`);
console.log(`wrote ${path.relative(ROOT, path.resolve(ROOT, outDir, "ablation-summary.md"))}`);
