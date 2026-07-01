#!/usr/bin/env node

/**
 * Superset Chart Data Query Client
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * API endpoints:
 *   GET  /api/v1/chart/<id>/data/   — query using chart's saved query_context
 *   POST /api/v1/chart/data         — ad-hoc query with custom datasource/metrics
 *   GET  /api/v1/chart/<id>         — chart metadata (slice_name, viz_type, params)
 */

import { parseArgs } from "node:util";
import { API_BASE, request } from "./http.mjs";

// ── Superset Chart API ───────────────────────────────────────────────

/**
 * Build a single chart-data query object from chart params + viz_type.
 *
 * Lifted out of the original getChartData fallback so the same logic powers:
 *   - getChartData fallback (POST /api/v1/chart/data when GET has no qc)
 *   - create_chart.mjs --create / --update writing query_context up front
 *
 * Returned query is the element that goes into queries[0] of /chart/data
 * payloads, and into queries[0] of a saved query_context.
 */
// echarts-timeseries family share one query_context shape: a BASE_AXIS column
// dict for x_axis goes into queries[0].columns, groupby joins both columns and
// series_columns, and a pivot+flatten post_processing step buckets metrics by
// time. mixed_timeseries also follows this shape (each side independently).
function isEchartsTSFamily(vt) {
  return typeof vt === "string" && (
    vt.startsWith("echarts_timeseries") ||
    vt === "echarts_area" ||
    vt === "mixed_timeseries"
  );
}

// metric label as used in post_processing.aggregates keys
function metricLabel(m) {
  if (typeof m === "string") return m;
  if (m?.label) return m.label;
  if (m?.sqlExpression) return m.sqlExpression;
  return JSON.stringify(m);
}

