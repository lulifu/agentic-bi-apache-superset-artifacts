#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildLayoutFromGrid } from "../../skills/superset-dev-benchmark/scripts/create_dashboard.mjs";
import { ensureVirtualDataset } from "../../skills/superset-dev-benchmark/scripts/dataset_admin.mjs";
import { buildPayload, validateConfig } from "../../skills/superset-dev-benchmark/scripts/create_chart.mjs";
import { getChartData, getDatasetDetail, createChart } from "../../skills/superset-dev-benchmark/scripts/query_chart.mjs";
import { createDashboard, updateDashboard, getDashboardCharts } from "../../skills/superset-dev-benchmark/scripts/query_dashboard.mjs";
import { ROOT, loadTasks, parseArgs, resultPath, safeError } from "./common.mjs";

const DATABASE_ID = 1;
const SCHEMA = "bench_bird_financial";
const OUT_DIR = "results/financial-formal";
const SYSTEM = "SkillGuidedAgent";
const WEB_LABEL = "dev Superset";

const DATASETS = {
  account: 32,
  card: 33,
  loan: 37,
  clientLoanRegion: 40,
  cardTransactions: 41,
  accountTransactionsRegion: 42,
};

function metric(label, sqlExpression) {
  return { expressionType: "SQL", label, sqlExpression };
}

function filterSql(sqlExpression) {
  return { clause: "WHERE", expressionType: "SQL", sqlExpression };
}

function temporalNoFilter(subject) {
  return { clause: "WHERE", expressionType: "SIMPLE", subject, operator: "TEMPORAL_RANGE", comparator: "No filter" };
}

function chart(sliceName, datasetId, vizType, params, height = 48) {
  return {
    slice_name: `nl2bi-formal ${sliceName}`,
    dataset_id: datasetId,
    dataset_type: "table",
    viz_type: vizType,
    description: "SkillGuidedAgent formal BIRD financial dashboard benchmark artifact.",
    params: {
      row_limit: 1000,
      time_range: "No filter",
      ...params,
    },
    layout: { width: 6, height },
  };
}

function width(config, value) {
  return { ...config, layout: { ...config.layout, width: value } };
}

function yearFilter(col, year) {
  return filterSql(`${col} >= DATE '${year}-01-01' AND ${col} < DATE '${year + 1}-01-01'`);
}

function rangeFilter(col, start, end) {
  return filterSql(`${col} >= DATE '${start}' AND ${col} < DATE '${end}'`);
}

function countDistinct(col, label = `COUNT(DISTINCT ${col})`) {
  return metric(label, `COUNT(DISTINCT ${col})`);
}

async function ensureDashboardVirtualDatasets() {
  const specs = [
    {
      key: "cardAcquisitionFunnel",
      tableName: "vd_financial_card_acquisition_funnel",
      sqlFile: "tasks/virtual-datasets/financial/card_acquisition_funnel.sql",
      description: "BIRD financial benchmark virtual dataset: card issuance, first card-withdrawal, and funnel stages.",
    },
    {
      key: "householdPaymentAccountRisk",
      tableName: "vd_financial_household_payment_account_risk",
      sqlFile: "tasks/virtual-datasets/financial/household_payment_account_risk.sql",
      description: "BIRD financial benchmark virtual dataset: household-payment account monthly volume and 1996 baseline ratio.",
    },
  ];

  const ensured = [];
  for (const spec of specs) {
    const sql = readFileSync(path.resolve(ROOT, spec.sqlFile), "utf8");
    const result = await ensureVirtualDataset({
      databaseId: DATABASE_ID,
      schemaName: SCHEMA,
      tableName: spec.tableName,
      sql,
      description: spec.description,
    });
    DATASETS[spec.key] = result.dataset_id;
    ensured.push({ ...spec, ...result });
  }
  return ensured;
}

