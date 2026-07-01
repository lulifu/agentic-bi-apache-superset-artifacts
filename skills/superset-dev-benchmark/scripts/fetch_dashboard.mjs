#!/usr/bin/env node

/**
 * Dashboard Data Fetcher
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Modes:
 *   --id <id> --time-offset "1 week ago"   Fetch all chart data (default)
 *   --execute-drill <plan.json>            Execute drill queries from Python plan
 */

import { parseArgs } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import { getChartDetail, queryChartData, getDatasetDetail, parseChartParams, buildWhereFilters } from "./query_chart.mjs";
import { getDashboardCharts, getDashboardDatasets } from "./query_dashboard.mjs";

// Columnar rows: ~30-60% smaller than array-of-dicts because column names
// aren't repeated per row. Consumers materialize back to dicts via a helper.
function toColumnar(data, colnames) {
  if (!data.length) return [];
  const cols = colnames.length ? colnames : Object.keys(data[0] || {});
  return data.map((r) => cols.map((c) => r[c]));
}

// ── Overview mode ──────────────────────────────────────────────────

async function fetchOverview(dashboardId) {
  const [chartsResp, datasetsResp] = await Promise.all([
    getDashboardCharts(dashboardId),
    getDashboardDatasets(dashboardId),
  ]);

  const charts = chartsResp.result || [];
  const rawDatasets = datasetsResp.result || [];

  const CONCURRENCY = 5;
  const overview = [];
  for (let i = 0; i < charts.length; i += CONCURRENCY) {
    const batch = charts.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (chart) => {
        const chartId = chart.id || chart.slice_id;
        const detail = await getChartDetail(chartId);
        const c = detail.result;
        const p = parseChartParams(c);
        return {
          id: chartId, name: c.slice_name || chart.slice_name || `Chart ${chartId}`,
          vizType: p.vizType, datasourceId: p.datasourceId, metrics: p.metrics,
          groupby: p.groupby, granularity: p.granularity, timeRange: p.timeRange, timeGrain: p.timeGrain,
        };
      })
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled") overview.push(r.value);
      else overview.push({ id: batch[j].id || batch[j].slice_id, name: batch[j].slice_name || `Chart ${batch[j].id || batch[j].slice_id}`, error: r.reason?.message || String(r.reason) });
    }
  }

  const datasets = {};
  for (const ds of rawDatasets) {
    const cols = (ds.columns || []).map((c) => typeof c === "string" ? { column_name: c, type: "VARCHAR", is_dttm: false, groupby: true } : { column_name: c.column_name || c.name || String(c), type: c.type || c.type_generic || "VARCHAR", is_dttm: c.is_dttm || false, groupby: c.groupby !== false });
    datasets[ds.id] = { name: ds.table_name || ds.datasource_name || ds.name || `dataset_${ds.id}`, columns: cols };
  }

  const allDimensions = new Set();
  for (const c of overview) { for (const col of c.groupby || []) allDimensions.add(col); }
  for (const ds of Object.values(datasets)) { for (const col of ds.columns) { if (col.groupby && !col.is_dttm) allDimensions.add(col.column_name); } }

  return { dashboard_id: String(dashboardId), total_charts: charts.length, charts: overview, datasets, available_dimensions: [...allDimensions].sort() };
}

// ── Fetch mode ──────────────────────────────────────────────────────