function buildQueryFromParams(params, vizType) {
  // Metrics: pie/funnel/big_number/big_number_total use singular `metric`.
  const metrics = params.metrics || (params.metric != null ? [params.metric] : []);

  // bubble_v2 stores its 3 metric specs (x/y/size) as individual top-level
  // params, NOT in a metrics array. The backend still wants them in
  // queries[0].metrics for SELECT projection, so collect them here.
  if (vizType === "bubble_v2") {
    for (const f of ["x", "y", "size"]) if (params[f]) metrics.push(params[f]);
  }

  // ── Time-range / WHERE assembly (used by all branches) ─────────────
  const xAxis = params.x_axis;
  const xAxisIsExpr = xAxis && typeof xAxis === "object";
  const granularity = params.granularity_sqla
    || (typeof xAxis === "string" ? xAxis : null)
    || (typeof params.granularity === "string" ? params.granularity : null);
  const timeRange = params.time_range || "No filter";

  const filters = [];
  if (granularity && timeRange !== "No filter") {
    filters.push({ col: granularity, op: "TEMPORAL_RANGE", val: timeRange });
  }
  const extraWhere = [];
  for (const af of (params.adhoc_filters || [])) {
    if (af.clause?.toUpperCase() !== "WHERE") continue;
    if (af.expressionType === "SIMPLE" && af.subject) {
      // The TEMPORAL_RANGE filter on x_axis is handled by the loop above /
      // by the explicit filter we already added — skip duplicates.
      const isTemporalDup = af.operator === "TEMPORAL_RANGE" && af.subject === granularity;
      if (!isTemporalDup) {
        filters.push({ col: af.subject, op: af.operator || "==", val: af.comparator });
      } else if (!filters.some(f => f.col === af.subject && f.op === "TEMPORAL_RANGE")) {
        filters.push({ col: af.subject, op: "TEMPORAL_RANGE", val: af.comparator });
      }
    } else if (af.expressionType === "SQL" && af.sqlExpression) {
      extraWhere.push(af.sqlExpression);
    }
  }
  const whereStr = extraWhere.length ? `(${extraWhere.join(") AND (")})` : "";

  // ── Branch 1: echarts-timeseries family (BASE_AXIS shape) ─────────
  // This is the shape the Superset UI emits and the only one that produces
  // time-bucketed multi-row data via GET /chart/<id>/data/. The previous
  // generic shape only aggregated by groupby and lost the time dimension.
  if (isEchartsTSFamily(vizType) && (typeof xAxis === "string" || xAxisIsExpr)) {
    const groupbyArr = Array.isArray(params.groupby)
      ? params.groupby
      : (typeof params.groupby === "string" && params.groupby ? [params.groupby] : []);

    const baseAxis = xAxisIsExpr
      ? xAxis
      : {
          timeGrain: params.time_grain_sqla || null,
          columnType: "BASE_AXIS",
          sqlExpression: xAxis,
          label: xAxis,
          expressionType: "SQL",
        };

    const aggregates = {};
    for (const m of metrics) aggregates[metricLabel(m)] = { operator: "mean" };

    const xAxisLabel = xAxisIsExpr ? (xAxis.label || xAxis.sqlExpression || "x") : xAxis;

    return {
      columns: [baseAxis, ...groupbyArr],
      series_columns: [...groupbyArr],
      metrics,
      filters,
      orderby: params.timeseries_limit_metric
        ? [[params.timeseries_limit_metric, false]]
        : (metrics.length > 0 ? [[metrics[0], false]] : []),
      row_limit: params.row_limit || 1000,
      extras: { time_grain_sqla: params.time_grain_sqla || null, having: "", where: whereStr },
      post_processing: [
        { operation: "pivot", options: { index: [xAxisLabel], columns: groupbyArr, aggregates, drop_missing_columns: true } },
        { operation: "flatten" },
      ],
    };
  }

  // ── Branch 2: non-timeseries — original generic shape ──────────────
  // Table raw mode (no aggregation; column projection only).
  const isTableRaw = (vizType === "table" && params.query_mode === "raw") ||
    (!metrics.length && params.all_columns?.length);

  // A few viz types use viz-specific column-field names instead of
  // `groupby` / `columns`. Translate them so the SQL groups by the right
  // dimensions (otherwise the chart-data API returns one aggregate row
  // and the chart can't render its X/Y or source/target axes).
  function vizSpecificColumns() {
    switch (vizType) {
      case "heatmap_v2": {
        // heatmap_v2 (current Superset): X-axis = `x_axis` (string|adhoc),
        // Y-axis = `groupby` (a SINGLE string here, not an array — heatmap
        // is the only viz where groupby is scalar). Tolerate array form too
        // in case a caller passes ["status"] by habit.
        const out = [];
        if (params.x_axis) out.push(params.x_axis);
        if (params.groupby) {
          if (Array.isArray(params.groupby)) out.push(...params.groupby);
          else out.push(params.groupby);
        }
        return out;
      }
      case "sankey_v2":  return [params.source, params.target].filter(Boolean);
      case "country_map":
      case "world_map":  return [params.entity].filter(Boolean);
      case "bubble_v2":  return [params.entity, params.series].filter(Boolean);
      default:           return null;
    }
  }

  let columns;
  if (isTableRaw) {
    columns = [...(params.all_columns || [])];
  } else {
    const vizCols = vizSpecificColumns();
    if (vizCols && vizCols.length) {
      columns = vizCols;
    } else {
      columns = [
        ...(params.groupby || params.columns || [
          ...(params.groupbyRows || []),
          ...(params.groupbyColumns || []),
        ]),
      ];
    }
  }

  // x_axis adhoc dict on non-timeseries viz: prepend so the query carries it.
  if (xAxisIsExpr) columns.unshift(xAxis);

  const query = {
    columns,
    filters,
    row_limit: params.row_limit || 1000,
    extras: {
      ...(whereStr ? { where: whereStr } : {}),
    },
  };

  if (granularity) {
    query.granularity = granularity;
    query.time_range = timeRange;
    query.extras.time_grain_sqla = params.time_grain_sqla || null;
  }

  if (!isTableRaw) {
    query.metrics = metrics;
    query.orderby = params.timeseries_limit_metric
      ? [[params.timeseries_limit_metric, false]]
      : (metrics.length > 0 ? [[metrics[0], false]] : []);
  }

  return query;
}

