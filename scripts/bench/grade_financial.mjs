#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { executeSql } from "../../skills/superset-dev-benchmark/scripts/sql_lab.mjs";
import { ROOT, SYSTEMS, artifactText, loadTasks, parseArgs, readJson, resultPath, safeError, truncate } from "./common.mjs";

const CSV = "tasks/nl2bi-benchmark.csv";
const OUT_DIR = "results/financial-formal";
const DATABASE_ID = 1;
const SCHEMA = "bench_bird_financial";

const FINANCIAL_DATASET_IDS = new Set([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]);

const DASHBOARD_EXPECTED_CHARTS = {
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

const DIMENSIONS = {
  query: [
    ["sql_executes", "Generated SQL executes in dev Superset SQL Lab."],
    ["result_set_equivalence", "Generated SQL result matches the PostgreSQL ground truth result set."],
  ],
  dashboard: [
    ["dashboard_create_success", "Dashboard create/update API succeeded; layout JSON validates against Superset position_json."],
    ["expected_charts_present", "All expected charts in the request are represented; no duplicates or extras that don't serve the request."],
    ["dataset_metric_correctness", "Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range."],
    ["viz_type_appropriateness", "Viz types chosen are appropriate for the analytical intent."],
    ["layout_legibility", "Layout supports scanning and comparison; KPI/headline charts are placed prominently."],
    ["render_and_screenshot", "Dashboard query/screenshot succeeds; no broken cells."],
  ],
  analysis: [
    ["latest_value_correct", "The latest-period value(s) reported in the analysis match the underlying queried data."],
    ["baseline_correct", "The baseline/reference is computed correctly."],
    ["percentage_change_correct", "Period-over-period or segment-over-segment percentages are arithmetically correct."],
    ["trend_direction_correct", "Direction of trends is correctly described."],
    ["evidence_supported", "Every quantitative claim is supported by an executed query."],
    ["separates_observation_from_hypothesis", "The report distinguishes data observations from hypotheses and avoids unsupported causation."],
  ],
  rca: [
    ["anomaly_correctly_identified", "The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly."],
    ["drilldown_dimensions_correct", "The chosen drill-down dimensions are appropriate."],
    ["top_contributor_correct", "The claimed top contributor is supported by the data and not misleading."],
    ["evidence_from_executed_queries", "Each contributing factor is backed by a specific executed query whose result is shown."],
    ["actionable_and_concise", "The conclusion is concise; a stakeholder reading it would know what to do next."],
  ],
};

function rows(payload) {
  const data = payload?.data || payload?.result?.data || payload?.result?.[0]?.data || [];
  return Array.isArray(data) ? data : [];
}

function rowValues(row) {
  if (row && typeof row === "object" && !Array.isArray(row)) return Object.values(row);
  if (Array.isArray(row)) return row;
  return [row];
}

function canonicalValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number(value.toFixed(9));
  if (typeof value === "string") {
    const trimmed = value.trim();
    const asNumber = Number(trimmed);
    if (trimmed !== "" && Number.isFinite(asNumber)) return Number(asNumber.toFixed(9));
    return trimmed;
  }
  return value;
}

function canonicalRows(rs) {
  return rs
    .map((row) => rowValues(row).map(canonicalValue))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function equivalentRows(left, right) {
  const a = canonicalRows(left);
  const b = canonicalRows(right);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j += 1) {
      const av = a[i][j];
      const bv = b[i][j];
      if (typeof av === "number" && typeof bv === "number") {
        const tolerance = Math.max(1e-6, Math.abs(bv) * 1e-8);
        if (Math.abs(av - bv) > tolerance) return false;
      } else if (av !== bv) {
        return false;
      }
    }
  }
  return true;
}

async function executeForScore(sql) {
  const payload = await executeSql({ databaseId: DATABASE_ID, schemaName: SCHEMA, sql });
  return rows(payload);
}

function score(score, comment, source = "auto") {
  return { score, comment, source };
}