function dashboardSpecs(ds) {
  const loan1996 = [yearFilter("date", 1996)];
  const loan1998 = [yearFilter("loan_date", 1998)];
  const trans1997to1998 = [rangeFilter("trans_date", "1997-01-01", "1999-01-01")];
  const issued1994to1998 = [rangeFilter("issued", "1994-01-01", "1999-01-01")];
  const issuedVirtual1994to1998 = [rangeFilter("card_issued_date", "1994-01-01", "1999-01-01")];
  const topFiveDistrict = "district_id IN (SELECT district_id FROM district ORDER BY CAST(\"A4\" AS INTEGER) DESC LIMIT 5)";

  return {
    self_financial_dashboard_01: {
      title: "nl2bi-formal self_financial_dashboard_01 lending portfolio 1996",
      grid: [
        [chart("d01 total approved loan amount 1996", ds.loan, "big_number_total", {
          metric: metric("SUM(amount)", "SUM(amount)"),
          adhoc_filters: loan1996,
          subheader: "Approved amount, 1996",
          y_axis_format: "SMART_NUMBER",
        }, 28, )],
        [
          chart("d01 monthly approved loan count", ds.loan, "echarts_timeseries_line", {
            metrics: [metric("COUNT(loan_id)", "COUNT(loan_id)")],
            x_axis: "date",
            granularity_sqla: "date",
            time_grain_sqla: "P1M",
            adhoc_filters: loan1996,
            show_legend: false,
            y_axis_format: "SMART_NUMBER",
          }),
          chart("d01 loan status mix by month", ds.loan, "echarts_timeseries_bar", {
            metrics: [metric("COUNT(loan_id)", "COUNT(loan_id)")],
            x_axis: "date",
            granularity_sqla: "date",
            time_grain_sqla: "P1M",
            groupby: ["status"],
            stack: "Stack",
            adhoc_filters: loan1996,
            show_legend: true,
            y_axis_format: "SMART_NUMBER",
          }),
        ],
        [chart("d01 average loan amount by duration", ds.loan, "echarts_timeseries_bar", {
          metrics: [metric("AVG(amount)", "AVG(amount)")],
          x_axis: "duration",
          groupby: [],
          adhoc_filters: loan1996,
          orientation: "vertical",
          show_legend: false,
          y_axis_format: "SMART_NUMBER",
        }, 42)],
      ],
    },
    self_financial_dashboard_02: {
      title: "nl2bi-formal self_financial_dashboard_02 regional risk",
      grid: [
        [chart("d02 regional risk table", ds.clientLoanRegion, "table", {
          groupby: ["region"],
          metrics: [
            countDistinct("client_id", "clients"),
            metric("active_loans", "COUNT(DISTINCT loan_id) FILTER (WHERE loan_status IN ('C','D'))"),
            metric("default_rate", "COUNT(DISTINCT loan_id) FILTER (WHERE loan_status = 'B')::numeric / NULLIF(COUNT(DISTINCT loan_id) FILTER (WHERE loan_status IN ('A','B')), 0)"),
            metric("AVG(avg_salary)", "AVG(avg_salary)"),
          ],
          order_desc: true,
        }, 56)],
        [chart("d02 default rate by region", ds.clientLoanRegion, "echarts_timeseries_bar", {
          x_axis: "region",
          groupby: [],
          metrics: [metric("default_rate", "COUNT(DISTINCT loan_id) FILTER (WHERE loan_status = 'B')::numeric / NULLIF(COUNT(DISTINCT loan_id) FILTER (WHERE loan_status IN ('A','B')), 0)")],
          orientation: "horizontal",
          y_axis_format: ".2%",
        }, 48)],
      ],
    },
    self_financial_dashboard_03: {
      title: "nl2bi-formal self_financial_dashboard_03 card product overview",
      grid: [
        [chart("d03 card issuance by month and type", ds.card, "echarts_timeseries_line", {
          metrics: [metric("COUNT(card_id)", "COUNT(card_id)")],
          x_axis: "issued",
          granularity_sqla: "issued",
          time_grain_sqla: "P1M",
          groupby: ["type"],
          adhoc_filters: issued1994to1998,
          show_legend: true,
        }, 48)],
        [
          chart("d03 issued card mix by type", ds.card, "pie", {
            metric: metric("COUNT(card_id)", "COUNT(card_id)"),
            groupby: ["type"],
            adhoc_filters: issued1994to1998,
            show_labels: true,
          }),
          chart("d03 card withdrawals per month 1997", ds.cardTransactions, "echarts_timeseries_line", {
            metrics: [metric("COUNT(trans_id)", "COUNT(trans_id)")],
            x_axis: "trans_date",
            granularity_sqla: "trans_date",
            time_grain_sqla: "P1M",
            groupby: ["card_type"],
            adhoc_filters: [yearFilter("trans_date", 1997)],
            show_legend: true,
          }),
        ],
      ],
    },
    self_financial_dashboard_04: {
      title: "nl2bi-formal self_financial_dashboard_04 transaction mix",
      grid: [
        [chart("d04 transaction amount by type monthly", ds.accountTransactionsRegion, "echarts_timeseries_bar", {
          metrics: [metric("SUM(trans_amount)", "SUM(trans_amount)")],
          x_axis: "trans_date",
          granularity_sqla: "trans_date",
          time_grain_sqla: "P1M",
          groupby: ["trans_type"],
          stack: "Stack",
          adhoc_filters: trans1997to1998,
          y_axis_format: "SMART_NUMBER",
        }, 48)],
        [
          chart("d04 transaction purpose share", ds.accountTransactionsRegion, "pie", {
            metric: metric("COUNT(trans_id)", "COUNT(trans_id)"),
            groupby: ["k_symbol"],
            adhoc_filters: trans1997to1998,
          }),
          chart("d04 average balance monthly", ds.accountTransactionsRegion, "echarts_timeseries_line", {
            metrics: [metric("AVG(post_transaction_balance)", "AVG(post_transaction_balance)")],
            x_axis: "trans_date",
            granularity_sqla: "trans_date",
            time_grain_sqla: "P1M",
            adhoc_filters: trans1997to1998,
            show_legend: false,
            y_axis_format: "SMART_NUMBER",
          }),
        ],
      ],
    },
    self_financial_dashboard_05: {
      title: "nl2bi-formal self_financial_dashboard_05 client demographics",
      grid: [
        [
          chart("d05 client age histogram", ds.clientLoanRegion, "histogram_v2", {
            all_columns: ["age_as_of_1998"],
            bins: 12,
            adhoc_filters: [filterSql("age_as_of_1998 IS NOT NULL")],
          }),
          chart("d05 gender breakdown", ds.clientLoanRegion, "echarts_timeseries_bar", {
            x_axis: "gender",
            groupby: [],
            metrics: [countDistinct("client_id", "clients")],
          }),
        ],
        [
          chart("d05 age vs loan size scatter", ds.clientLoanRegion, "echarts_timeseries_scatter", {
            x_axis: "age_as_of_1998",
            groupby: ["gender"],
            metrics: [metric("AVG(loan_amount)", "AVG(loan_amount)")],
            adhoc_filters: [filterSql("loan_id IS NOT NULL")],
            show_legend: true,
            y_axis_format: "SMART_NUMBER",
          }),
          chart("d05 top districts by client count", ds.clientLoanRegion, "table", {
            groupby: ["district_name"],
            metrics: [countDistinct("client_id", "clients")],
            orderby: [[countDistinct("client_id", "clients"), false]],
            row_limit: 10,
          }),
        ],
      ],
    },
    self_financial_dashboard_06: {
      title: "nl2bi-formal self_financial_dashboard_06 top district transaction volume",
      grid: [
        [0, 1, 2].map((i) => width(chart(`d06 top district ${i + 1} quarterly amount`, ds.accountTransactionsRegion, "echarts_timeseries_line", {
          metrics: [metric("SUM(trans_amount)", "SUM(trans_amount)")],
          x_axis: "trans_date",
          granularity_sqla: "trans_date",
          time_grain_sqla: "P3M",
          adhoc_filters: [
            yearFilter("trans_date", 1997),
            filterSql(`district_id = ${[1, 54, 70][i]}`),
          ],
          show_legend: false,
          y_axis_format: "SMART_NUMBER",
        }, 42), 4)),
        [3, 4].map((i) => width(chart(`d06 top district ${i + 1} quarterly amount`, ds.accountTransactionsRegion, "echarts_timeseries_line", {
          metrics: [metric("SUM(trans_amount)", "SUM(trans_amount)")],
          x_axis: "trans_date",
          granularity_sqla: "trans_date",
          time_grain_sqla: "P3M",
          adhoc_filters: [
            yearFilter("trans_date", 1997),
            filterSql(`district_id = ${[74, 68][i - 3]}`),
          ],
          show_legend: false,
          y_axis_format: "SMART_NUMBER",
        }, 42), 4)).concat([width(chart("d06 top five districts combined quarterly amount", ds.accountTransactionsRegion, "echarts_timeseries_bar", {
          metrics: [metric("SUM(trans_amount)", "SUM(trans_amount)")],
          x_axis: "trans_date",
          granularity_sqla: "trans_date",
          time_grain_sqla: "P3M",
          groupby: ["district_name"],
          adhoc_filters: [yearFilter("trans_date", 1997), filterSql("district_id IN (1, 54, 70, 74, 68)")],
          y_axis_format: "SMART_NUMBER",
        }, 42), 4)]),
      ],
    },
    self_financial_dashboard_07: {
      title: "nl2bi-formal self_financial_dashboard_07 loan portfolio aging",
      grid: [
        [chart("d07 loan count by status and cohort", ds.clientLoanRegion, "echarts_timeseries_bar", {
          x_axis: "loan_year",
          groupby: ["loan_status_label"],
          metrics: [countDistinct("loan_id", "loans")],
          stack: "Stack",
          adhoc_filters: [filterSql("loan_id IS NOT NULL")],
        }, 48)],
        [
          chart("d07 average amount by duration and status", ds.clientLoanRegion, "pivot_table_v2", {
            metrics: [metric("AVG(loan_amount)", "AVG(loan_amount)")],
            groupbyRows: ["loan_duration_months"],
            groupbyColumns: ["loan_status_label"],
            adhoc_filters: [filterSql("loan_id IS NOT NULL")],
            rowTotals: true,
            colTotals: true,
          }),
          chart("d07 total approved amount 1998", ds.clientLoanRegion, "big_number_total", {
            metric: metric("SUM(loan_amount)", "SUM(loan_amount)"),
            adhoc_filters: loan1998,
            subheader: "Approved amount, 1998",
            y_axis_format: "SMART_NUMBER",
          }, 28),
        ],
      ],
    },
    self_financial_dashboard_08: {
      title: "nl2bi-formal self_financial_dashboard_08 card acquisition",
      grid: [
        [chart("d08 quarterly card issuance by type", ds.cardAcquisitionFunnel, "echarts_timeseries_line", {
          metrics: [countDistinct("card_id", "cards")],
          x_axis: "card_issued_date",
          granularity_sqla: "card_issued_date",
          time_grain_sqla: "P3M",
          groupby: ["card_type"],
          adhoc_filters: [issuedVirtual1994to1998[0], filterSql("funnel_stage = 'issued_card'")],
        }, 48)],
        [
          chart("d08 card issuance to first withdrawal funnel", ds.cardAcquisitionFunnel, "funnel", {
            metric: countDistinct("card_id", "cards"),
            groupby: ["funnel_stage"],
            adhoc_filters: [],
            sort_by_metric: true,
            show_labels: true,
          }),
          chart("d08 avg days to first card withdrawal", ds.cardAcquisitionFunnel, "big_number_total", {
            metric: metric("AVG(days_to_first_card_withdrawal)", "AVG(days_to_first_card_withdrawal)"),
            adhoc_filters: [filterSql("funnel_stage = 'first_card_withdrawal'")],
            subheader: "Days from issue to first withdrawal",
            y_axis_format: "SMART_NUMBER",
          }, 28),
        ],
      ],
    },
    self_financial_dashboard_09: {
      title: "nl2bi-formal self_financial_dashboard_09 household payment risk",
      grid: [
        [chart("d09 monthly household payment outflow", ds.householdPaymentAccountRisk, "echarts_timeseries_line", {
          metrics: [metric("SUM(monthly_sipo_amount)", "SUM(monthly_sipo_amount)")],
          x_axis: "trans_month",
          granularity_sqla: "trans_month",
          time_grain_sqla: "P1M",
          adhoc_filters: [rangeFilter("trans_month", "1997-01-01", "1999-01-01")],
          y_axis_format: "SMART_NUMBER",
        }, 48)],
        [
          chart("d09 accounts above twice baseline", ds.householdPaymentAccountRisk, "table", {
            groupby: ["account_id", "region", "district_name"],
            metrics: [
              metric("MAX(ratio_to_1996_baseline)", "MAX(ratio_to_1996_baseline)"),
              metric("SUM(monthly_sipo_amount)", "SUM(monthly_sipo_amount)"),
            ],
            adhoc_filters: [
              rangeFilter("trans_month", "1997-01-01", "1999-01-01"),
              filterSql("ratio_to_1996_baseline > 2"),
            ],
            row_limit: 20,
          }),
          chart("d09 household payment volume by region", ds.householdPaymentAccountRisk, "echarts_timeseries_bar", {
            x_axis: "region",
            groupby: [],
            metrics: [metric("SUM(monthly_sipo_amount)", "SUM(monthly_sipo_amount)")],
            adhoc_filters: [rangeFilter("trans_month", "1997-01-01", "1999-01-01")],
            y_axis_format: "SMART_NUMBER",
          }),
        ],
      ],
    },
    self_financial_dashboard_10: {
      title: "nl2bi-formal self_financial_dashboard_10 new account growth and quality",
      grid: [
        [chart("d10 monthly new account openings", ds.clientLoanRegion, "echarts_timeseries_line", {
          metrics: [countDistinct("account_id", "accounts")],
          x_axis: "account_opened_date",
          granularity_sqla: "account_opened_date",
          time_grain_sqla: "P1M",
          adhoc_filters: [rangeFilter("account_opened_date", "1993-01-01", "1999-01-01")],
          show_legend: false,
        }, 48)],
        [
          chart("d10 new account frequency share", ds.clientLoanRegion, "pie", {
            metric: countDistinct("account_id", "accounts"),
            groupby: ["account_frequency"],
            adhoc_filters: [rangeFilter("account_opened_date", "1993-01-01", "1999-01-01")],
          }),
          chart("d10 active accounts as of 1998", ds.accountTransactionsRegion, "big_number_total", {
            metric: countDistinct("account_id", "active_accounts"),
            adhoc_filters: [filterSql("trans_date <= DATE '1998-12-31'")],
            subheader: "Accounts with transactions by 1998-12-31",
            y_axis_format: "SMART_NUMBER",
          }, 28),
        ],
        [chart("d10 1996 new accounts district x quarter", ds.clientLoanRegion, "heatmap_v2", {
          x_axis: "account_opened_date",
          groupby: "district_name",
          metric: countDistinct("account_id", "accounts"),
          time_grain_sqla: "P3M",
          adhoc_filters: [yearFilter("account_opened_date", 1996), temporalNoFilter("account_opened_date")],
          y_axis_format: "SMART_NUMBER",
        }, 52)],
      ],
    },
  };
}

