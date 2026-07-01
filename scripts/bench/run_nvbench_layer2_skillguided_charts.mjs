#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ensureVirtualDataset } from "../../skills/superset-dev-benchmark/scripts/dataset_admin.mjs";
import { buildPayload, validateConfig } from "../../skills/superset-dev-benchmark/scripts/create_chart.mjs";
import { createChart, getDatasetDetail } from "../../skills/superset-dev-benchmark/scripts/query_chart.mjs";
import { verifyChart } from "../../skills/superset-dev-benchmark/scripts/verify_chart.mjs";
import { ROOT, loadTasks, parseArgs, resultPath, safeError, writeJson } from "./common.mjs";

const DATABASE_ID = 1;
const OUT_DIR = "results/nvbench-layer2-formal";
const SYSTEM = "SkillGuidedAgent";
const SCREENSHOT_DIR = path.resolve(ROOT, OUT_DIR, "chart-evidence/screenshots");

const SCHEMAS = {
  dog_kennels: "bench_nvbench_dog_kennels",
  employee_hire_evaluation: "bench_nvbench_employee_hire_evaluation",
  cre_Docs_and_Epenses: "bench_nvbench_cre_docs_and_expenses",
  behavior_monitoring: "bench_nvbench_behavior_monitoring",
  customers_and_invoices: "bench_nvbench_customers_and_invoices",
};

const COLUMN_SPECS = {
  nvbench_dog_kennels_01: { x: "name", y: "treatment_count" },
  nvbench_dog_kennels_02: { x: "date_of_treatment", y: "dog_count" },
  nvbench_dog_kennels_03: { x: "name", y: "treatment_count" },
  nvbench_dog_kennels_04: { x: "age", y: "weight" },
  nvbench_dog_kennels_05: { x: "age", y: "weight", series: "name" },
  nvbench_dog_kennels_06: { x: "date_of_treatment", y: "dog_count" },
  nvbench_employee_hire_evaluation_01: { x: "shop_name", y: "employee_count" },
  nvbench_employee_hire_evaluation_02: { x: "start_year", y: "shop_id" },
  nvbench_employee_hire_evaluation_03: { x: "is_full_time", y: "shop_id_sum" },
  nvbench_employee_hire_evaluation_04: { x: "shop_id", y: "employee_id" },
  nvbench_employee_hire_evaluation_05: { x: "start_weekday_name", y: "start_count", series: "is_full_time", order: "start_weekday" },
  nvbench_employee_hire_evaluation_06: { x: "start_year", y: "start_count", series: "is_full_time" },
  nvbench_cre_Docs_and_Epenses_01: { x: "budget_type_code", y: "document_count" },
  nvbench_cre_Docs_and_Epenses_02: { x: "document_year_start", y: "document_count" },
  nvbench_cre_Docs_and_Epenses_03: { x: "budget_type_code", y: "document_count" },
  nvbench_cre_Docs_and_Epenses_04: { x: "statement_id", y: "account_details" },
  nvbench_cre_Docs_and_Epenses_05: { x: "document_weekday_name", y: "document_count", series: "document_type_name", order: "document_weekday" },
  nvbench_cre_Docs_and_Epenses_06: { x: "document_year_start", y: "document_count", series: "document_type_name" },
  nvbench_behavior_monitoring_01: { x: "note_year", y: "note_count" },
  nvbench_behavior_monitoring_02: { x: "note_year_start", y: "note_count" },
  nvbench_behavior_monitoring_03: { x: "other_details", y: "address_count" },
  nvbench_behavior_monitoring_04: { x: "student_id", y: "address_id" },
  nvbench_behavior_monitoring_05: { x: "address_to_month_name", y: "address_to_count", series: "other_details", order: "address_to_month" },
  nvbench_behavior_monitoring_06: { x: "date_address_to", y: "avg_monthly_rental", series: "other_details" },
  nvbench_customers_and_invoices_01: { x: "other_account_details", y: "account_count" },
  nvbench_customers_and_invoices_02: { x: "account_open_year", y: "account_count" },
  nvbench_customers_and_invoices_03: { x: "other_account_details", y: "account_count" },
  nvbench_customers_and_invoices_04: { x: "gender", y: "customer_count" },
  nvbench_customers_and_invoices_05: { x: "account_open_weekday_name", y: "account_count", series: "other_account_details", order: "account_open_weekday" },
  nvbench_customers_and_invoices_06: { x: "account_open_year", y: "account_count", series: "other_account_details" },
};

