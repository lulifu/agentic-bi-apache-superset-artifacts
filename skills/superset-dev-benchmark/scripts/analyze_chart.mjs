#!/usr/bin/env node

/**
 * Chart-Level Metric Analysis
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Two-phase interactive analysis:
 *   --analyze    Phase 1: detect anomalies (time-series) or describe data (static)
 *   --drill      Phase 2: drill down by user-selected dimensions
 *
 * Time-series charts: detects sudden spikes/drops via consecutive period change.
 * Non-time-series charts: describes distribution, top values, concentration.
 */

import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { getChartDetail, getDatasetDetail, queryChartData, parseChartParams, buildWhereFilters, calcChangeRate, fmtPct, fmtNum } from "./query_chart.mjs";

// ── Constants ───────────────────────────────────────────────────────

const TIME_GRAIN_OFFSETS = {
  PT1M:  "1 minute ago",
  PT5M:  "5 minutes ago",
  PT15M: "15 minutes ago",
  PT30M: "30 minutes ago",
  PT1H:  "1 hour ago",
  P1D:   "1 day ago",
  P1W:   "1 week ago",
  P1M:   "1 month ago",
  P3M:   "3 months ago",
  P1Y:   "1 year ago",
};

const MAX_CHANGES = 20; // Top N consecutive changes to output

// ── Helpers ─────────────────────────────────────────────────────────

function isTimeSeriesChart(params) {
  return !!(params.granularity && params.timeGrain);
}

function findTimeColumn(colnames, granularity) {
  if (colnames.includes(granularity)) return granularity;
  if (colnames.includes("__timestamp")) return "__timestamp";
  return colnames.find((c) => /(^|_)(time|date|day|month|year|week|hour|ts|dt|ds|timestamp)(_|$)/i.test(c)) || colnames[0];
}

function extractDrillDimensions(datasetDetail, params) {
  const columns = datasetDetail?.result?.columns || [];
  const metricNames = new Set(params.metrics);
  const timeColumns = new Set([params.granularity].filter(Boolean));
  for (const col of columns) {
    if (col.is_dttm) timeColumns.add(col.column_name);
  }
  return columns
    .filter((col) => col.groupby && !metricNames.has(col.column_name) && !timeColumns.has(col.column_name))
    .map((col) => ({ column_name: col.column_name, type: col.type || "unknown" }));
}

// ── Time-series change computation ──────────────────────────────────

function computeChanges(data, timeColumn, metricNames, groupbyColumns = []) {
  const changes = [];
  const statsAccum = {};

  const groups = new Map();
  for (const row of data) {
    const key = groupbyColumns.map((g) => String(row[g] ?? "")).join("|") || "__all__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  for (const [, groupRows] of groups) {
    const sorted = [...groupRows].sort((a, b) => {
      const ta = new Date(a[timeColumn]).getTime();
      const tb = new Date(b[timeColumn]).getTime();
      return ta - tb;
    });

    for (const metricName of metricNames) {
      const values = sorted.map((r) => Number(r[metricName]) || 0);
      if (!statsAccum[metricName]) statsAccum[metricName] = [];
      statsAccum[metricName].push(...values);

      for (let i = 1; i < sorted.length; i++) {
        const current = values[i];
        const previous = values[i - 1];
        const absChange = current - previous;
        let changeRate = calcChangeRate(current, previous);
        if (changeRate === Infinity) changeRate = 9999;
        else if (changeRate === -Infinity) changeRate = -9999;

        changes.push({
          timestamp: sorted[i][timeColumn],
          prev_timestamp: sorted[i - 1][timeColumn],
          metric: metricName,
          value: current,
          prev_value: previous,
          abs_change: absChange,
          change_rate: changeRate,
          direction: absChange > 0 ? "up" : absChange < 0 ? "down" : "flat",
        });
      }
    }
  }

  const stats = {};
  for (const [metricName, allValues] of Object.entries(statsAccum)) {
    const min = allValues.reduce((a, b) => Math.min(a, b), Infinity);
    const max = allValues.reduce((a, b) => Math.max(a, b), -Infinity);
    const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    stats[metricName] = { min, max, avg, range: max - min, points: allValues.length };
  }

  changes.sort((a, b) => Math.abs(b.change_rate) - Math.abs(a.change_rate));
  return { changes: changes.slice(0, MAX_CHANGES), stats };
}