function flattenGrid(spec) {
  return spec.grid.map((row) => ({ charts: row.flat() }));
}

function chartIdFromCreateResult(result) {
  return result.id || result.result?.id;
}

function dashboardIdFromCreateResult(result) {
  return result.id || result.result?.id;
}

function dataRows(payload) {
  const first = payload?.result?.[0];
  return {
    rowcount: first?.rowcount ?? first?.data?.length ?? null,
    preview: Array.isArray(first?.data) ? first.data.slice(0, 3) : [],
  };
}

async function createOneChart(config, allowValidationErrors = false) {
  const detail = await getDatasetDetail(config.dataset_id);
  const validation = validateConfig(config, detail);
  const ignorableTemporalTypeErrors = validation.errors.filter((err) => (
    err.includes("is misconfigured: is_dttm=true") && err.includes("DATETIMETZ")
  ));
  const hardErrors = validation.errors.filter((err) => !ignorableTemporalTypeErrors.includes(err));
  if (hardErrors.length && !allowValidationErrors) {
    throw new Error(`Chart validation failed for ${config.slice_name}: ${validation.errors.join("; ")}`);
  }
  const created = await createChart(buildPayload(config));
  const chartId = chartIdFromCreateResult(created);
  if (!chartId) throw new Error(`Create chart did not return an id for ${config.slice_name}`);
  const chartData = await getChartData(chartId);
  return {
    chart_id: chartId,
    slice_name: config.slice_name,
    viz_type: config.viz_type,
    dataset_id: config.dataset_id,
    validation,
    chart_data: dataRows(chartData),
    url: `${WEB_LABEL} chart #${chartId}`,
  };
}