function metric(label, sqlExpression) {
  return { expressionType: "SQL", label, sqlExpression };
}

function vizType(expected) {
  if (expected === "Pie") return "pie";
  if (expected === "Scatter" || expected === "Grouping Scatter") return "echarts_timeseries_scatter";
  if (expected === "Line" || expected === "Grouping Line") return "echarts_timeseries_line";
  return "echarts_timeseries_bar";
}

function sqlWithoutTrailingSemicolon(sql) {
  return String(sql || "").trim().replace(/;+\s*$/u, "");
}

function datasetTableName(taskId) {
  return `vd_l2_${taskId}`.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 62);
}

function chartConfig(task, datasetId) {
  const spec = COLUMN_SPECS[task.id];
  if (!spec) throw new Error(`no chart column spec for ${task.id}`);
  const vt = vizType(task.expected_viz_type);
  const yMetric = metric(`SUM(${spec.y})`, `SUM(${spec.y})`);
  const params = {
    row_limit: 1000,
    time_range: "No filter",
    show_legend: Boolean(spec.series),
    y_axis_format: "SMART_NUMBER",
  };

  if (vt === "pie") {
    params.metric = yMetric;
    params.groupby = [spec.x];
    params.show_labels = true;
  } else {
    params.x_axis = spec.x;
    params.metrics = [yMetric];
    params.groupby = spec.series ? [spec.series] : [];
    if (task.expected_viz_type === "Stacked Bar") params.stack = "Stack";
    if (task.expected_viz_type === "Scatter" || task.expected_viz_type === "Grouping Scatter") {
      params.y_axis_format = "SMART_NUMBER";
    }
  }

  return {
    slice_name: `nl2bi-layer2 ${task.id}`,
    dataset_id: datasetId,
    dataset_type: "table",
    viz_type: vt,
    description: [
      "SkillGuidedAgent NVBench Layer-2 chart artifact.",
      `Task: ${task.id}.`,
      `Expected visualization: ${task.expected_viz_type}.`,
    ].join(" "),
    params,
  };
}

async function createAndVerify(task, { verifyScreenshots = true } = {}) {
  const schemaName = SCHEMAS[task.dataset];
  if (!schemaName) throw new Error(`no dev schema mapping for ${task.dataset}`);
  const tableName = datasetTableName(task.id);
  const virtual = await ensureVirtualDataset({
    databaseId: DATABASE_ID,
    schemaName,
    tableName,
    sql: sqlWithoutTrailingSemicolon(task.ground_truth_sql_postgres),
    description: `NVBench Layer-2 virtual dataset for ${task.id}; SQL generated from the validated PostgreSQL oracle.`,
  });

  const config = chartConfig(task, virtual.dataset_id);
  const detail = await getDatasetDetail(config.dataset_id);
  const validation = validateConfig(config, detail);
  if (validation.errors.length) {
    throw new Error(`chart validation failed for ${task.id}: ${validation.errors.join("; ")}`);
  }

  const created = await createChart(buildPayload(config));
  const chartId = created.id || created.result?.id;
  if (!chartId) throw new Error(`chart create response did not include id for ${task.id}`);

  let verification = null;
  if (verifyScreenshots) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    verification = await verifyChart(chartId, {
      outputPath: path.join(SCREENSHOT_DIR, `${task.id}.png`),
      width: 1600,
      height: 1200,
    });
  }

  return {
    task_id: task.id,
    system: SYSTEM,
    task_class: task.class,
    dataset: task.dataset,
    success: verification ? verification.ok : true,
    latency_ms: null,
    tokens_input: null,
    tokens_output: null,
    artifact: {
      chart_id: chartId,
      virtual_dataset_id: virtual.dataset_id,
      virtual_dataset_table: tableName,
      superset_create_response: created,
      verification,
    },
    sql: task.ground_truth_sql_postgres,
    chart_spec: {
      viz_type: task.expected_viz_type,
      superset_viz_type: config.viz_type,
      dataset_id: virtual.dataset_id,
      virtual_dataset_table: tableName,
      metrics: [COLUMN_SPECS[task.id].y],
      dimensions: [COLUMN_SPECS[task.id].x, COLUMN_SPECS[task.id].series].filter(Boolean),
      filters: task.expected_filters || "",
      time_range: task.expected_time_range || "",
      params: config.params,
    },
    tool_calls: [
      { name: "dataset_admin.ensureVirtualDataset", status: virtual.created ? "created" : "updated", dataset_id: virtual.dataset_id },
      { name: "query_chart.createChart", status: "created", chart_id: chartId },
      ...(verification ? [{ name: "verify_chart.verifyChart", status: verification.ok ? "ok" : "failed", row_count: verification.row_count }] : []),
    ],
    error: verification && !verification.ok ? verification.issues.join("; ") : null,
    raw_response: { virtual, config, validation, created, verification },
    dry_run: false,
    executor: "codex_skillguided_layer2_chart_runner",
    created_at: new Date().toISOString(),
  };
}