async function fetchDashboard(dashboardId, timeOffset, timeRangeOverride) {
  const [chartsResp, datasetsResp] = await Promise.all([
    getDashboardCharts(dashboardId),
    getDashboardDatasets(dashboardId),
  ]);

  const charts = chartsResp.result || [];
  const rawDatasets = datasetsResp.result || [];

  const datasets = {};
  for (const ds of rawDatasets) {
    const columns = (ds.columns || []).map((c) => typeof c === "string" ? { column_name: c, type: "VARCHAR", is_dttm: false, groupby: true } : { column_name: c.column_name || c.name || String(c), type: c.type || c.type_generic || "VARCHAR", is_dttm: c.is_dttm || false, groupby: c.groupby !== false });
    datasets[ds.id] = { name: ds.table_name || ds.datasource_name || ds.name || `dataset_${ds.id}`, datasource_type: "table", columns, chart_ids: [] };
  }

  const CONCURRENCY = 5;
  const chartResults = {};

  for (let i = 0; i < charts.length; i += CONCURRENCY) {
    const batch = charts.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (chart) => {
        const chartId = chart.id || chart.slice_id;
        const chartName = chart.slice_name || `Chart ${chartId}`;
        let detail;
        try { detail = (await getChartDetail(chartId)).result; }
        catch (e) { return { chartId, chartName, error: `Detail fetch failed: ${e.message}` }; }
        const p = parseChartParams(detail);
        if (!p.datasourceId || !p.rawMetrics.length) return { chartId, chartName, error: "No datasource or metrics" };

        // Decide query mode based on the chart's own time configuration.
        //
        //   chart has time filter (timeRange != "No filter" AND has granularity)
        //     → "with_offset" mode: inject TEMPORAL_RANGE filter + time_offsets
        //       so the backend returns paired current/previous columns for WoW.
        //       Honors --time-range override if the user passed one.
        //
        //   chart has NO time filter (timeRange === "No filter" OR no granularity)
        //     → "no_filter" mode: do NOT send time_offsets and do NOT inject a
        //       time_range. Sending time_offsets against a chart with no time
        //       window produces meaningless / failing offset columns. Python
        //       analyzes the full series in-process (latest vs trailing mean,
        //       trend slope, σ-deviation). --time-range override is ignored
        //       with a stderr warning to preserve the chart's own semantics.
        const chartHasTimeFilter = !!p.granularity && p.timeRange !== "No filter";
        const timeMode = chartHasTimeFilter ? "with_offset" : "no_filter";

        if (!chartHasTimeFilter && timeRangeOverride) {
          console.error(
            `[fetch] WARN chart ${chartId} has no time filter (timeRange=${JSON.stringify(p.timeRange)}, granularity=${p.granularity || "null"}) — ignoring --time-range="${timeRangeOverride}" and --time-offset for this chart`
          );
        }

        const { filters, extraWhere } = buildWhereFilters(p.adhocFilters);
        const query = {
          columns: p.groupby || [],
          metrics: p.rawMetrics,
          filters,
          row_limit: 50000,
          extras: { time_grain_sqla: p.timeGrain, ...(extraWhere ? { where: extraWhere } : {}) },
        };
        let effectiveTimeRange;
        if (chartHasTimeFilter) {
          effectiveTimeRange = timeRangeOverride || p.timeRange;
          query.filters.push({ col: p.granularity, op: "TEMPORAL_RANGE", val: effectiveTimeRange });
          query.granularity = p.granularity;
          query.time_range = effectiveTimeRange;
          query.time_offsets = [timeOffset];
        } else {
          // no_filter mode: keep granularity (so the backend knows the time
          // column for grouping) but do NOT pass time_range or time_offsets.
          effectiveTimeRange = "No filter";
          if (p.granularity) query.granularity = p.granularity;
        }
        let queryResult;
        try {
          console.error(`[fetch] Querying chart ${chartId}: ${chartName} (mode=${timeMode}) …`);
          const resp = await queryChartData(p.datasourceId, [query], p.datasourceType);
          const first = resp?.result?.[0];
          queryResult = { colnames: first?.colnames || [], rows: toColumnar(first?.data || [], first?.colnames || []), rowcount: first?.rowcount || 0, status: first ? "ok" : "empty" };
        } catch (e) { return { chartId, chartName, error: `Query failed: ${e.message}` }; }
        return { chartId, chartName, vizType: p.vizType, datasourceId: p.datasourceId, datasourceType: p.datasourceType, isTimeSeries: !!(p.granularity && p.timeGrain), timeMode, config: { metrics: p.metrics, raw_metrics: p.rawMetrics, groupby: p.groupby, granularity: p.granularity, time_range: effectiveTimeRange, time_grain: p.timeGrain, adhoc_filters: p.adhocFilters, row_limit: p.rowLimit }, queryResult, error: null };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        const v = r.value;
        const id = v.chartId;
        if (v.error) { chartResults[id] = { chart_id: id, chart_name: v.chartName, error: v.error }; }
        else {
          chartResults[id] = { chart_id: id, chart_name: v.chartName, viz_type: v.vizType, datasource_id: v.datasourceId, datasource_type: v.datasourceType, is_time_series: v.isTimeSeries, time_mode: v.timeMode, config: v.config, query_result: v.queryResult, error: null };
          const dsId = v.datasourceId;
          if (datasets[dsId]) datasets[dsId].chart_ids.push(id);
          else datasets[dsId] = { name: `dataset_${dsId}`, datasource_type: v.datasourceType, columns: [], chart_ids: [id] };
        }
      } else {
        console.error(`[fetch] Unexpected rejection: ${r.reason}`);
      }
    }
  }

  const stubDatasets = Object.entries(datasets).filter(([, ds]) => ds.columns.length === 0);
  if (stubDatasets.length) {
    const enrichResults = await Promise.allSettled(
      stubDatasets.map(async ([dsId]) => {
        const detail = await getDatasetDetail(parseInt(dsId, 10));
        const result = detail.result;
        const columns = (result?.columns || []).map((c) => ({ column_name: c.column_name || c.name || String(c), type: c.type || c.type_generic || "VARCHAR", is_dttm: c.is_dttm || false, groupby: c.groupby !== false }));
        return { dsId, columns, name: result?.table_name || result?.datasource_name };
      })
    );
    for (const r of enrichResults) {
      if (r.status === "fulfilled") { const { dsId, columns, name } = r.value; datasets[dsId].columns = columns; if (name) datasets[dsId].name = name; }
    }
  }

  return { version: 1, dashboard_id: String(dashboardId), fetched_at: new Date().toISOString(), time_offset: timeOffset, datasets, charts: chartResults };
}