async function createOneDashboard(task, spec, args) {
  const chartResults = [];
  const grid = [];
  for (const row of flattenGrid(spec)) {
    const outRow = [];
    for (const c of row.charts) {
      const chartResult = await createOneChart(c, Boolean(args["allow-validation-errors"]));
      chartResults.push(chartResult);
      outRow.push({
        chartId: chartResult.chart_id,
        sliceName: chartResult.slice_name,
        width: c.layout?.width || 6,
        height: c.layout?.height || 48,
      });
    }
    grid.push({ charts: outRow });
  }

  const createResult = await createDashboard({ dashboard_title: spec.title, published: false });
  const dashboardId = dashboardIdFromCreateResult(createResult);
  if (!dashboardId) throw new Error(`Create dashboard did not return an id for ${task.id}`);

  const positions = buildLayoutFromGrid(grid, spec.title);
  await updateDashboard(dashboardId, {
    json_metadata: JSON.stringify({
      positions,
      color_scheme: "",
      cross_filters_enabled: true,
      label_colors: {},
    }),
  });
  const charts = await getDashboardCharts(dashboardId);

  return {
    task_id: task.id,
    system: SYSTEM,
    task_class: task.class,
    dataset: "financial",
    success: true,
    latency_ms: null,
    tokens_input: null,
    tokens_output: null,
    artifact: {
      dashboard_id: dashboardId,
      dashboard_title: spec.title,
      dashboard_url: `${WEB_LABEL} dashboard #${dashboardId}`,
      chart_ids: chartResults.map((c) => c.chart_id),
      charts: chartResults,
      dashboard_chart_count: charts.result?.length ?? null,
    },
    sql: null,
    chart_spec: {
      dashboard_title: spec.title,
      chart_count: chartResults.length,
      chart_viz_types: chartResults.map((c) => c.viz_type),
    },
    tool_calls: [
      ...chartResults.map((c) => `create_chart.mjs:${c.chart_id}`),
      `create_dashboard.mjs:${dashboardId}`,
      `query_dashboard.mjs:${dashboardId}:charts`,
    ],
    error: null,
    raw_response: { charts: chartResults, dashboard_charts: charts.result || [] },
    dry_run: false,
    executor: "parent_controlled_skill_call",
    agent_id: "parent-controlled",
    token_notes: "No sub-agent token usage for this parent-controlled Superset execution.",
    created_at: new Date().toISOString(),
  };
}

