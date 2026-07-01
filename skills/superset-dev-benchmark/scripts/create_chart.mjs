#!/usr/bin/env node

/**
 * Chart Creation Helper
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Modes:
 *   --search-dataset <keyword>   Search datasets by name
 *   --dataset-info <id>          Show dataset columns, metrics, time columns
 *   --preview                    Validate and preview chart config (stdin JSON, no API call)
 *   --create                     Create chart from stdin JSON config
 *   --update <chart_id>          Update chart: GET current -> merge stdin changes -> PUT
 */

import { parseArgs } from "node:util";
import {
  searchDatasets, getDatasetDetail, getChartDetail, createChart, updateChart,
  buildQueryContext, extractDatasource,
} from "./query_chart.mjs";
import { SUPERSET_WEB_BASE } from "./http.mjs";

// ── Dataset info formatting ─────────────────────────────────────────

function formatDatasetInfo(detail) {
  const r = detail.result;
  const columns = r.columns || [];
  const metrics = r.metrics || [];
  const mainDttm = r.main_dttm_col || null;

  const timeColumns = columns.filter((c) => c.is_dttm);
  const dimColumns = columns.filter((c) => c.groupby && !c.is_dttm);
  const numericTypes = new Set(["INT", "INTEGER", "BIGINT", "FLOAT", "DOUBLE", "DECIMAL", "NUMERIC", "NUMBER", "REAL"]);
  const numericColumns = columns.filter((c) => {
    if (c.is_dttm || c.groupby) return false;
    const t = (c.type || "").toUpperCase();
    return [...numericTypes].some((nt) => t.includes(nt));
  });

  const lines = [];
  lines.push(`Dataset: ${r.table_name || r.datasource_name || r.name} (#${r.id})`);
  lines.push(`Database: ${r.database?.database_name || r.database?.name || "-"}`);
  if (r.schema) lines.push(`Schema: ${r.schema}`);
  if (r.description) lines.push(`Description: ${r.description}`);
  lines.push(``);

  lines.push(`Time columns (${timeColumns.length}):`);
  if (timeColumns.length) {
    for (const c of timeColumns) {
      const main = c.column_name === mainDttm ? " [main]" : "";
      lines.push(`  ${c.column_name} (${c.type || "-"})${main}`);
    }
  } else {
    lines.push(`  (none)`);
  }
  lines.push(``);

  lines.push(`Dimension columns (${dimColumns.length}):`);
  if (dimColumns.length) {
    for (const c of dimColumns) {
      const filterable = c.filterable ? " [filterable]" : "";
      lines.push(`  ${c.column_name} (${c.type || "-"})${filterable}`);
    }
  } else {
    lines.push(`  (none)`);
  }
  lines.push(``);

  lines.push(`Saved metrics (${metrics.length}):`);
  if (metrics.length) {
    for (const m of metrics) {
      lines.push(`  ${m.metric_name}: ${m.expression || "-"}`);
    }
  } else {
    lines.push(`  (none)`);
  }
  lines.push(``);

  if (numericColumns.length) {
    lines.push(`Numeric columns (${numericColumns.length}, for adhoc aggregation):`);
    for (const c of numericColumns) {
      lines.push(`  ${c.column_name} (${c.type || "-"})`);
    }
    lines.push(``);
  }

  lines.push(`Total columns: ${columns.length}`);
  return lines.join("\n");
}

// Absolute time range like "2026-06-07T22:56 : 2026-06-07T23:56" or
// "2026-06-07 : 2026-06-08" — Superset stores it verbatim, which means the
// dashboard "expires" the moment now() leaves the window and screenshots fail.
// Relative ranges ("Last week", "Last 7 days", "previous calendar month",
// "DATEADD(...)", "No filter") survive indefinitely.
function isAbsoluteTimeRange(s) {
  if (!s || typeof s !== "string") return false;
  const trimmed = s.trim();
  if (!trimmed || trimmed === "No filter") return false;
  // Look for ISO-like dates on either side of the " : " separator.
  const isoLike = /\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?/;
  const parts = trimmed.split(":").map((p) => p.trim());
  // Forms: "<iso> : <iso>", "<iso> : now", "<iso>" (single point)
  if (parts.length >= 2) {
    const left = parts[0];
    const right = parts.slice(1).join(":").trim(); // re-join in case the iso contained ':'
    if (isoLike.test(left) || isoLike.test(right)) return true;
  }
  return isoLike.test(trimmed) && !/^(last|previous|next|today|yesterday|now|no filter)/i.test(trimmed);
}