// ── Drill execution mode ────────────────────────────────────────────

async function executeDrill(planFile) {
  let raw;
  try { raw = readFileSync(planFile, "utf-8"); } catch (e) { throw new Error(`Drill plan file not found: ${planFile}`); }
  let plan;
  try { plan = JSON.parse(raw); } catch (e) { throw new Error(`Drill plan file is not valid JSON: ${e.message}`); }
  if (!Array.isArray(plan)) throw new Error(`Drill plan file must be a JSON array, got ${typeof plan}`);

  const BATCH_SIZE = 10;
  const allResults = [];

  for (const group of plan) {
    const { datasource_id, datasource_type, queries, query_meta } = group;
    const results = [];
    for (let start = 0; start < queries.length; start += BATCH_SIZE) {
      const batchQueries = queries.slice(start, start + BATCH_SIZE);
      const batchMeta = query_meta.slice(start, start + BATCH_SIZE);
      console.error(`[drill] datasource ${datasource_id}: batch ${start}–${start + batchQueries.length - 1} of ${queries.length} …`);
      try {
        const resp = await queryChartData(datasource_id, batchQueries, datasource_type || "table");
        const resultList = resp?.result || [];
        for (let i = 0; i < batchMeta.length; i++) {
          results.push({ meta: batchMeta[i], colnames: resultList[i]?.colnames || [], rows: toColumnar(resultList[i]?.data || [], resultList[i]?.colnames || []), rowcount: resultList[i]?.rowcount || 0, status: "ok" });
        }
      } catch (e) {
        for (const meta of batchMeta) results.push({ meta, data: [], status: "error", error: e.message });
      }
    }
    allResults.push({ datasource_id, datasource_type: datasource_type || "table", results });
  }

  return allResults;
}

export { fetchOverview, fetchDashboard, executeDrill };

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("fetch_dashboard.mjs")) {
  const { values } = parseArgs({
    options: {
      id: { type: "string" },
      overview: { type: "boolean", default: false },
      "time-offset": { type: "string", default: "1 week ago" },
      "time-range": { type: "string" },
      output: { type: "string" },
      "execute-drill": { type: "string" },
    },
    allowPositionals: true,
  });

  const dashboardId = values.id;
  const isOverview = values.overview;
  const timeOffset = values["time-offset"];
  const timeRangeOverride = values["time-range"] || null;
  const outputFile = values.output;
  const drillPlanFile = values["execute-drill"];

  if (!dashboardId && !drillPlanFile) {
    console.error("Usage:");
    console.error("  node fetch_dashboard.mjs --id <dashboard_id> --overview");
    console.error('  node fetch_dashboard.mjs --id <dashboard_id> --time-offset "1 week ago" [--time-range "Last 7 days"] [--output /tmp/dash_<id>.json]');
    console.error("  node fetch_dashboard.mjs --execute-drill /tmp/drill_plan.json [--output /tmp/drill_data.json]");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        let result;
        if (drillPlanFile) result = await executeDrill(drillPlanFile);
        else if (isOverview) result = await fetchOverview(dashboardId);
        else result = await fetchDashboard(dashboardId, timeOffset, timeRangeOverride);

        const json = JSON.stringify(result);
        if (outputFile) { writeFileSync(outputFile, json, "utf-8"); console.error(`[fetch] Output written to ${outputFile}`); }
        else console.log(json);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