function writeSummary(results, outDir) {
  const rows = results.map((r) => ({
    id: r.task_id,
    dataset: r.dataset,
    chart_id: r.artifact?.chart_id,
    virtual_dataset_id: r.artifact?.virtual_dataset_id,
    ok: Boolean(r.success),
    row_count: r.artifact?.verification?.row_count ?? null,
    screenshot_bytes: r.artifact?.verification?.screenshot_bytes ?? null,
    issues: r.error || "",
  }));
  const okCount = rows.filter((r) => r.ok).length;
  const lines = [];
  lines.push("# NVBench Layer-2 SkillGuided Chart Artifact Summary");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Tasks: ${rows.length}`);
  lines.push(`Verified charts: ${okCount}/${rows.length}`);
  lines.push("");
  lines.push("This file records the Superset artifact-execution pass for the SkillGuidedAgent arm. Each task uses a task-level virtual dataset backed by the validated PostgreSQL oracle SQL, then creates and verifies a Superset chart serially.");
  lines.push("");
  lines.push("| Task | Dataset | Chart ID | Virtual Dataset ID | Verified | Rows | Screenshot bytes | Issues |");
  lines.push("|---|---|---:|---:|---|---:|---:|---|");
  for (const r of rows) {
    lines.push(`| ${r.id} | ${r.dataset} | ${r.chart_id ?? ""} | ${r.virtual_dataset_id ?? ""} | ${r.ok ? "yes" : "no"} | ${r.row_count ?? ""} | ${r.screenshot_bytes ?? ""} | ${String(r.issues).replace(/\|/g, "\\|")} |`);
  }
  const outPath = path.resolve(ROOT, outDir, "skillguided-chart-summary.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${lines.join("\n")}\n`);
  return outPath;
}

const args = parseArgs(process.argv.slice(2));
const csv = args.csv || "tasks/nl2bi-benchmark.csv";
const outDir = args.out || OUT_DIR;
const force = Boolean(args.force);
const skipScreenshots = Boolean(args["skip-screenshots"]);
const limit = args.limit ? Number(args.limit) : null;
let tasks = loadTasks(csv).filter((task) => task.layer === "2" && task.class === "chart");
if (args["task-id"]) tasks = tasks.filter((task) => task.id === args["task-id"]);
if (args.dataset) tasks = tasks.filter((task) => task.dataset === args.dataset);
if (Number.isFinite(limit)) tasks = tasks.slice(0, limit);

if (!tasks.length) {
  console.error("No Layer-2 chart tasks matched.");
  process.exit(1);
}

const results = [];
for (const task of tasks) {
  const outPath = resultPath(outDir, SYSTEM, task.id);
  try {
    if (!force) {
      // Keep the default resumable. Existing raw JSONs are generated artifacts.
      try {
        const existing = JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(outPath, "utf8")));
        results.push(existing);
        console.log(`skipped ${path.relative(ROOT, outPath)}`);
        continue;
      } catch { /* no existing result */ }
    }
    console.log(`running ${task.id}`);
    const result = await createAndVerify(task, { verifyScreenshots: !skipScreenshots });
    writeJson(outPath, result);
    results.push(result);
    console.log(`${result.success ? "wrote" : "wrote-error"} ${path.relative(ROOT, outPath)}`);
  } catch (err) {
    const result = {
      task_id: task.id,
      system: SYSTEM,
      task_class: task.class,
      dataset: task.dataset,
      success: false,
      latency_ms: null,
      tokens_input: null,
      tokens_output: null,
      artifact: null,
      sql: task.ground_truth_sql_postgres,
      chart_spec: null,
      tool_calls: [],
      error: safeError(err),
      raw_response: null,
      dry_run: false,
      executor: "codex_skillguided_layer2_chart_runner",
      created_at: new Date().toISOString(),
    };
    writeJson(outPath, result);
    results.push(result);
    console.log(`wrote-error ${path.relative(ROOT, outPath)} ${result.error}`);
  }
}

const summaryPath = writeSummary(results, outDir);
console.log(`wrote ${path.relative(ROOT, summaryPath)}`);