// ── Non-time-series description ─────────────────────────────────────

function describeStaticChart(data, params) {
  const { metrics, groupby, vizType } = params;
  const result = {
    metrics_totals: {},
    row_count: data.length,
    top_values: [],
    concentration: {},
    viz_description: "",
  };

  for (const m of metrics) {
    result.metrics_totals[m] = data.reduce((sum, row) => sum + (Number(row[m]) || 0), 0);
  }

  if (groupby.length && metrics.length) {
    const primaryMetric = metrics[0];
    const sorted = [...data].sort((a, b) => (Number(b[primaryMetric]) || 0) - (Number(a[primaryMetric]) || 0));
    const total = result.metrics_totals[primaryMetric];

    result.top_values = sorted.slice(0, 10).map((row) => ({
      groupby_value: groupby.map((g) => row[g]).join(" | "),
      metric: primaryMetric,
      value: Number(row[primaryMetric]) || 0,
      share_pct: total ? ((Number(row[primaryMetric]) || 0) / total * 100) : 0,
    }));

    const top3Sum = sorted.slice(0, 3).reduce((s, r) => s + (Number(r[primaryMetric]) || 0), 0);
    result.concentration = {
      top3_share_pct: total ? (top3Sum / total * 100) : 0,
      top3_values: sorted.slice(0, 3).map((r) => groupby.map((g) => r[g]).join(" | ")),
    };
  }

  const vizDescriptions = {
    pie: "Distribution chart — proportions across categories",
    big_number: "Single KPI metric display",
    big_number_total: "Single KPI total value",
    table: "Tabular data",
    dist_bar: "Ranking / comparison bar chart",
    echarts_bar: "Ranking / comparison bar chart",
    bar: "Ranking / comparison bar chart",
    funnel: "Funnel conversion chart",
    gauge: "Gauge metric display",
    treemap: "Hierarchical treemap",
    word_cloud: "Word cloud visualization",
    pivot_table: "Pivot table",
    pivot_table_v2: "Pivot table",
    heatmap: "Heatmap",
    box_plot: "Statistical box plot",
    histogram: "Distribution histogram",
  };
  result.viz_description = vizDescriptions[vizType] || `Chart type: ${vizType}`;

  return result;
}

// ── Phase 1: Analyze ────────────────────────────────────────────────