/**
 * Build a complete query_context payload (datasource + queries[]).
 *
 * Same shape Superset's POST /api/v1/chart/data accepts, which is also
 * what GET /api/v1/chart/<id>/data/ replays from the saved chart record.
 * We deliberately do NOT include `form_data` here — POST fallback never
 * sent it either, and Superset accepts a query_context without it.
 *
 * `mixed_timeseries` is the only viz that emits a 2-query context: A side
 * (metrics / groupby / adhoc_filters) and B side (metrics_b / groupby_b /
 * adhoc_filters_b). Both share x_axis / granularity / time_range so they
 * align on the same time index. Without this the saved query_context is
 * single-query and the secondary axis renders empty.
 */
function buildQueryContext(datasourceId, datasourceType, params, vizType) {
  const queries = [buildQueryFromParams(params, vizType)];
  if (vizType === "mixed_timeseries" && (params.metrics_b?.length || params.metric_b)) {
    const paramsB = {
      ...params,
      metrics: params.metrics_b,
      metric: params.metric_b,
      groupby: params.groupby_b ?? [],
      adhoc_filters: params.adhoc_filters_b ?? [],
      row_limit: params.row_limit_b ?? params.row_limit,
    };
    delete paramsB.metrics_b;
    delete paramsB.metric_b;
    delete paramsB.groupby_b;
    delete paramsB.adhoc_filters_b;
    delete paramsB.row_limit_b;
    queries.push(buildQueryFromParams(paramsB, vizType));
  }
  return {
    datasource: { id: datasourceId, type: datasourceType || "table" },
    queries,
    result_type: "full",
    result_format: "json",
    custom_cache_timeout: null,
  };
}

/**
 * Get chart data using the chart's saved query_context.
 * GET /api/v1/chart/<chartId>/data/?type=results&format=json
 *
 * `type=results` strips backend metadata (cache_key, annotation_data, SQL,
 * stacktrace, label_map, applied/rejected_filters, ...) and returns just
 * `{data, colnames, coltypes, rowcount, sql_rowcount}` per query — the
 * payload everyone in this skill actually consumes. Default `type=full`
 * is ~2.5x larger and we then drop everything anyway.
 *
 * If the chart has no saved query_context, falls back to fetching chart
 * metadata and building a POST /api/v1/chart/data request from params.
 */
async function getChartData(chartId) {
  const url = `${API_BASE}/api/v1/chart/${chartId}/data/?type=results&format=json`;
  console.error(`[superset] Fetching data for chart ${chartId} …`);
  let data;
  try {
    data = await request("GET", url);
  } catch {
    data = null;
  }

  // If GET succeeded, return directly
  if (data?.result?.length) {
    return data;
  }

  // Fallback: build POST request from chart params
  console.error(`[superset] Chart ${chartId} has no saved query_context, falling back to POST …`);
  const detail = await getChartDetail(chartId);
  const chart = detail.result;
  if (!chart) {
    throw new Error(`Chart ${chartId} not found`);
  }

  const params = typeof chart.params === "string" ? JSON.parse(chart.params) : (chart.params || {});
  const { datasourceId, datasourceType } = extractDatasource(chart, params);
  if (!datasourceId) {
    throw new Error(`Chart ${chartId} has no datasource`);
  }

  const metrics = params.metrics || (params.metric != null ? [params.metric] : []);
  const isTableRaw = (chart.viz_type === "table" && params.query_mode === "raw") ||
    (!metrics.length && params.all_columns?.length);
  if (!metrics.length && !isTableRaw) {
    throw new Error(`Chart ${chartId} has no metrics defined in params`);
  }

  const query = buildQueryFromParams(params, chart.viz_type);
  return await queryChartData(datasourceId, [query], datasourceType);
}

