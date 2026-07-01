#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_RESULTS_DIR,
  DEFAULT_SMOKE_CSV,
  ROOT,
  SYSTEMS,
  artifactText,
  loadTasks,
  parseArgs,
  readJson,
  resultPath,
  truncate,
} from "./common.mjs";

const MANUAL_CLASSES = new Set(["dashboard", "analysis", "rca"]);

function classifyResult(task, result) {
  if (!result) return { status: "missing", score: 0, reason: "result file missing" };
  if (result.error) return { status: "error", score: 0, reason: result.error };
  if (!result.success) return { status: "failed", score: 0, reason: "success=false" };
  if (result.dry_run) return { status: "dry_run", score: null, reason: "not scored; dry-run artifact only" };
  if (task.class === "query") {
    if (Array.isArray(result.raw_response?.query_results) && result.raw_response.query_results.length) {
      return { status: "executed_result_set_needs_review", score: null, reason: "SQL executed; compare result set against ground truth" };
    }
    return result.sql ? { status: "needs_sql_execution", score: null, reason: "SQL produced; result-set execution not implemented for this environment" } : { status: "no_sql", score: 0, reason: "missing SQL" };
  }
  if (task.class === "chart") {
    const spec = result.chart_spec || {};
    const viz = typeof spec === "object" ? spec.viz_type : "";
    if (task.expected_viz_type && viz && String(viz).toLowerCase().includes(task.expected_viz_type.toLowerCase())) {
      return { status: "viz_type_match_needs_review", score: null, reason: "viz type matched; semantic review still required" };
    }
    return { status: "needs_chart_review", score: null, reason: "chart semantic review required" };
  }
  return { status: "needs_human_grading", score: null, reason: "manual rubric required" };
}

function makeSummary(tasks, outDir) {
  const rows = [];
  const bySystemClass = new Map();
  for (const system of SYSTEMS) {
    for (const task of tasks) {
      const file = resultPath(outDir, system, task.id);
      const result = existsSync(file) ? readJson(file) : null;
      const verdict = classifyResult(task, result);
      const key = `${system}\t${task.class}`;
      const group = bySystemClass.get(key) || { system, class: task.class, total: 0, success: 0, missing: 0, errors: 0, dry_run: 0, needs_review: 0 };
      group.total += 1;
      if (!result) group.missing += 1;
      else if (result.error || !result.success) group.errors += 1;
      else if (result.dry_run) group.dry_run += 1;
      else group.success += 1;
      if (verdict.score === null) group.needs_review += 1;
      bySystemClass.set(key, group);
      rows.push({ task, system, result, verdict, file });
    }
  }
  return { rows, groups: [...bySystemClass.values()] };
}

function writeSummary(tasks, outDir, title = "Smoke Benchmark Summary") {
  const { rows, groups } = makeSummary(tasks, outDir);
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Tasks: ${tasks.length}`);
  lines.push("");
  lines.push(`| System | Class | Total | Success | Missing | Errors | Dry-run | Needs review |`);
  lines.push(`|---|---:|---:|---:|---:|---:|---:|---:|`);
  for (const g of groups) {
    lines.push(`| ${g.system} | ${g.class} | ${g.total} | ${g.success} | ${g.missing} | ${g.errors} | ${g.dry_run} | ${g.needs_review} |`);
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- Dry-run rows validate runner plumbing but are not quality-scored.");
  lines.push("- Query rows marked `needs_sql_execution` produced SQL only; rows marked `executed_result_set_needs_review` already ran and need result-equivalence review.");
  lines.push("- Dashboard, analysis, and RCA entries are emitted to `grading-sheet.md` for human scoring.");
  lines.push("");
  lines.push("## Per-result Status");
  lines.push("");
  lines.push(`| Task | System | Status | Reason |`);
  lines.push(`|---|---|---|---|`);
  for (const row of rows) {
    lines.push(`| ${row.task.id} | ${row.system} | ${row.verdict.status} | ${String(row.verdict.reason).replace(/\|/g, "\\|")} |`);
  }

  const outPath = path.resolve(ROOT, outDir, "summary.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${lines.join("\n")}\n`);
  return outPath;
}

function quoteArtifact(text) {
  const excerpt = truncate(text || "-", 800);
  return excerpt.split(/\r?\n/).map((line) => `> ${line}`).join("\n");
}