// Build the LLM-facing fix template for a bare-string metric that isn't in
// dataset.saved_metrics. Centralised so both the array (`metrics`) and singular
// (`metric`) paths give the same message.
function metricNotSavedError(metricName, ds, dsMetrics) {
  return (
    `Metric "${metricName}" is not a saved metric on dataset "${ds.table_name || ds.name || `#${ds.id}`}". ` +
    `Available saved metrics: ${dsMetrics.join(", ") || "(none)"}. ` +
    `Use either a saved metric name (after defining it on the dataset) or an adhoc metric: ` +
    `{"expressionType":"SQL","sqlExpression":"count(*)","label":"count"} or ` +
    `{"expressionType":"SIMPLE","aggregate":"COUNT","column":{"column_name":"id"},"label":"count"}.`
  );
}

function validateConfig(config, datasetDetail) {
  const errors = [];
  const warnings = [];
  const ds = datasetDetail.result;
  const dsColumns = (ds.columns || []).map((c) => c.column_name);
  const dsMetrics = (ds.metrics || []).map((m) => m.metric_name);
  if (!config.slice_name) warnings.push("slice_name is required");
  if (!config.dataset_id) warnings.push("dataset_id is required");
  if (!config.viz_type) warnings.push("viz_type is required");
  const params = config.params || {};

  // ── HARD: bare-string metric must be a saved metric on the dataset ──
  // Most common LLM failure: metrics:["count"] when the dataset has no SqlMetric
  // row named "count". Superset rejects with a 400 the ALB then masks as HTML,
  // so catching it here saves a verify cycle.
  //
  // EXCEPTION: a string containing parentheses is a SQL expression
  // ("count(*)", "sum(amount)", "DATE_TRUNC('day', x)") — Superset accepts
  // these as inline adhoc SQL metrics. Skip the saved-metric check for them.
  const isLikelySqlExpr = (s) => /[()]/.test(s);
  for (const m of params.metrics || []) {
    if (typeof m !== "string") continue;
    if (isLikelySqlExpr(m)) continue;
    if (!dsMetrics.includes(m)) errors.push(metricNotSavedError(m, ds, dsMetrics));
  }
  // pie/funnel/big_number use the singular `metric` field with the same rule.
  if (typeof params.metric === "string" && params.metric && !isLikelySqlExpr(params.metric) && !dsMetrics.includes(params.metric)) {
    errors.push(metricNotSavedError(params.metric, ds, dsMetrics));
  }

  // ── HARD: echarts_timeseries* params.columns must not mix dicts & strings ──
  // The UI always writes either an all-string list (saved column names) or an
  // all-dict list (adhoc SQL/SIMPLE columns) into params.columns. LLMs commonly
  // produce [{base_axis dict}, "status"] which new Superset rejects.
  // Note: params.groupby is unaffected — it accepts bare strings always.
  if (isTimeseriesVizType(config.viz_type) && Array.isArray(params.columns)) {
    const hasDict = params.columns.some((c) => c && typeof c === "object");
    const hasBareString = params.columns.some((c) => typeof c === "string");
    if (hasDict && hasBareString) {
      const bareStrings = params.columns.filter((c) => typeof c === "string");
      errors.push(
        `viz_type "${config.viz_type}": params.columns mixes adhoc dicts and bare strings (${JSON.stringify(bareStrings)}). ` +
        `New Superset rejects this. Move the bare column name(s) into params.groupby (which accepts strings), ` +
        `or wrap each as {"label":"<name>","sqlExpression":"<name>","expressionType":"SQL"}.`
      );
    }
  }

  // Groupby is normally an array of column names, but heatmap_v2 stores it as
  // a single string. Normalize to array before iterating so we don't shred a
  // string into per-character "columns".
  const groupbyList = Array.isArray(params.groupby)
    ? params.groupby
    : (typeof params.groupby === "string" && params.groupby ? [params.groupby] : []);
  for (const col of groupbyList) {
    if (typeof col === "string" && !dsColumns.includes(col)) warnings.push(`Groupby column "${col}" not found in dataset`);
  }

  // ── HARD: time column must really be temporal ──────────────────────
  // x_axis / granularity_sqla pointing to a column flagged `is_dttm=true` but
  // whose `type` is non-temporal (TEXT / VARCHAR / BIGINT / ...) AND with an
  // empty `expression` is a dataset misconfiguration. Verified empirically
  // against superset.example.invalid dataset #23 (column `status`, type TEXT):
  //   - time_grain_sqla query → HTTP 400
  //   - TEMPORAL_RANGE filter (no grain) → HTTP 200 but rowcount=0 (silent)
  // Either way the chart is broken; catch it here so it never gets created.
  const TEMPORAL_TYPE_PREFIX = /^(TIMESTAMP|DATETIME|DATE|TIME)\b/i;
  const timeCol = params.granularity_sqla || params.x_axis;
  if (timeCol && typeof timeCol === "string") {
    const colDef = (ds.columns || []).find((c) => c.column_name === timeCol);
    if (!colDef) {
      warnings.push(`Time column "${timeCol}" not found in dataset`);
    } else if (colDef.is_dttm && !TEMPORAL_TYPE_PREFIX.test(colDef.type || "") && !colDef.expression) {
      errors.push(
        `Time column "${timeCol}" on dataset "${ds.table_name}" is misconfigured: ` +
        `is_dttm=true but column type is "${colDef.type || "?"}" (non-temporal) and column.expression is empty. ` +
        `Time-based queries on this column will fail (timeGrain → HTTP 400) or silently return 0 rows (TEMPORAL_RANGE filter). ` +
        `Fix the dataset column by either ` +
        `(a) setting expression to a SQL cast such as \`CAST(${timeCol} AS TIMESTAMP)\` or \`TO_TIMESTAMP(${timeCol}, 'YYYY-MM-DD')\`, ` +
        `(b) unchecking is_dttm if "${timeCol}" isn't actually a date, or ` +
        `(c) picking a different column that's already temporal.`
      );
    }
  }
  for (const f of params.adhoc_filters || []) {
    if (f.expressionType === "SIMPLE" && f.subject && !dsColumns.includes(f.subject)) warnings.push(`Filter column "${f.subject}" not found in dataset`);
    if (f.expressionType === "SIMPLE" && f.operator === "TEMPORAL_RANGE" && isAbsoluteTimeRange(f.comparator)) {
      warnings.push(`Absolute time range "${f.comparator}" on filter "${f.subject}" — screenshots and refreshes will break once the window is in the past. Prefer relative ranges like "Last week", "Last 24 hours", "previous calendar month", or "No filter". For a genuinely fixed window, encode it as a dashboard-level filter_time Native Filter with defaultDataMask (see references/dashboard_filters.md "Fixed absolute time window" pattern) and keep the chart's own time_range relative.`);
    }
  }
  if (isAbsoluteTimeRange(params.time_range)) {
    warnings.push(`Absolute time_range "${params.time_range}" — screenshots and refreshes will break once the window is in the past. Prefer relative ranges like "Last week", "Last 24 hours", "previous calendar month", or "No filter". For a genuinely fixed window, encode it as a dashboard-level filter_time Native Filter with defaultDataMask (see references/dashboard_filters.md "Fixed absolute time window" pattern) and keep the chart's own time_range relative.`);
  }
  return { valid: errors.length === 0, errors, warnings };
}