/**
 * Ad-hoc chart data query.
 * POST /api/v1/chart/data with result_type:"results"
 *
 * `result_type:"results"` returns only {data, colnames, coltypes, rowcount,
 * sql_rowcount} per query — the fields all skill callers (analyze_chart,
 * fetch_dashboard, verify_chart) actually consume. ~3x smaller than the
 * default "full" response, no need for client-side stripping.
 */
async function queryChartData(datasetId, queries, datasourceType = "table") {
  const url = `${API_BASE}/api/v1/chart/data`;
  const payload = {
    datasource: { id: datasetId, type: datasourceType },
    queries,
    result_type: "results",
    result_format: "json",
  };

  console.error(`[superset] Querying dataset ${datasetId} …`);
  return await request("POST", url, payload);
}

/**
 * Search charts by name (fuzzy match).
 * GET /api/v1/chart/?q={"filters":[{"col":"slice_name","opr":"ct","value":"..."}]}
 */
async function searchCharts(keyword, pageSize = 25) {
  const q = JSON.stringify({
    filters: [{ col: "slice_name", opr: "ct", value: keyword }],
    page: 0,
    page_size: pageSize,
    order_column: "changed_on_delta_humanized",
    order_direction: "desc",
  });
  const url = `${API_BASE}/api/v1/chart/?q=${encodeURIComponent(q)}`;
  console.error(`[superset] Searching charts matching "${keyword}" …`);
  return await request("GET", url);
}

/**
 * Get chart metadata (slice_name, viz_type, params, query_context, etc.)
 * GET /api/v1/chart/<chartId>
 */
async function getChartDetail(chartId) {
  const url = `${API_BASE}/api/v1/chart/${chartId}`;
  console.error(`[superset] Fetching chart ${chartId} detail …`);
  return await request("GET", url);
}

// ── Response parsing ─────────────────────────────────────────────────

/**
 * Extract headers and rows from Superset chart data response.
 *
 * Response shape: { result: [{ colnames: [...], data: [{col: val}, ...], rowcount }] }
 */
function extractTable(payload) {
  const first = payload?.result?.[0];
  if (!first) return { headers: [], rows: [] };

  const headers = first.colnames || [];
  const rows = (first.data || []).map((row) => headers.map((h) => row[h]));
  return { headers, rows };
}

// ── Formatting ───────────────────────────────────────────────────────

function formatTable(headers, rows, maxWidth = 50, maxCols = 12) {
  function cell(v) {
    let s = v == null ? "NULL" : String(v);
    s = s.replace(/\n/g, " ");
    if (s.length > maxWidth) s = s.substring(0, maxWidth - 3) + "...";
    return s;
  }

  let truncated = false;
  let displayHeaders = [...headers];
  let displayRows = rows.map((r) => [...r]);

  if (maxCols && displayHeaders.length > maxCols) {
    displayHeaders = displayHeaders.slice(0, maxCols).concat(["..."]);
    displayRows = displayRows.map((r) => r.slice(0, maxCols).concat(["..."]));
    truncated = true;
  }

  const cols = displayHeaders.map(cell);
  const dataFormatted = displayRows.map((row) => row.map(cell));

  const widths = cols.map((c) => c.length);
  for (const row of dataFormatted) {
    for (let i = 0; i < row.length; i++) {
      widths[i] = Math.max(widths[i] || 0, row[i].length);
    }
  }

  const fmtRow = (row) => row.map((v, i) => v.padEnd(widths[i] || 0)).join("  ");

  const output = [];
  output.push(fmtRow(cols));
  output.push("-".repeat(output[0].length));
  for (const row of dataFormatted) {
    output.push(fmtRow(row));
  }

  if (truncated) {
    output.push("");
    output.push(`[NOTE] Output truncated to first ${maxCols} columns.`);
  }

  return output.join("\n");
}