async function runAnalyze(chartId, { withSeries = false } = {}) {
  console.error(`[chart-analyze] Fetching chart ${chartId} …`);
  const detail = (await getChartDetail(chartId)).result;
  if (!detail) throw new Error(`Chart ${chartId} not found`);

  const params = parseChartParams(detail);
  if (!params.datasourceId) {
    throw new Error(`Chart ${chartId} has no datasource`);
  }
  if (!params.rawMetrics.length) {
    throw new Error(`Chart ${chartId} has no metrics to analyze (table in raw mode is not supported)`);
  }

  let drillDimensions = [];
  try {
    const dsDetail = await getDatasetDetail(params.datasourceId);
    drillDimensions = extractDrillDimensions(dsDetail, params);
  } catch (e) {
    console.error(`[chart-analyze] Dataset detail failed, using chart groupby: ${e.message}`);
    drillDimensions = params.groupby.map((col) => ({ column_name: col, type: "unknown" }));
  }

  const { filters, extraWhere } = buildWhereFilters(params.adhocFilters);

  if (params.granularity && params.timeRange !== "No filter") {
    filters.push({ col: params.granularity, op: "TEMPORAL_RANGE", val: params.timeRange });
  }

  if (params.xAxisExpr) {
    params.groupby.unshift(params.xAxisExpr);
  }

  function buildAnalysisQuery(columns, metrics, filtersArr, extraWhereStr, rowLimit, timeGrain) {
    const q = { columns, metrics, filters: filtersArr, row_limit: rowLimit, extras: {} };
    if (params.granularity) {
      q.granularity = params.granularity;
      q.time_range = params.timeRange;
      q.extras.time_grain_sqla = timeGrain;
    }
    if (extraWhereStr) q.extras.where = extraWhereStr;
    return q;
  }

  let resp;
  if (params.metricsB) {
    const allRawMetrics = [...params.rawMetrics, ...params.rawMetricsB];
    const allGroupby = [...new Set([...params.groupby, ...(params.groupbyB || [])])];
    const { extraWhere: extraWhereB } = buildWhereFilters(params.adhocFiltersB || []);
    const combinedWhere = [extraWhere, extraWhereB].filter(Boolean).join(" AND ");

    params.metrics = [...params.metrics, ...params.metricsB];
    params.rawMetrics = allRawMetrics;
    params.groupby = allGroupby;
    params.timeGrain = "P1D";

    const query = buildAnalysisQuery(allGroupby, allRawMetrics, filters, combinedWhere, 10000, "P1D");
    console.error(`[chart-analyze] mixed_timeseries: single daily query with ${allRawMetrics.length} metrics …`);
    resp = await queryChartData(params.datasourceId, [query], params.datasourceType);
  } else {
    const query = buildAnalysisQuery(params.groupby, params.rawMetrics, filters, extraWhere, params.rowLimit || 10000, params.timeGrain);
    console.error(`[chart-analyze] Querying data …`);
    resp = await queryChartData(params.datasourceId, [query], params.datasourceType);
  }

  const firstResult = resp?.result?.[0];
  const data = firstResult?.data || [];
  const colnames = firstResult?.colnames || [];

  if (!data.length) {
    throw new Error(`Chart ${chartId} returned no data`);
  }

  const timeSeries = isTimeSeriesChart(params);
  let analysis;

  if (timeSeries) {
    const timeCol = findTimeColumn(colnames, params.granularity);
    const { changes, stats: metricStats } = computeChanges(data, timeCol, params.metrics, params.groupby);

    analysis = {
      type: "time_series",
      time_column: timeCol,
      total_points: data.length,
      changes: [...changes],
      metric_stats: metricStats,
    };

    // Full per-point series is ~50% of output size and only stats_analysis needs it.
    // Opt-in to keep the default LLM-bound output lean.
    if (withSeries) {
      const fullDataSeries = {};
      if (params.groupby.length) {
        for (const m of params.metrics) {
          const byTs = new Map();
          for (const row of data) {
            const ts = row[timeCol];
            byTs.set(ts, (byTs.get(ts) || 0) + (Number(row[m]) || 0));
          }
          fullDataSeries[m] = [...byTs.entries()]
            .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
            .map(([ts, val]) => ({ timestamp: ts, value: val }));
        }
      } else {
        const sorted = [...data].sort((a, b) => new Date(a[timeCol]).getTime() - new Date(b[timeCol]).getTime());
        for (const m of params.metrics) {
          fullDataSeries[m] = sorted.map((r) => ({ timestamp: r[timeCol], value: Number(r[m]) || 0 }));
        }
      }
      analysis.full_data_series = fullDataSeries;
    }
  } else {
    analysis = {
      type: "static",
      summary: describeStaticChart(data, params),
    };
  }

  return {
    chart_id: chartId,
    chart_name: detail.slice_name || `Chart ${chartId}`,
    viz_type: params.vizType,
    is_time_series: timeSeries,
    time_grain: params.timeGrain,
    time_range: params.timeRange,
    granularity: params.granularity,
    metrics: params.metrics,
    groupby: params.groupby,
    analysis,
    drill_dimensions: drillDimensions,
    datasource_id: params.datasourceId,
    datasource_type: params.datasourceType,
    raw_metrics: params.rawMetrics,
    adhoc_filters: params.adhocFilters,
  };
}