// Time-series viz types in Superset all share the `echarts_timeseries_*` family
// (line, bar, area, scatter, smooth, step). They pick up `granularity_sqla`
// from params; if it's missing while `x_axis` is set, Superset falls back to
// the dataset's main_dttm_col, which often differs from x_axis and produces
// a TEMPORAL_RANGE filter on the wrong column.
function isTimeseriesVizType(vt) {
  return typeof vt === "string" && vt.startsWith("echarts_timeseries");
}

function buildPayload(config) {
  const dsId = config.dataset_id;
  const dsType = config.dataset_type || "table";
  const params = { ...config.params };
  params.datasource = `${dsId}__${dsType}`;
  params.viz_type = config.viz_type;
  if (isTimeseriesVizType(config.viz_type) && params.x_axis && !params.granularity_sqla) {
    params.granularity_sqla = params.x_axis;
  }
  const xAxis = params.x_axis || params.granularity_sqla;
  if (xAxis) {
    const filters = params.adhoc_filters || [];
    const hasTemporalFilter = filters.some((f) => f.expressionType === "SIMPLE" && f.operator === "TEMPORAL_RANGE" && f.subject === xAxis);
    if (!hasTemporalFilter) {
      params.adhoc_filters = [...filters, { clause: "WHERE", subject: xAxis, operator: "TEMPORAL_RANGE", comparator: "No filter", expressionType: "SIMPLE" }];
    }
  }
  const payload = { slice_name: config.slice_name, datasource_id: dsId, datasource_type: dsType, viz_type: config.viz_type, params: JSON.stringify(params) };
  // Save a complete query_context so GET /api/v1/chart/<id>/data/ resolves
  // directly without falling back to the POST builder. Same shape as the
  // POST fallback uses (datasource + queries[]); no form_data.
  payload.query_context = JSON.stringify(buildQueryContext(dsId, dsType, params, config.viz_type));
  if (config.dashboards?.length) payload.dashboards = config.dashboards;
  if (config.description) payload.description = config.description;
  if (config.owners?.length) payload.owners = config.owners;
  return payload;
}