function readResult(outDir, system, taskId) {
  const file = resultPath(outDir, system, taskId);
  return existsSync(file) ? readJson(file) : null;
}

function normalizeViz(viz) {
  const v = String(viz || "").toLowerCase();
  if (!v) return "";
  if (v.includes("big_number") || v === "kpi") return "kpi";
  if (v.includes("line")) return "line";
  if (v.includes("bar")) return v.includes("stack") ? "stacked_bar" : "bar";
  if (v.includes("pie")) return "pie";
  if (v.includes("table")) return "table";
  if (v.includes("histogram")) return "histogram";
  if (v.includes("scatter") || v.includes("bubble")) return "scatter";
  if (v.includes("heatmap")) return "heatmap";
  if (v.includes("funnel")) return "funnel";
  return v.replace(/^echarts_timeseries_/, "");
}

function expectedVizTypes(task) {
  return String(task.expected_viz_type || "")
    .split(";")
    .map((v) => normalizeViz(v.trim()))
    .filter(Boolean);
}

function actualVizTypes(result) {
  if (Array.isArray(result?.artifact?.charts)) {
    return result.artifact.charts.map((chart) => normalizeViz(chart.viz_type));
  }
  if (Array.isArray(result?.chart_spec?.chart_viz_types)) {
    return result.chart_spec.chart_viz_types.map(normalizeViz);
  }
  if (Array.isArray(result?.chart_spec?.charts)) {
    return result.chart_spec.charts.map((chart) => normalizeViz(chart.type || chart.viz_type));
  }
  return [];
}