// ── Phase 1 formatter ───────────────────────────────────────────────

function formatAnalyze(result) {
  const lines = [];
  lines.push(`## Chart Analysis: ${result.chart_name} (ID: ${result.chart_id})`);
  lines.push(``);
  lines.push(`- Type: ${result.viz_type}`);
  lines.push(`- Time range: ${result.time_range || "N/A"}`);
  lines.push(`- Metrics: ${result.metrics.join(", ")}`);
  if (result.groupby.length) lines.push(`- GroupBy: ${result.groupby.join(", ")}`);
  lines.push(``);

  const a = result.analysis;

  if (a.type === "time_series") {
    lines.push(`### Time-Series Analysis`);
    lines.push(``);
    lines.push(`- Data points: ${a.total_points}`);
    lines.push(``);

    if (a.metric_stats && Object.keys(a.metric_stats).length) {
      lines.push(`**Metric Stats:**`);
      for (const [name, s] of Object.entries(a.metric_stats)) {
        lines.push(`- ${name}: avg=${fmtNum(s.avg)}, min=${fmtNum(s.min)}, max=${fmtNum(s.max)}, range=${fmtNum(s.range)}`);
      }
      lines.push(``);
    }

    if (a.changes.length) {
      lines.push(`**Top consecutive changes (by magnitude):**`);
      lines.push(``);
      lines.push(`| # | Timestamp | Metric | Value | Previous | Change | Direction |`);
      lines.push(`|---|-----------|--------|-------|----------|--------|-----------|`);
      for (let i = 0; i < a.changes.length; i++) {
        const ch = a.changes[i];
        lines.push(
          `| ${i + 1} | ${ch.timestamp} | ${ch.metric} | ${fmtNum(ch.value)} | ${fmtNum(ch.prev_value)} | ${fmtPct(ch.change_rate)} | ${ch.direction} |`
        );
      }
      lines.push(``);
    } else {
      lines.push(`> No data changes found.`);
      lines.push(``);
    }
  } else {
    const s = a.summary;
    lines.push(`### Chart Description`);
    lines.push(``);
    lines.push(`${s.viz_description} (${s.row_count} rows)`);
    lines.push(``);

    lines.push(`**Metric Totals:**`);
    for (const [name, total] of Object.entries(s.metrics_totals)) {
      lines.push(`- ${name}: ${fmtNum(total)}`);
    }
    lines.push(``);

    if (s.top_values.length) {
      lines.push(`**Top Values (by ${s.top_values[0].metric}):**`);
      lines.push(``);
      lines.push(`| Rank | Value | Amount | Share |`);
      lines.push(`|------|-------|--------|-------|`);
      for (let i = 0; i < s.top_values.length; i++) {
        const tv = s.top_values[i];
        lines.push(`| ${i + 1} | ${tv.groupby_value} | ${fmtNum(tv.value)} | ${tv.share_pct.toFixed(1)}% |`);
      }
      lines.push(``);
    }

    if (s.concentration.top3_share_pct) {
      lines.push(`**Concentration:** Top 3 account for ${s.concentration.top3_share_pct.toFixed(1)}% (${s.concentration.top3_values.join(", ")})`);
      lines.push(``);
    }
  }

  lines.push(`### Available Dimensions for Drill-down`);
  lines.push(``);
  if (result.drill_dimensions.length) {
    for (const d of result.drill_dimensions) {
      lines.push(`- \`${d.column_name}\` (${d.type})`);
    }
  } else {
    lines.push(`No additional dimensions available.`);
  }
  lines.push(``);

  return lines.join("\n");
}

// ── Phase 2: Drill-down ─────────────────────────────────────────────