function formatPreview(config, validation) {
  const params = config.params || {};
  const lines = [];
  lines.push(`=== Chart Preview ===`);
  lines.push(`Name: ${config.slice_name || "(missing)"}`);
  lines.push(`Type: ${config.viz_type || "(missing)"}`);
  lines.push(`Dataset: #${config.dataset_id || "?"} (${config.dataset_type || "table"})`);
  if (config.dashboards?.length) lines.push(`Dashboards: [${config.dashboards.join(", ")}]`);
  lines.push(``);
  const metrics = params.metrics || [];
  lines.push(`Metrics (${metrics.length}):`);
  for (const m of metrics) {
    if (typeof m === "string") lines.push(`  ${m} (saved metric)`);
    else if (m.expressionType === "SQL") lines.push(`  ${m.label || m.sqlExpression} (SQL expression)`);
    else if (m.expressionType === "SIMPLE") lines.push(`  ${m.label || `${m.aggregate}(${m.column?.column_name})`} (adhoc)`);
    else lines.push(`  ${JSON.stringify(m)}`);
  }
  lines.push(``);
  if (params.groupby?.length) lines.push(`Dimensions: ${params.groupby.join(", ")}`);
  const timeCol = params.granularity_sqla || params.x_axis;
  if (timeCol) lines.push(`Time column: ${timeCol}${params.time_grain_sqla ? ` (grain: ${params.time_grain_sqla})` : ""}`);
  if (params.time_range && params.time_range !== "No filter") lines.push(`Time range: ${params.time_range}`);
  const filters = params.adhoc_filters || [];
  if (filters.length) {
    lines.push(`Filters (${filters.length}):`);
    for (const f of filters) {
      if (f.expressionType === "SIMPLE") lines.push(`  ${f.subject} ${f.operator} ${JSON.stringify(f.comparator)}`);
      else if (f.expressionType === "SQL") lines.push(`  SQL: ${f.sqlExpression}`);
    }
  }
  lines.push(``);
  if (validation.errors?.length) {
    lines.push(`Errors (${validation.errors.length}) — --create will be refused without --force:`);
    for (const e of validation.errors) lines.push(`  - ${e}`);
    lines.push(``);
  }
  if (validation.warnings.length) {
    lines.push(`Warnings (${validation.warnings.length}):`);
    for (const w of validation.warnings) lines.push(`  - ${w}`);
  } else if (!validation.errors?.length) {
    lines.push(`Validation: OK`);
  }
  return lines.join("\n");
}