function formatMarkdown(headers, rows, maxCols = 10) {
  function mdCell(v) {
    let s = v == null ? "NULL" : String(v);
    s = s.replace(/\n/g, " ");
    if (s.length > 80) s = s.substring(0, 77) + "...";
    s = s.replace(/\|/g, "\\|");
    return s;
  }

  const shownHeaders = headers.slice(0, maxCols);
  const shownRows = rows.map((r) => r.slice(0, maxCols));

  const output = [];
  output.push("| " + shownHeaders.map(mdCell).join(" | ") + " |");
  output.push("|" + shownHeaders.map(() => "---").join("|") + "|");
  for (const row of shownRows) {
    output.push("| " + row.map(mdCell).join(" | ") + " |");
  }
  if (headers.length > maxCols) {
    output.push("");
    output.push(`[NOTE] Markdown output truncated to first ${maxCols} columns.`);
  }

  return output.join("\n");
}

// ── Query builder ────────────────────────────────────────────────────

/**
 * Build a queries array from CLI arguments.
 */
function buildQueries(opts) {
  // Metrics: simple names (no parens) → saved metric reference (string)
  //          SQL expressions (with parens) → adhoc metric object
  const metrics = (opts.metrics || "")
    .split(",")
    .filter(Boolean)
    .map((expr, i) => {
      const trimmed = expr.trim();
      if (/[()]/.test(trimmed)) {
        return {
          expressionType: "SQL",
          sqlExpression: trimmed,
          label: `metric_${i}`,
          hasCustomLabel: false,
        };
      }
      // Simple name → saved metric reference
      return trimmed;
    });

  const columns = (opts.columns || "").split(",").filter(Boolean);

  const filters = [];
  if (opts.timeRange) {
    filters.push({ col: opts.granularity || columns[0] || "__time", op: "TEMPORAL_RANGE", val: opts.timeRange });
  }
  if (opts.filters) {
    try {
      const parsed = JSON.parse(opts.filters);
      filters.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (e) {
      throw new Error(`--filters must be valid JSON: ${e.message}`);
    }
  }

  return [
    {
      columns,
      metrics,
      filters,
      granularity: opts.granularity || null,
      time_range: opts.timeRange || null,
      row_limit: opts.rowLimit,
      orderby: metrics.length > 0 ? [[metrics[0], false]] : [],
    },
  ];
}

/**
 * Get dataset metadata (columns, metrics, main_dttm_col, etc.)
 * GET /api/v1/dataset/<datasetId>
 */
async function getDatasetDetail(datasetId) {
  const url = `${API_BASE}/api/v1/dataset/${datasetId}`;
  console.error(`[superset] Fetching dataset ${datasetId} detail …`);
  return await request("GET", url);
}

// ── Chart param helpers ──────────────────────────────────────────────

/**
 * Extract datasource ID and type from chart detail response.
 */
function extractDatasource(chart, params) {
  if (chart.query_context) {
    try {
      const qc = typeof chart.query_context === "string"
        ? JSON.parse(chart.query_context) : chart.query_context;
      if (qc.datasource?.id) {
        return { datasourceId: qc.datasource.id, datasourceType: qc.datasource.type || "table" };
      }
    } catch { /* ignore */ }
  }
  if (params.datasource) {
    const parts = String(params.datasource).split("__");
    if (parts.length === 2 && !isNaN(parseInt(parts[0], 10))) {
      return { datasourceId: parseInt(parts[0], 10), datasourceType: parts[1] || "table" };
    }
  }
  return { datasourceId: chart.datasource_id || null, datasourceType: chart.datasource_type || "table" };
}

function parseChartParams(chart) {
  const params = typeof chart.params === "string" ? JSON.parse(chart.params) : chart.params || {};
  const mapMetrics = (arr) => (arr || []).map((m) => {
    if (typeof m === "string") return m;
    return m.label || m.column?.column_name || JSON.stringify(m);
  });
  const rawMetricsArr = params.metrics || (params.metric != null ? [params.metric] : []);
  const metrics = mapMetrics(rawMetricsArr);
  const groupby = params.groupby || params.columns || [
    ...(params.groupbyRows || []),
    ...(params.groupbyColumns || []),
  ];
  const xAxis = params.x_axis;
  const xAxisIsExpr = xAxis && typeof xAxis === "object";
  const granularity = params.granularity_sqla
    || (typeof xAxis === "string" ? xAxis : null)
    || (typeof params.granularity === "string" ? params.granularity : null);
  const timeRange = params.time_range || "No filter";
  const timeGrain = params.time_grain_sqla || null;
  const adhocFilters = params.adhoc_filters || [];
  const { datasourceId, datasourceType } = extractDatasource(chart, params);

  const result = {
    metrics, rawMetrics: rawMetricsArr, groupby, granularity, timeRange, timeGrain,
    adhocFilters, vizType: chart.viz_type || params.viz_type || "unknown",
    datasourceId, datasourceType, rowLimit: params.row_limit || 1000,
    xAxisExpr: xAxisIsExpr ? xAxis : null,
  };

  if ((chart.viz_type || params.viz_type) === "mixed_timeseries" && params.metrics_b) {
    result.metricsB = mapMetrics(params.metrics_b);
    result.rawMetricsB = params.metrics_b;
    result.groupbyB = params.groupby_b || [];
    result.adhocFiltersB = params.adhoc_filters_b || [];
    result.rowLimitB = params.row_limit_b || 1000;
  }

  return result;
}

function buildWhereFilters(adhocFilters) {
  const filters = [];
  const sqlParts = [];
  for (const af of (adhocFilters || [])) {
    if (af.clause?.toUpperCase() !== "WHERE") continue;
    if (af.expressionType === "SIMPLE" && af.subject) {
      filters.push({ col: af.subject, op: af.operator || "==", val: af.comparator });
    } else if (af.expressionType === "SQL" && af.sqlExpression) {
      sqlParts.push(af.sqlExpression);
    }
  }
  const extraWhere = sqlParts.length ? `(${sqlParts.join(") AND (")})` : "";
  return { filters, extraWhere };
}

function calcChangeRate(current, previous) {
  if (previous === 0) return current !== 0 ? Infinity : 0;
  return (current - previous) / Math.abs(previous);
}

function fmtPct(rate) {
  if (!isFinite(rate) || Math.abs(rate) >= 9999) return "N/A (new)";
  const pct = (rate * 100).toFixed(2);
  return rate > 0 ? `+${pct}%` : `${pct}%`;
}

function fmtNum(n) {
  if (n == null) return "NULL";
  return typeof n === "number" ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(n);
}

// ── Dataset & Chart write API ───────────────────────────────────────

async function searchDatasets(keyword, pageSize = 25) {
  const q = JSON.stringify({
    filters: [{ col: "table_name", opr: "ct", value: keyword }],
    page: 0,
    page_size: pageSize,
    order_column: "changed_on_delta_humanized",
    order_direction: "desc",
  });
  const url = `${API_BASE}/api/v1/dataset/?q=${encodeURIComponent(q)}`;
  console.error(`[superset] Searching datasets matching "${keyword}" …`);
  return await request("GET", url);
}

async function createChart(payload) {
  const url = `${API_BASE}/api/v1/chart/`;
  console.error(`[superset] Creating chart "${payload.slice_name}" …`);
  return await request("POST", url, payload);
}

async function updateChart(chartId, payload) {
  const url = `${API_BASE}/api/v1/chart/${chartId}`;
  console.error(`[superset] Updating chart ${chartId} …`);
  return await request("PUT", url, payload);
}

// ── Exports ─────────────────────────────────────────────────────────

export {
  getChartData,
  queryChartData,
  getChartDetail,
  getDatasetDetail,
  searchCharts,
  searchDatasets,
  createChart,
  updateChart,
  extractTable,
  formatTable,
  formatMarkdown,
  parseChartParams,
  buildWhereFilters,
  buildQueryFromParams,
  buildQueryContext,
  extractDatasource,
  calcChangeRate,
  fmtPct,
  fmtNum,
};

// ── CLI ──────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("query_chart.mjs")) {
  const { values } = parseArgs({
    options: {
      search: { type: "string" },
      "chart-id": { type: "string" },
      "dataset-id": { type: "string" },
      metrics: { type: "string" },
      columns: { type: "string" },
      "time-range": { type: "string" },
      granularity: { type: "string" },
      "row-limit": { type: "string", default: "1000" },
      filters: { type: "string" },
      format: { type: "boolean", default: false },
      markdown: { type: "boolean", default: false },
      info: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const searchKeyword = values.search;
  const chartId = values["chart-id"];
  const datasetId = values["dataset-id"];
  const doFormat = values.format;
  const doMarkdown = values.markdown;
  const doInfo = values.info;

  if (!chartId && !datasetId && !searchKeyword) {
    console.error("Usage:");
    console.error("  node query_chart.mjs --search <keyword>                        # fuzzy search charts by name");
    console.error("  node query_chart.mjs --chart-id <id> [--format|--markdown|--info]");
    console.error("  node query_chart.mjs --dataset-id <id> --metrics <expr,...> [--columns <col,...>] [--time-range <range>] [--format|--markdown]");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        // --search: list charts matching keyword
        if (searchKeyword) {
          const data = await searchCharts(searchKeyword);
          const charts = data.result || [];
          console.log(`Found ${data.count ?? charts.length} chart(s):\n`);
          for (const c of charts) {
            const ds = c.datasource_name_text || "-";
            const dashboards = (c.dashboards || []).map((d) => d.id).join(",") || "-";
            console.log(`  #${c.id}  ${c.slice_name}`);
            console.log(`        viz: ${c.viz_type}  dataset: ${ds}  dashboards: [${dashboards}]  changed: ${c.changed_on_delta_humanized || ""}`);
          }
          return;
        }

        // --info: show chart metadata only
        if (doInfo && chartId) {
          const detail = await getChartDetail(chartId);
          const r = detail.result;
          console.log(`Chart #${r.id}: ${r.slice_name}`);
          console.log(`  viz_type: ${r.viz_type}`);
          console.log(`  dashboards: ${(r.dashboards || []).map((d) => `${d.id} (${d.dashboard_title})`).join(", ") || "none"}`);
          console.log(`  params: ${(r.params || "N/A").substring(0, 200)}`);
          return;
        }

        let payload;
        if (chartId) {
          payload = await getChartData(chartId);
        } else {
          const queries = buildQueries({
            metrics: values.metrics,
            columns: values.columns,
            timeRange: values["time-range"],
            granularity: values.granularity,
            filters: values.filters,
            rowLimit: parseInt(values["row-limit"], 10) || 1000,
          });
          payload = await queryChartData(parseInt(datasetId, 10), queries);
        }

        // Output
        if (doFormat || doMarkdown) {
          const { headers, rows } = extractTable(payload);
          if (headers.length && rows.length) {
            const first = payload.result[0];
            console.error(`[superset] ${first.rowcount} rows, cached=${first.is_cached}`);
            console.log();
            console.log(doMarkdown ? formatMarkdown(headers, rows) : formatTable(headers, rows));
          } else {
            console.log(JSON.stringify(payload));
          }
        } else {
          console.log(JSON.stringify(payload));
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