function loadAnalysis(filePath) {
  if (!filePath) {
    console.error("Error: --analysis-file is required for drill");
    process.exitCode = 1;
    return null;
  }
  let raw;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error(`Error: analysis file not found: ${filePath}`);
    process.exitCode = 1;
    return null;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: analysis file is not valid JSON: ${e.message}`);
    process.exitCode = 1;
    return null;
  }
  if (!data.datasource_id || !data.metrics) {
    console.error(`Error: analysis file missing required fields (datasource_id, metrics)`);
    process.exitCode = 1;
    return null;
  }
  return data;
}

async function runDrill(analysis, drillColumns, timestamps, targetMetrics) {
  if (analysis.is_time_series) {
    return await drillTimeSeries(analysis, drillColumns, timestamps, targetMetrics);
  }
  return await drillStatic(analysis, drillColumns);
}

async function drillTimeSeries(analysis, drillColumns, timestamps, targetMetrics) {
  const changes = analysis.analysis.changes || [];
  if (!changes.length) {
    return { chart_id: analysis.chart_id, chart_name: analysis.chart_name, is_time_series: true, drill_columns: drillColumns, results: [], message: "No change data available" };
  }

  const timeGrainOffset = TIME_GRAIN_OFFSETS[analysis.time_grain] || "1 day ago";

  const targets = [];
  for (const ch of changes) {
    const tsStr = String(ch.timestamp);
    const tsMatch = !timestamps.length || timestamps.some((t) => tsStr.startsWith(t));
    const mMatch = !targetMetrics.length || targetMetrics.includes(ch.metric);
    if (tsMatch && mMatch) targets.push(ch);
  }

  if (!targets.length) {
    return { chart_id: analysis.chart_id, chart_name: analysis.chart_name, is_time_series: true, drill_columns: drillColumns, results: [], message: "No matching data points found for the given timestamps/metrics" };
  }

  const allQueries = [];
  const allMeta = [];
  const cappedTargets = targets.slice(0, 10);

  for (let ti = 0; ti < cappedTargets.length; ti++) {
    const target = cappedTargets[ti];
    const rawMetric = analysis.raw_metrics.find((rm) => {
      if (typeof rm === "string") return rm === target.metric;
      return rm.label === target.metric;
    }) || target.metric;

    for (const drillCol of drillColumns) {
      const { filters, extraWhere } = buildWhereFilters(analysis.adhoc_filters);
      const timeRange = `${target.prev_timestamp} : ${target.timestamp}`;
      filters.push({ col: analysis.granularity, op: "TEMPORAL_RANGE", val: timeRange });

      allQueries.push({
        columns: [drillCol],
        metrics: [rawMetric],
        filters,
        granularity: analysis.granularity,
        time_range: timeRange,
        time_offsets: [timeGrainOffset],
        row_limit: 50,
        order_desc: true,
        extras: { time_grain_sqla: analysis.time_grain, ...(extraWhere ? { where: extraWhere } : {}) },
      });
      allMeta.push({ targetIdx: ti, drillCol, metricName: target.metric });
    }
  }

  const results = cappedTargets.map((target) => ({
    point: {
      timestamp: target.timestamp,
      prev_timestamp: target.prev_timestamp,
      metric: target.metric,
      value: target.value,
      prev_value: target.prev_value,
      change_rate: target.change_rate,
      direction: target.direction,
    },
    dimensions: {},
  }));

  const BATCH_SIZE = 10;
  for (let start = 0; start < allQueries.length; start += BATCH_SIZE) {
    const batchQueries = allQueries.slice(start, start + BATCH_SIZE);
    const batchMeta = allMeta.slice(start, start + BATCH_SIZE);

    try {
      console.error(`[chart-drill] batch ${Math.floor(start / BATCH_SIZE) + 1}: ${batchQueries.length} queries …`);
      const resp = await queryChartData(analysis.datasource_id, batchQueries, analysis.datasource_type);
      const resultList = resp?.result || [];

      for (let i = 0; i < batchMeta.length; i++) {
        const { targetIdx, drillCol, metricName } = batchMeta[i];
        const rows = resultList[i]?.data || [];
        const compareCol = `${metricName}__${timeGrainOffset}`;

        results[targetIdx].dimensions[drillCol] = rows
          .map((row) => {
            const current = Number(row[metricName]) || 0;
            const previous = Number(row[compareCol]) || 0;
            let changeRate = calcChangeRate(current, previous);
            if (changeRate === Infinity) changeRate = 9999;
            else if (changeRate === -Infinity) changeRate = -9999;
            return {
              dimension_value: String(row[drillCol] ?? "N/A"),
              current,
              previous,
              abs_change: current - previous,
              change_rate: changeRate,
            };
          })
          .sort((a, b) => Math.abs(b.abs_change) - Math.abs(a.abs_change))
          .slice(0, 10);
      }
    } catch (e) {
      for (const { targetIdx, drillCol } of batchMeta) {
        results[targetIdx].dimensions[drillCol] = { error: e.message };
      }
    }
  }

  return {
    chart_id: analysis.chart_id,
    chart_name: analysis.chart_name,
    is_time_series: true,
    drill_columns: drillColumns,
    time_grain_offset: timeGrainOffset,
    results,
  };
}

async function drillStatic(analysis, drillColumns) {
  const dimensionBreakdowns = {};

  const queries = [];
  for (const drillCol of drillColumns) {
    const { filters, extraWhere } = buildWhereFilters(analysis.adhoc_filters);
    if (analysis.granularity && analysis.time_range !== "No filter") {
      filters.push({ col: analysis.granularity, op: "TEMPORAL_RANGE", val: analysis.time_range });
    }

    queries.push({
      columns: [drillCol],
      metrics: analysis.raw_metrics,
      filters,
      granularity: analysis.granularity,
      time_range: analysis.time_range,
      row_limit: 100,
      order_desc: true,
      extras: { ...(extraWhere ? { where: extraWhere } : {}) },
    });
  }

  try {
    console.error(`[chart-drill] static drill: ${queries.length} dimensions in one batch …`);
    const resp = await queryChartData(analysis.datasource_id, queries, analysis.datasource_type);
    const resultList = resp?.result || [];

    for (let i = 0; i < drillColumns.length; i++) {
      const drillCol = drillColumns[i];
      const rows = resultList[i]?.data || [];
      dimensionBreakdowns[drillCol] = rows.map((row) => {
        const values = {};
        for (const m of analysis.metrics) {
          values[m] = Number(row[m]) || 0;
        }
        return { dimension_value: String(row[drillCol] ?? "N/A"), values };
      });
    }
  } catch (e) {
    for (const drillCol of drillColumns) {
      dimensionBreakdowns[drillCol] = { error: e.message };
    }
  }

  return {
    chart_id: analysis.chart_id,
    chart_name: analysis.chart_name,
    is_time_series: false,
    drill_columns: drillColumns,
    metrics: analysis.metrics,
    breakdowns: dimensionBreakdowns,
  };
}

// ── Phase 2 formatter ───────────────────────────────────────────────

function formatDrill(result) {
  const lines = [];
  lines.push(`## Drill-down Report: ${result.chart_name} (ID: ${result.chart_id})`);
  lines.push(``);
  lines.push(`- Drill columns: ${result.drill_columns.join(", ")}`);
  lines.push(``);

  if (result.is_time_series) {
    if (result.message) {
      lines.push(`> ${result.message}`);
      return lines.join("\n");
    }

    for (const item of result.results) {
      const p = item.point;
      lines.push(`### ${p.direction.toUpperCase()}: ${p.metric} @ ${p.timestamp} (${fmtPct(p.change_rate)})`);
      lines.push(`Value: ${fmtNum(p.value)} (prev: ${fmtNum(p.prev_value)})`);
      lines.push(``);

      for (const [dimCol, data] of Object.entries(item.dimensions)) {
        if (!Array.isArray(data)) {
          lines.push(`**${dimCol}**: Error — ${data?.error || "unknown"}`);
          lines.push(``);
          continue;
        }
        if (!data.length) {
          lines.push(`**${dimCol}**: No data for this time window`);
          lines.push(``);
          continue;
        }

        lines.push(`**Drill by \`${dimCol}\`** (top contributors):`);
        lines.push(``);
        lines.push(`| ${dimCol} | Current | Previous | Change | Rate |`);
        lines.push(`|---|---------|----------|--------|------|`);
        for (const c of data) {
          lines.push(
            `| ${c.dimension_value} | ${fmtNum(c.current)} | ${fmtNum(c.previous)} | ${fmtNum(c.abs_change)} | ${fmtPct(c.change_rate)} |`
          );
        }
        lines.push(``);
      }
    }
  } else {
    for (const [dimCol, data] of Object.entries(result.breakdowns)) {
      if (!Array.isArray(data)) {
        lines.push(`**${dimCol}**: Error — ${data?.error || "unknown"}`);
        lines.push(``);
        continue;
      }

      const metricNames = result.metrics || [];
      lines.push(`### Breakdown by \`${dimCol}\``);
      lines.push(``);
      lines.push(`| ${dimCol} | ${metricNames.join(" | ")} |`);
      lines.push(`|---${metricNames.map(() => "|---").join("")}|`);
      for (const row of data) {
        const vals = metricNames.map((m) => fmtNum(row.values[m]));
        lines.push(`| ${row.dimension_value} | ${vals.join(" | ")} |`);
      }
      lines.push(``);
    }
  }

  return lines.join("\n");
}

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("analyze_chart.mjs")) {
  const { values } = parseArgs({
    options: {
      "chart-id": { type: "string" },
      analyze: { type: "boolean", default: false },
      drill: { type: "boolean", default: false },
      columns: { type: "string" },
      timestamps: { type: "string" },
      metrics: { type: "string" },
      "analysis-file": { type: "string" },
      json: { type: "boolean", default: false },
      "with-series": { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const chartId = values["chart-id"];
  const isAnalyze = values.analyze;
  const isDrill = values.drill;
  const rawJson = values.json;

  const missingChartId = isAnalyze && !chartId;
  const showUsage = !isAnalyze && !isDrill;

  if (showUsage || missingChartId) {
    if (missingChartId) {
      console.error("Error: --analyze requires --chart-id <id>\n");
    }
    console.error("Usage:");
    console.error("  Phase 1 — Analyze:");
    console.error("    node analyze_chart.mjs --chart-id <id> --analyze [--json]");
    console.error("");
    console.error("  Phase 2 — Drill-down:");
    console.error('    node analyze_chart.mjs --drill --analysis-file <path> --columns "dim1,dim2" [--timestamps "ts1,ts2"] [--metrics "m1,m2"]');
    console.error("");
    console.error("  Workflow: run Phase 1, save JSON, AI judges anomalies, ask user, run Phase 2");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        if (isAnalyze) {
          const result = await runAnalyze(chartId, { withSeries: values["with-series"] });
          console.log(rawJson ? JSON.stringify(result) : formatAnalyze(result));
        } else if (isDrill) {
          const analysisFile = values["analysis-file"];
          if (!analysisFile) {
            console.error("Error: --drill requires --analysis-file <path>");
            process.exitCode = 1;
            return;
          }
          const drillColumns = (values.columns || "").split(",").filter(Boolean);
          if (!drillColumns.length) {
            console.error("Error: --drill requires --columns <dim1,dim2,...>");
            process.exitCode = 1;
            return;
          }
          const timestamps = (values.timestamps || "").split(",").filter(Boolean);
          const targetMetrics = (values.metrics || "").split(",").filter(Boolean);

          const analysis = loadAnalysis(analysisFile);
          if (!analysis) return;
          const result = await runDrill(analysis, drillColumns, timestamps, targetMetrics);
          console.log(rawJson ? JSON.stringify(result) : formatDrill(result));
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