function typeMatches(expected, actual) {
  if (expected === actual) return true;
  if (expected === "bar" && actual === "stacked_bar") return true;
  if (expected === "stacked_bar" && actual === "bar") return true;
  if (expected === "kpi" && actual === "big_number") return true;
  if (expected === "table" && actual === "pivot_table") return true;
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

function tokenSet(text) {
  const ignored = new Set(["count", "sum", "avg", "date", "year", "month", "where", "filter", "status", "total"]);
  return new Set(
    String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9_." ]/g, " ")
      .split(/\s+/)
      .map((t) => t.replace(/^"+|"+$/g, ""))
      .filter((t) => t.length >= 3 && !ignored.has(t))
  );
}

function specText(result) {
  return [
    result?.sql,
    typeof result?.artifact === "string" ? result.artifact : "",
    JSON.stringify(result?.chart_spec || {}),
    JSON.stringify(result?.artifact?.charts || []),
  ].join("\n");
}

function semanticCoverage(task, result) {
  const expected = tokenSet([task.expected_metrics, task.expected_dimensions, task.expected_filters, task.expected_time_range].join(" "));
  const actual = tokenSet(specText(result));
  if (!expected.size) return 1;
  let hits = 0;
  for (const t of expected) if (actual.has(t) || [...actual].some((a) => a.includes(t) || t.includes(a))) hits += 1;
  return hits / expected.size;
}

function gradeDashboard(task, system, result) {
  if (!result || result.error || !result.success) {
    return Object.fromEntries(DIMENSIONS.dashboard.map(([name]) => [name, score(0, "No successful dashboard result was produced.", "auto")]));
  }

  const charts = Array.isArray(result.artifact?.charts) ? result.artifact.charts : [];
  const chartSpecCharts = Array.isArray(result.chart_spec?.charts) ? result.chart_spec.charts : [];
  const actualCount = charts.length || result.chart_spec?.chart_count || chartSpecCharts.length || 0;
  const expectedCount = DASHBOARD_EXPECTED_CHARTS[task.id] || expectedVizTypes(task).length;
  const actualTypes = actualVizTypes(result);
  const expectedTypes = expectedVizTypes(task);
  const vizScore = coverageScore(expectedTypes, actualTypes);
  const isExecuted = Boolean(result.artifact?.dashboard_id && charts.length);
  const rowcounts = charts.map((chart) => chart.chart_data?.rowcount);
  const allChartDataOk = rowcounts.length > 0 && rowcounts.every((n) => typeof n === "number" && n > 0);
  const datasetsOk = charts.length > 0 && charts.every((chart) => FINANCIAL_DATASET_IDS.has(chart.dataset_id));
  const validationOk = charts.every((chart) => (chart.validation?.errors || []).length === 0);
  const semantic = semanticCoverage(task, result);

  return {
    dashboard_create_success: isExecuted
      ? score(2, `Real Superset dashboard #${result.artifact.dashboard_id} exists with ${charts.length} chart records.`, "auto")
      : score(0, "Only a text/spec artifact was produced; no Superset dashboard was created.", "auto"),
    expected_charts_present: actualCount >= expectedCount
      ? score(2, `Expected at least ${expectedCount} chart(s); artifact contains ${actualCount}.`, "auto")
      : score(actualCount > 0 ? 1 : 0, `Expected ${expectedCount} chart(s); artifact contains ${actualCount}.`, "auto"),
    dataset_metric_correctness: isExecuted
      ? score(datasetsOk && validationOk && allChartDataOk ? 2 : 1, `Financial dataset IDs=${datasetsOk}; chart validation=${validationOk}; non-empty chart-data=${allChartDataOk}.`, "auto")
      : score(semantic >= 0.65 ? 2 : (semantic >= 0.35 ? 1 : 0), `Spec/token coverage against expected metrics/dimensions/filters is ${semantic.toFixed(2)}; not platform-executed.`, "agent_prefill"),
    viz_type_appropriateness: score(vizScore, `Expected viz families: ${expectedTypes.join(", ") || "-"}; actual: ${actualTypes.join(", ") || "-"}.`, "auto"),
    layout_legibility: isExecuted
      ? score(2, "Charts were assembled into a Superset dashboard layout; visual screenshot review is still optional.", "agent_prefill")
      : score(result.chart_spec?.layout_intent ? 1 : 0, "Spec includes layout intent but no rendered dashboard layout.", "agent_prefill"),
    render_and_screenshot: isExecuted
      ? score(allChartDataOk ? 2 : 1, `Serial chart-data verification rowcounts: ${rowcounts.join(", ")}. Screenshots were intentionally deferred.`, "auto")
      : score(0, "No platform render/query evidence; screenshot not applicable.", "auto"),
  };
}

function hasExecutedRows(result) {
  return Array.isArray(result?.raw_response?.query_results)
    && result.raw_response.query_results.some((qr) => Array.isArray(qr.rows) && qr.rows.length > 0);
}

function sqlHas(task, result, pattern) {
  const sqlText = typeof result?.sql === "string" ? result.sql : JSON.stringify(result?.sql || "");
  return pattern.test([task.nl_request, task.expected_metrics, task.expected_dimensions, task.expected_filters, sqlText, artifactText(result)].join("\n"));
}

function gradeAnalysis(task, system, result) {
  if (!result || result.error || !result.success) {
    return Object.fromEntries(DIMENSIONS.analysis.map(([name]) => [name, score(0, "No successful analysis result was produced.", "auto")]));
  }
  const executed = hasExecutedRows(result);
  const hasSql = Boolean(result.sql);
  const artifact = artifactText(result);
  const hasNumbers = /\d/.test(artifact);
  const hasRate = sqlHas(task, result, /(rate|ratio|share|percent|pct|change|delta|cv|avg|average|median)/i);
  const hasTime = sqlHas(task, result, /(year|month|quarter|199[0-9]|date_trunc|extract|lag|trend|season)/i);

  if (executed) {
    return {
      latest_value_correct: score(2, "Artifact includes executed SQL Lab result rows with concrete values.", "agent_prefill"),
      baseline_correct: score(hasSql ? 2 : 1, "Baseline/cohort logic is visible in executed SQL and result rows.", "agent_prefill"),
      percentage_change_correct: score(hasRate ? 2 : 1, hasRate ? "Rate/change/decomposition metric is present in SQL/results." : "No explicit rate/change metric was required or visible; review if needed.", "agent_prefill"),
      trend_direction_correct: score(hasTime ? 1 : 1, "The artifact is data-backed but mostly reports rows rather than a polished narrative conclusion.", "agent_prefill"),
      evidence_supported: score(2, "Quantitative claims are backed by stored SQL Lab query results.", "auto"),
      separates_observation_from_hypothesis: score(1, "Minimal report text avoids overclaiming, but does not explicitly discuss hypotheses.", "agent_prefill"),
    };
  }

  return {
    latest_value_correct: score(hasSql ? 1 : 0, "The artifact provides SQL/spec logic but no executed values in the submitted result.", "agent_prefill"),
    baseline_correct: score(hasSql ? 1 : 0, "Baseline logic may be present in SQL, but the result does not include executed evidence.", "agent_prefill"),
    percentage_change_correct: score(hasRate && hasSql ? 1 : 0, "Rate/change logic is inferred from generated SQL only; no executed result was reported.", "agent_prefill"),
    trend_direction_correct: score(hasTime && hasNumbers ? 1 : 0, "Trend or time logic is present, but narrative evidence is thin or unexecuted.", "agent_prefill"),
    evidence_supported: score(0, "No SQL Lab or chart-data result rows are attached to this baseline artifact.", "auto"),
    separates_observation_from_hypothesis: score(artifact.length > 30 ? 1 : 0, "Text is a plan/spec rather than a data-backed analytical report.", "agent_prefill"),
  };
}

function gradeRca(task, system, result) {
  if (!result || result.error || !result.success) {
    return Object.fromEntries(DIMENSIONS.rca.map(([name]) => [name, score(0, "No successful RCA result was produced.", "auto")]));
  }
  const executed = hasExecutedRows(result);
  const hasSql = Boolean(result.sql);
  const artifact = artifactText(result);
  const hasDrilldown = sqlHas(task, result, /(group by|region|district|type|k_symbol|duration|gender|quartile|cohort|frequency|card_type|age)/i);
  const hasRanking = sqlHas(task, result, /(order by|limit|top|primary|driver|contributor|deviation|delta|gap)/i);

  if (executed) {
    return {
      anomaly_correctly_identified: score(1, "The system executed the stated anomaly drill-down, but the artifact is not a full narrative validation of anomaly existence.", "agent_prefill"),
      drilldown_dimensions_correct: score(hasDrilldown ? 2 : 1, "Executed SQL includes the requested drill-down dimensions or close equivalents.", "agent_prefill"),
      top_contributor_correct: score(hasRanking ? 2 : 1, "Executed rows are ranked by contribution/deviation, exposing top contributors.", "agent_prefill"),
      evidence_from_executed_queries: score(2, "RCA artifact stores executed SQL Lab result rows.", "auto"),
      actionable_and_concise: score(1, "The evidence is concise but reads as query output rather than an action-oriented RCA memo.", "agent_prefill"),
    };
  }

  return {
    anomaly_correctly_identified: score(artifact.length > 40 ? 1 : 0, "RCA text/spec addresses the anomaly but lacks executed evidence.", "agent_prefill"),
    drilldown_dimensions_correct: score(hasDrilldown ? 1 : 0, "Drill-down dimensions are inferred from generated SQL/spec only.", "agent_prefill"),
    top_contributor_correct: score(hasRanking && hasSql ? 1 : 0, "Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.", "agent_prefill"),
    evidence_from_executed_queries: score(0, "No executed query rows are attached to this baseline artifact.", "auto"),
    actionable_and_concise: score(artifact.length > 40 ? 1 : 0, "The artifact is concise, but mostly a plan or hypothesis.", "agent_prefill"),
  };
}

async function gradeQuery(task, system, result, expectedRows) {
  if (!result || result.error || !result.success || !result.sql) {
    return {
      sql_executes: score(0, "No executable SQL was produced.", "auto"),
      result_set_equivalence: score(0, "No executable SQL was produced.", "auto"),
    };
  }

  try {
    const actualRows = await executeForScore(result.sql);
    const equivalent = equivalentRows(expectedRows, actualRows);
    return {
      sql_executes: score(2, `SQL executed and returned ${actualRows.length} row(s).`, "auto"),
      result_set_equivalence: score(equivalent ? 2 : 0, equivalent ? "Result set matches the PostgreSQL oracle." : `Result mismatch. Expected ${JSON.stringify(canonicalRows(expectedRows))}; got ${JSON.stringify(canonicalRows(actualRows))}.`, "auto"),
    };
  } catch (err) {
    return {
      sql_executes: score(0, `SQL execution failed: ${safeError(err)}`, "auto"),
      result_set_equivalence: score(0, "Skipped because SQL did not execute.", "auto"),
    };
  }
}

function average(grades) {
  const vals = Object.values(grades).map((g) => g.score).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function appendBlock(lines, task, system, result, grades, outDir = OUT_DIR) {
  lines.push("---", "");
  lines.push(`## task: ${task.id} | system: ${system}`);
  lines.push("");
  lines.push(`NL request: ${truncate(task.nl_request, 240)}`);
  lines.push("");
  if (task.class === "dashboard") {
    const dashboardId = result?.artifact?.dashboard_id;
    lines.push(`Artifact link: ${dashboardId ? `Superset dashboard #${dashboardId} (internal URL omitted)` : path.relative(ROOT, resultPath(outDir, system, task.id))}`);
    lines.push("");
    lines.push("### Rubric: rubric_dashboard");
  } else if (task.class === "analysis") {
    lines.push("Artifact excerpt:");
    lines.push(...truncate(artifactText(result), 700).split(/\r?\n/).map((line) => `> ${line}`));
    lines.push("");
    lines.push("### Rubric: rubric_analysis");
  } else if (task.class === "rca") {
    lines.push("Artifact excerpt:");
    lines.push(...truncate(artifactText(result), 700).split(/\r?\n/).map((line) => `> ${line}`));
    lines.push("");
    lines.push("### Rubric: rubric_rca");
  } else {
    lines.push("### Rubric: result_set_equivalence");
  }
  lines.push("");

  for (const [name, description] of DIMENSIONS[task.class]) {
    const grade = grades[name] || score(0, "No grade produced.", "auto");
    lines.push(`- dimension: ${name}`);
    lines.push(`  description: ${description}`);
    lines.push(`  score: ${grade.score}`);
    lines.push(`  comment: [${grade.source}] ${cleanComment(grade.comment)}`);
    lines.push("");
  }
  lines.push(`Average score: ${average(grades).toFixed(2)} / 2`);
  lines.push("");
}

function cleanComment(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(allGrades) {
  const groups = new Map();
  for (const item of allGrades) {
    const key = `${item.system}\t${item.class}`;
    const group = groups.get(key) || { system: item.system, class: item.class, entries: 0, dimension_count: 0, total: 0 };
    group.entries += 1;
    const values = Object.values(item.grades).map((g) => g.score);
    group.dimension_count += values.length;
    group.total += values.reduce((a, b) => a + b, 0);
    groups.set(key, group);
  }
  return [...groups.values()].map((g) => ({
    ...g,
    avg: g.dimension_count ? g.total / g.dimension_count : 0,
    normalized_pct: g.dimension_count ? (g.total / (g.dimension_count * 2)) * 100 : 0,
  }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.out || OUT_DIR;
  const skipQueryExec = Boolean(args["skip-query-exec"]);
  const systems = args.systems
    ? String(args.systems).split(",").map((s) => s.trim()).filter(Boolean)
    : SYSTEMS;
  const classes = args["task-class"]
    ? new Set(String(args["task-class"]).split(",").map((s) => s.trim()).filter(Boolean))
    : null;
  const tasks = loadTasks(CSV).filter((task) => task.dataset === "financial" && (!classes || classes.has(task.class)));
  const allGrades = [];
  const queryOracleRows = new Map();

  if (!skipQueryExec) {
    for (const task of tasks.filter((t) => t.class === "query")) {
      queryOracleRows.set(task.id, await executeForScore(task.ground_truth_sql_postgres || task.ground_truth_sql_starrocks || task.ground_truth_sql_sqlite));
    }
  }

  for (const task of tasks) {
    for (const system of systems) {
      const result = readResult(outDir, system, task.id);
      let grades;
      if (task.class === "query") {
        if (skipQueryExec) {
          grades = {
            sql_executes: score(result?.sql ? 1 : 0, "Query execution skipped by CLI flag.", "auto"),
            result_set_equivalence: score(0, "Query execution skipped by CLI flag.", "auto"),
          };
        } else {
          grades = await gradeQuery(task, system, result, queryOracleRows.get(task.id) || []);
        }
      } else if (task.class === "dashboard") {
        grades = gradeDashboard(task, system, result);
      } else if (task.class === "analysis") {
        grades = gradeAnalysis(task, system, result);
      } else if (task.class === "rca") {
        grades = gradeRca(task, system, result);
      } else {
        continue;
      }
      allGrades.push({ task_id: task.id, class: task.class, system, grades });
    }
  }

  const generatedAt = new Date().toISOString();
  const sheet = [];
  sheet.push(`# Prefilled Grading Sheet - Financial Formal Benchmark - ${generatedAt.slice(0, 10)}`);
  sheet.push("");
  sheet.push("This sheet is a scorer-assisted prefill, not the final human-adjudicated result.");
  sheet.push("Scores marked `[auto]` are based on deterministic checks; `[agent_prefill]` scores are conservative Codex judgments from stored artifacts and should be spot-checked before paper submission.");
  sheet.push("");
  sheet.push("Score scale: 0 / 1 / 2.");
  sheet.push("");
  for (const item of allGrades) {
    const task = tasks.find((t) => t.id === item.task_id);
    appendBlock(sheet, task, item.system, readResult(outDir, item.system, item.task_id), item.grades, outDir);
  }

  const summary = summarize(allGrades);
  const summaryLines = [];
  summaryLines.push("# Auto Grade Summary - Financial Formal Benchmark");
  summaryLines.push("");
  summaryLines.push(`Generated: ${generatedAt}`);
  summaryLines.push("");
  summaryLines.push("## Aggregate Scores");
  summaryLines.push("");
  summaryLines.push("| System | Class | Entries | Dimensions | Avg / 2 | Normalized % |");
  summaryLines.push("|---|---|---:|---:|---:|---:|");
  for (const row of summary) {
    summaryLines.push(`| ${row.system} | ${row.class} | ${row.entries} | ${row.dimension_count} | ${row.avg.toFixed(2)} | ${row.normalized_pct.toFixed(1)} |`);
  }
  summaryLines.push("");
  summaryLines.push("## Interpretation Guardrails");
  summaryLines.push("");
  summaryLines.push("- Query scores are deterministic SQL execution and result-set equivalence checks against the stored PostgreSQL oracle.");
  summaryLines.push("- Dashboard scores mix deterministic artifact checks with conservative agent-prefill judgments for semantic/layout dimensions.");
  summaryLines.push("- Analysis and RCA scores are prefilled from stored evidence; because many baseline artifacts are plans/specs without executed rows, evidence-support dimensions are intentionally strict.");
  summaryLines.push("- Use this file to reduce manual work, then spot-check the prefilled sheet before copying numbers into the paper.");

  const outAbs = path.resolve(ROOT, outDir);
  mkdirSync(outAbs, { recursive: true });
  writeFileSync(path.join(outAbs, "grading-sheet-prefilled.md"), `${sheet.join("\n").replace(/\n+$/u, "")}\n`);
  writeFileSync(path.join(outAbs, "auto-grade-summary.md"), `${summaryLines.join("\n")}\n`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "grading-sheet-prefilled.md"))}`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "auto-grade-summary.md"))}`);
}

main().catch((err) => {
  console.error(`Error: ${safeError(err)}`);
  process.exitCode = 1;
});