function mergeChartUpdate(currentDetail, updates) {
  const payload = {};
  const warnings = [];
  if (updates.slice_name !== undefined) payload.slice_name = updates.slice_name;
  if (updates.viz_type !== undefined) payload.viz_type = updates.viz_type;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.dashboards !== undefined) payload.dashboards = updates.dashboards;
  if (updates.cache_timeout !== undefined) payload.cache_timeout = updates.cache_timeout;
  let currentParams = {};
  try { currentParams = typeof currentDetail.params === "string" ? JSON.parse(currentDetail.params) : (currentDetail.params || {}); } catch { /* empty */ }
  if (updates.params !== undefined) {
    const mergedParams = { ...currentParams, ...updates.params };
    // Apply same time-series guardrail as --create: if final viz_type is a
    // time-series chart and x_axis is set without granularity_sqla, mirror it.
    const finalVizType = updates.viz_type ?? currentDetail.viz_type;
    if (isTimeseriesVizType(finalVizType) && mergedParams.x_axis && !mergedParams.granularity_sqla) {
      mergedParams.granularity_sqla = mergedParams.x_axis;
    }
    if (isAbsoluteTimeRange(mergedParams.time_range)) {
      warnings.push(`Absolute time_range "${mergedParams.time_range}" — screenshots and refreshes will break once the window is in the past. Prefer relative ranges like "Last week", "Last 24 hours", "previous calendar month", or "No filter". For a genuinely fixed window, encode it as a dashboard-level filter_time Native Filter with defaultDataMask (see references/dashboard_filters.md "Fixed absolute time window" pattern) and keep the chart's own time_range relative.`);
    }
    for (const f of mergedParams.adhoc_filters || []) {
      if (f?.expressionType === "SIMPLE" && f.operator === "TEMPORAL_RANGE" && isAbsoluteTimeRange(f.comparator)) {
        warnings.push(`Absolute time range "${f.comparator}" on filter "${f.subject}" — screenshots and refreshes will break once the window is in the past. Prefer relative ranges like "Last week", "Last 24 hours", "previous calendar month", or "No filter". For a genuinely fixed window, encode it as a dashboard-level filter_time Native Filter with defaultDataMask (see references/dashboard_filters.md "Fixed absolute time window" pattern) and keep the chart's own time_range relative.`);
      }
    }
    // viz_type lives in both the top-level chart record and inside params;
    // when updating, keep the two in lock-step in a single stringify.
    if (updates.viz_type !== undefined) mergedParams.viz_type = updates.viz_type;
    payload.params = JSON.stringify(mergedParams);
  }

  // Rebuild query_context whenever params or viz_type change so GET-data
  // stays consistent with the saved chart (otherwise it'd serve stale rows
  // from the previous query_context). When neither changes, leave the key
  // absent so Superset preserves the existing query_context as-is.
  if (updates.params !== undefined || updates.viz_type !== undefined) {
    const finalParams = updates.params !== undefined
      ? { ...currentParams, ...updates.params, ...(updates.viz_type !== undefined ? { viz_type: updates.viz_type } : {}) }
      : currentParams;
    const finalVizType = updates.viz_type ?? currentDetail.viz_type;
    const ds = extractDatasource(currentDetail, finalParams);
    if (ds.datasourceId) {
      payload.query_context = JSON.stringify(buildQueryContext(ds.datasourceId, ds.datasourceType, finalParams, finalVizType));
    }
  }
  return { payload, warnings };
}