function blockFor(task, system, result, outDir) {
  const artifact = artifactText(result);
  const header = [
    "---",
    "",
    `## task: ${task.id} | system: ${system}`,
    "",
    `NL request: ${truncate(task.nl_request, 200)}`,
    "",
  ];
  if (task.class === "dashboard") {
    const dashboardId = result?.artifact?.dashboard_id;
    const artifactLink = dashboardId
      ? `Superset dashboard #${dashboardId} (internal URL omitted)`
      : (path.relative(ROOT, resultPath(outDir, system, task.id)));
    return [
      ...header,
      `Artifact link: ${artifactLink}`,
      "",
      "### Rubric: rubric_dashboard",
      "",
      "- dimension: dashboard_create_success",
      "  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.",
      "  score:",
      "  comment:",
      "",
      "- dimension: expected_charts_present",
      "  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.",
      "  score:",
      "  comment:",
      "",
      "- dimension: dataset_metric_correctness",
      "  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.",
      "  score:",
      "  comment:",
      "",
      "- dimension: viz_type_appropriateness",
      "  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).",
      "  score:",
      "  comment:",
      "",
      "- dimension: layout_legibility",
      "  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.",
      "  score:",
      "  comment:",
      "",
      "- dimension: render_and_screenshot",
      "  description: Dashboard query/screenshot succeeds; no broken cells.",
      "  score:",
      "  comment:",
      "",
      "Notes (optional):",
      "",
    ].join("\n");
  }
  if (task.class === "analysis") {
    return [
      ...header,
      "Artifact (analysis report text):",
      quoteArtifact(artifact),
      "",
      "### Rubric: rubric_analysis",
      "",
      "- dimension: latest_value_correct",
      "  description: The latest-period value(s) reported in the analysis match the underlying queried data.",
      "  score:",
      "  comment:",
      "",
      "- dimension: baseline_correct",
      "  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.",
      "  score:",
      "  comment:",
      "",
      "- dimension: percentage_change_correct",
      "  description: Period-over-period or segment-over-segment percentages are arithmetically correct.",
      "  score:",
      "  comment:",
      "",
      "- dimension: trend_direction_correct",
      "  description: Direction of trends (up, down, flat, oscillating) is correctly described.",
      "  score:",
      "  comment:",
      "",
      "- dimension: evidence_supported",
      "  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).",
      "  score:",
      "  comment:",
      "",
      "- dimension: separates_observation_from_hypothesis",
      "  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.",
      "  score:",
      "  comment:",
      "",
      "Notes (optional):",
      "",
    ].join("\n");
  }
  return [
    ...header,
    "Artifact (RCA report text):",
    quoteArtifact(artifact),
    "",
    "### Rubric: rubric_rca",
    "",
    "- dimension: anomaly_correctly_identified",
    "  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.",
    "  score:",
    "  comment:",
    "",
    "- dimension: drilldown_dimensions_correct",
    "  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.",
    "  score:",
    "  comment:",
    "",
    "- dimension: top_contributor_correct",
    "  description: The agent's claimed top contributor is supported by the data and not misleading.",
    "  score:",
    "  comment:",
    "",
    "- dimension: evidence_from_executed_queries",
    "  description: Each contributing factor is backed by a specific executed query whose result is shown.",
    "  score:",
    "  comment:",
    "",
    "- dimension: actionable_and_concise",
    "  description: The conclusion is concise; a stakeholder reading it would know what to do next.",
    "  score:",
    "  comment:",
    "",
    "Notes (optional):",
    "",
  ].join("\n");
}

function writeGradingSheet(tasks, outDir, title = "Smoke Benchmark") {
  const blocks = [];
  const manualTasks = tasks.filter((task) => MANUAL_CLASSES.has(task.class));
  blocks.push(`# Grading Sheet - ${title} - ${new Date().toISOString().slice(0, 10)}`);
  blocks.push("");
  blocks.push("Score scale: 0 / 1 / 2 (see `tasks/benchmark-scoring-rubric.md`).");
  blocks.push("- 0: failed, invalid, empty, unsupported by data, or wrong artifact.");
  blocks.push("- 1: partially correct; main intent visible but important fields missing/wrong.");
  blocks.push("- 2: correct and useful; satisfied the request and supported by evidence.");
  blocks.push("");
  blocks.push(`Total tasks: ${manualTasks.length}. Total grading entries: ${manualTasks.length * SYSTEMS.length}.`);
  blocks.push("");
  blocks.push("Fill in the `score:` line on each rubric dimension. Do not change parser-critical lines.");
  blocks.push("");
  for (const task of manualTasks) {
    for (const system of SYSTEMS) {
      const file = resultPath(outDir, system, task.id);
      const result = existsSync(file) ? readJson(file) : null;
      blocks.push(blockFor(task, system, result, outDir));
    }
  }
  const outPath = path.resolve(ROOT, outDir, "grading-sheet.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${blocks.join("\n").replace(/\n+$/u, "")}\n`);
  return outPath;
}

function parseFilledSheet(filePath) {
  const text = readFileSync(filePath, "utf8");
  const scores = [...text.matchAll(/^- dimension: (\w+)\n  description: .*\n  score: ([0-2])$/gm)].map((m) => Number(m[2]));
  return { score_count: scores.length, raw_total: scores.reduce((a, b) => a + b, 0) };
}

const args = parseArgs(process.argv.slice(2));
const csv = args.csv || DEFAULT_SMOKE_CSV;
const outDir = args.out || DEFAULT_RESULTS_DIR;
const tasks = loadTasks(csv).filter((task) => {
  if (args.dataset && task.dataset !== args.dataset) return false;
  if (args.layer && task.layer !== args.layer) return false;
  if (args["task-class"] && task.class !== args["task-class"]) return false;
  return true;
});
const title = args.title || (args.dataset ? `${args.dataset} Benchmark Summary` : "Smoke Benchmark Summary");
const sheetTitle = args.title || (args.dataset ? `${args.dataset} Benchmark` : "Smoke Benchmark");
const summaryPath = writeSummary(tasks, outDir, title);
const gradingPath = writeGradingSheet(tasks, outDir, sheetTitle);
console.log(`wrote ${path.relative(ROOT, summaryPath)}`);
console.log(`wrote ${path.relative(ROOT, gradingPath)}`);
if (args["parse-grades"]) {
  const parsed = parseFilledSheet(path.resolve(ROOT, args["parse-grades"]));
  console.log(JSON.stringify(parsed, null, 2));
}