function writeDashboardSummary(results, ensured, outDir) {
  const lines = [];
  lines.push("# Financial Formal Benchmark - SkillGuided Dashboard Batch");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Scope: BIRD `financial` Layer-3 dashboard tasks executed through the dev Superset chart/dashboard APIs. Chart creation and chart-data verification are serial; screenshots are intentionally not fetched in this batch.");
  lines.push("");
  lines.push("## Virtual Datasets Ensured");
  lines.push("");
  lines.push("| Dataset | ID | Created | Updated |");
  lines.push("|---|---:|---:|---:|");
  for (const item of ensured) {
    lines.push(`| ${item.tableName} | ${item.dataset_id} | ${Boolean(item.created)} | ${Boolean(item.updated)} |`);
  }
  lines.push("");
  lines.push("## Dashboard Results");
  lines.push("");
  lines.push("| Task | Success | Dashboard | Charts | Chart-data rowcounts |");
  lines.push("|---|---:|---:|---:|---|");
  for (const result of results) {
    if (!result.success) {
      lines.push(`| ${result.task_id} | false | - | - | ${String(result.error || "").replace(/\|/g, "\\|")} |`);
      continue;
    }
    const rowcounts = result.artifact.charts.map((c) => `${c.chart_id}:${c.chart_data.rowcount}`).join(", ");
    lines.push(`| ${result.task_id} | true | ${result.artifact.dashboard_id} | ${result.artifact.chart_ids.length} | ${rowcounts} |`);
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- Date columns are treated as native `DATE` fields in the current dev Superset datasets; new dashboard SQL filters use direct date predicates.");
  lines.push("- Dashboard screenshots should be collected serially only if a later grading pass needs image evidence.");

  const outPath = path.resolve(ROOT, outDir, "skillguided-dashboard-summary.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${lines.join("\n")}\n`);
}

const args = parseArgs(process.argv.slice(2));
const outDir = args.out || OUT_DIR;
const force = Boolean(args.force);
const tasks = loadTasks("tasks/nl2bi-benchmark.csv").filter((task) => {
  if (task.dataset !== "financial") return false;
  if (task.class !== "dashboard") return false;
  if (args["task-id"] && task.id !== args["task-id"]) return false;
  return true;
});

const ensured = await ensureDashboardVirtualDatasets();
const specs = dashboardSpecs(DATASETS);
const results = [];

for (const task of tasks) {
  const outPath = resultPath(outDir, SYSTEM, task.id);
  if (existsSync(outPath) && !force) {
    const prior = JSON.parse(readFileSync(outPath, "utf8"));
    if (prior.success) {
      console.log(`skip-existing ${path.relative(ROOT, outPath)}`);
      continue;
    }
    console.log(`retry-failed ${path.relative(ROOT, outPath)}`);
  }
  try {
    const spec = specs[task.id];
    if (!spec) throw new Error(`No dashboard spec configured for ${task.id}`);
    const result = await createOneDashboard(task, spec, args);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
    results.push(result);
    console.log(`wrote ${path.relative(ROOT, outPath)}`);
  } catch (err) {
    const result = {
      task_id: task.id,
      system: SYSTEM,
      task_class: task.class,
      dataset: "financial",
      success: false,
      error: safeError(err),
      dry_run: false,
      executor: "parent_controlled_skill_call",
      created_at: new Date().toISOString(),
    };
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
    results.push(result);
    console.log(`wrote-error ${path.relative(ROOT, outPath)}`);
  }
}

const summaryResults = tasks.map((task) => {
  const current = results.find((result) => result.task_id === task.id);
  if (current) return current;
  const file = resultPath(outDir, SYSTEM, task.id);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  return {
    task_id: task.id,
    system: SYSTEM,
    task_class: "dashboard",
    dataset: "financial",
    success: false,
    error: "missing result file",
  };
});

writeDashboardSummary(summaryResults, ensured, outDir);
console.error(`Done. financial SkillGuided dashboard results=${results.length}`);