export { formatDatasetInfo, validateConfig, buildPayload, mergeChartUpdate };

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("create_chart.mjs")) {
  const { values } = parseArgs({
    options: {
      "search-dataset": { type: "string" },
      "dataset-info": { type: "string" },
      preview: { type: "boolean", default: false },
      create: { type: "boolean", default: false },
      update: { type: "string" },
      json: { type: "boolean", default: false },
      force: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const searchKeyword = values["search-dataset"];
  const datasetInfoId = values["dataset-info"];
  const doPreview = values.preview;
  const doCreate = values.create;
  const updateChartId = values.update;
  const rawJson = values.json;
  const force = values.force;

  if (!searchKeyword && !datasetInfoId && !doPreview && !doCreate && !updateChartId) {
    console.error("Usage:");
    console.error("  node create_chart.mjs --search-dataset <keyword>");
    console.error("  node create_chart.mjs --dataset-info <id>");
    console.error("  echo '<config>' | node create_chart.mjs --preview");
    console.error("  echo '<config>' | node create_chart.mjs --create [--force]");
    console.error("  echo '<updates>' | node create_chart.mjs --update <chart_id> [--force]");
    console.error("");
    console.error("--force bypasses validation hard-fails (bare-string metric not in saved");
    console.error("        metrics; echarts_timeseries* params.columns mixing dicts and strings).");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        if (searchKeyword) {
          const data = await searchDatasets(searchKeyword);
          if (rawJson) { console.log(JSON.stringify(data, null, 2)); return; }
          const datasets = data.result || [];
          console.log(`Found ${data.count ?? datasets.length} dataset(s):\n`);
          for (const ds of datasets) {
            console.log(`  #${ds.id}  ${ds.table_name}`);
            console.log(`        schema: ${ds.schema || "-"}  database: ${ds.database?.database_name || ds.database?.name || "-"}  changed: ${ds.changed_on_delta_humanized || ""}`);
          }
          return;
        }
        if (datasetInfoId) {
          const detail = await getDatasetDetail(parseInt(datasetInfoId, 10));
          console.log(rawJson ? JSON.stringify(detail, null, 2) : formatDatasetInfo(detail));
          return;
        }
        if (updateChartId) {
          const chunks = [];
          for await (const chunk of process.stdin) chunks.push(chunk);
          const updates = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
          console.error(`[update] Fetching current chart ${updateChartId} …`);
          const detail = await getChartDetail(parseInt(updateChartId, 10));

          // Re-run the same validation as --create when params/viz_type change.
          // Pure metadata updates (slice_name, dashboards, ...) skip the dataset
          // fetch — they can't introduce metric/columns errors by definition.
          if (updates.params !== undefined || updates.viz_type !== undefined) {
            const currentParams = (() => {
              try { return typeof detail.result.params === "string" ? JSON.parse(detail.result.params) : (detail.result.params || {}); }
              catch { return {}; }
            })();
            const mergedParams = updates.params !== undefined ? { ...currentParams, ...updates.params } : currentParams;
            const finalVizType = updates.viz_type ?? detail.result.viz_type;
            const ds = extractDatasource(detail.result, mergedParams);
            if (ds.datasourceId) {
              const dsDetail = await getDatasetDetail(ds.datasourceId);
              const v = validateConfig(
                { slice_name: detail.result.slice_name, dataset_id: ds.datasourceId, viz_type: finalVizType, params: mergedParams },
                dsDetail,
              );
              if (v.errors.length) {
                console.error(`[update] Validation errors (${v.errors.length}):`);
                for (const e of v.errors) console.error(`  - ${e}`);
                if (!force) {
                  console.error(``);
                  console.error(`Refusing to update — fix the errors above, or pass --force to override.`);
                  process.exitCode = 1;
                  return;
                }
                console.error(`(--force) Continuing despite errors.`);
                console.error(``);
              }
            }
          }

          const { payload, warnings } = mergeChartUpdate(detail.result, updates);
          if (warnings.length) {
            console.error(`[update] Warnings:`);
            for (const w of warnings) console.error(`  - ${w}`);
            console.error(``);
          }
          if (!Object.keys(payload).length) { console.error("Error: no changes to apply"); process.exitCode = 1; return; }
          console.error(`[update] Changes to apply:`);
          for (const [key, val] of Object.entries(payload)) console.error(key === "params" ? `  params: (merged JSON, ${val.length} chars)` : `  ${key}: ${JSON.stringify(val)}`);
          const result = await updateChart(parseInt(updateChartId, 10), payload);
          console.log(JSON.stringify(result, null, 2));
          console.error(`[update] View chart: ${SUPERSET_WEB_BASE}/explore/?slice_id=${updateChartId}`);
          return;
        }
        const chunks = [];
        for await (const chunk of process.stdin) chunks.push(chunk);
        const config = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
        if (!config.dataset_id) { console.error("Error: config must include dataset_id"); process.exitCode = 1; return; }
        const detail = await getDatasetDetail(config.dataset_id);
        const validation = validateConfig(config, detail);
        if (doPreview) {
          console.log(rawJson ? JSON.stringify({ payload: buildPayload(config), validation }, null, 2) : formatPreview(config, validation));
          return;
        }
        if (doCreate) {
          if (validation.errors.length) {
            console.error(`Validation errors (${validation.errors.length}):`);
            for (const e of validation.errors) console.error(`  - ${e}`);
            if (!force) {
              console.error(``);
              console.error(`Refusing to create — fix the errors above, or pass --force to override.`);
              process.exitCode = 1;
              return;
            }
            console.error(`(--force) Continuing despite errors.`);
            console.error(``);
          }
          if (validation.warnings.length) { console.error(`Validation warnings:`); for (const w of validation.warnings) console.error(`  - ${w}`); console.error(``); }
          const payload = buildPayload(config);
          console.error(`[create] Creating chart "${config.slice_name}" …`);
          const result = await createChart(payload);
          console.log(JSON.stringify(result, null, 2));
          if (result.id) console.error(`[create] View chart: ${SUPERSET_WEB_BASE}/explore/?slice_id=${result.id}`);
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
