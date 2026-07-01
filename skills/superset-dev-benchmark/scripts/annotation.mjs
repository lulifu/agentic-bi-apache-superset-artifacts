#!/usr/bin/env node

/**
 * Superset Annotation Client
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * API endpoints:
 *   GET    /api/v1/annotation_layer/                       — list layers
 *   GET    /api/v1/annotation_layer/<id>                   — layer detail
 *   GET    /api/v1/annotation_layer/<id>/annotation/       — list annotations in layer
 *   POST   /api/v1/annotation_layer/<id>/annotation/       — create annotation
 *
 * Chart→layer link: each entry in slice.params.annotation_layers with
 *   sourceType === "NATIVE" has value = annotation_layer.id (int).
 */

import { parseArgs } from "node:util";
import { API_BASE, request } from "./http.mjs";
import { getChartDetail } from "./query_chart.mjs";
import { getDashboardCharts } from "./query_dashboard.mjs";

// ── Annotation layer API ─────────────────────────────────────────────

async function listAnnotationLayers(pageSize = 100) {
  const q = JSON.stringify({ page: 0, page_size: pageSize, order_column: "name", order_direction: "asc" });
  const url = `${API_BASE}/api/v1/annotation_layer/?q=${encodeURIComponent(q)}`;
  console.error(`[superset] Listing annotation layers …`);
  return await request("GET", url);
}

async function getAnnotationLayer(layerId) {
  const url = `${API_BASE}/api/v1/annotation_layer/${layerId}`;
  console.error(`[superset] Fetching annotation layer ${layerId} …`);
  return await request("GET", url);
}

async function listAnnotations(layerId, pageSize = 100) {
  const q = JSON.stringify({ page: 0, page_size: pageSize, order_column: "start_dttm", order_direction: "desc" });
  const url = `${API_BASE}/api/v1/annotation_layer/${layerId}/annotation/?q=${encodeURIComponent(q)}`;
  console.error(`[superset] Listing annotations in layer ${layerId} …`);
  return await request("GET", url);
}

async function createAnnotation(layerId, payload) {
  const url = `${API_BASE}/api/v1/annotation_layer/${layerId}/annotation/`;
  console.error(`[superset] Creating annotation in layer ${layerId} …`);
  return await request("POST", url, payload);
}

// ── Dashboard → native layers composition ────────────────────────────

/**
 * List charts in a dashboard that have NATIVE annotation layers configured.
 * Returns [{ chartId, chartName, vizType, layers: [{ layerId, layerName, annotationType }] }].
 * Charts without native layers are omitted.
 */
async function listDashboardAnnotationLayers(dashboardId) {
  const chartsResp = await getDashboardCharts(dashboardId);
  const charts = chartsResp.result || [];

  const CONCURRENCY = 5;
  const perChart = [];
  for (let i = 0; i < charts.length; i += CONCURRENCY) {
    const batch = charts.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (chart) => {
        const chartId = chart.id || chart.slice_id;
        const detail = await getChartDetail(chartId);
        const r = detail.result || {};
        const params = typeof r.params === "string" ? JSON.parse(r.params || "{}") : (r.params || {});
        const raw = Array.isArray(params.annotation_layers) ? params.annotation_layers : [];
        const native = raw
          .filter((l) => l && l.sourceType === "NATIVE" && typeof l.value === "number")
          .map((l) => ({ layerId: l.value, annotationType: l.annotationType || "-", configName: l.name || "" }));
        if (!native.length) return null;
        return { chartId, chartName: r.slice_name || chart.slice_name, vizType: r.viz_type || chart.viz_type || "-", layers: native };
      })
    );
    for (const res of results) {
      if (res.status === "fulfilled" && res.value) perChart.push(res.value);
    }
  }

  // Resolve layer names in one batch.
  const uniqLayerIds = new Set();
  for (const c of perChart) for (const l of c.layers) uniqLayerIds.add(l.layerId);
  const nameById = new Map();
  if (uniqLayerIds.size) {
    const layersResp = await listAnnotationLayers(200);
    for (const row of layersResp.result || []) nameById.set(row.id, row.name);
  }
  for (const c of perChart) for (const l of c.layers) l.layerName = nameById.get(l.layerId) || "(unknown)";

  return perChart;
}

// ── Formatters ───────────────────────────────────────────────────────

function formatDashboardLayers(dashboardId, rows) {
  if (!rows.length) return `Dashboard ${dashboardId}: no charts with native annotation layers.`;
  const lines = [`Dashboard ${dashboardId} — ${rows.length} chart(s) with native annotation layers:\n`];
  for (const c of rows) {
    lines.push(`  chart #${c.chartId}  ${c.chartName}  (viz: ${c.vizType})`);
    for (const l of c.layers) {
      const pad = `layer #${l.layerId}`.padEnd(12);
      const nm = (l.layerName || "").padEnd(24);
      lines.push(`        ${pad}${nm}(${l.annotationType})`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

function formatAnnotationList(layerId, resp) {
  const items = resp.result || [];
  if (!items.length) return `Layer ${layerId}: no annotations.`;
  const lines = [`Layer ${layerId} — ${resp.count ?? items.length} annotation(s):\n`];
  for (const a of items) {
    lines.push(`  #${a.id}  ${a.short_descr}`);
    lines.push(`        ${a.start_dttm}  →  ${a.end_dttm}`);
    if (a.long_descr) lines.push(`        ${a.long_descr}`);
  }
  return lines.join("\n");
}

// ── Exports ──────────────────────────────────────────────────────────

export {
  listAnnotationLayers,
  getAnnotationLayer,
  listAnnotations,
  createAnnotation,
  listDashboardAnnotationLayers,
};

// ── CLI ──────────────────────────────────────────────────────────────

function usage() {
  console.error("Usage:");
  console.error("  node annotation.mjs --list-layers --dashboard-id <id> [--json]");
  console.error("  node annotation.mjs --list-annotations --layer-id <id> [--json]");
  console.error("  node annotation.mjs --add --layer-id <id> \\");
  console.error("      --short-descr \"<text>\" --start <ISO> --end <ISO> \\");
  console.error("      [--long-descr \"<text>\"] [--json-metadata '<json-string>'] [--json]");
}

if (process.argv[1]?.endsWith("annotation.mjs")) {
  const { values } = parseArgs({
    options: {
      "list-layers": { type: "boolean", default: false },
      "list-annotations": { type: "boolean", default: false },
      add: { type: "boolean", default: false },
      "dashboard-id": { type: "string" },
      "layer-id": { type: "string" },
      "short-descr": { type: "string" },
      "long-descr": { type: "string" },
      start: { type: "string" },
      end: { type: "string" },
      "json-metadata": { type: "string" },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const modes = ["list-layers", "list-annotations", "add"].filter((k) => values[k]);
  if (modes.length !== 1) {
    usage();
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        const raw = values.json;

        if (values["list-layers"]) {
          const dashId = values["dashboard-id"];
          if (!dashId) { usage(); process.exitCode = 1; return; }
          const rows = await listDashboardAnnotationLayers(dashId);
          if (raw) { console.log(JSON.stringify(rows)); return; }
          console.log(formatDashboardLayers(dashId, rows));
          return;
        }

        if (values["list-annotations"]) {
          const layerId = values["layer-id"];
          if (!layerId) { usage(); process.exitCode = 1; return; }
          const resp = await listAnnotations(layerId);
          if (raw) { console.log(JSON.stringify(resp)); return; }
          console.log(formatAnnotationList(layerId, resp));
          return;
        }

        if (values.add) {
          const layerId = values["layer-id"];
          const shortDescr = values["short-descr"];
          const start = values.start;
          const end = values.end;
          if (!layerId || !shortDescr || !start || !end) {
            console.error("Error: --layer-id, --short-descr, --start, --end are all required for --add");
            usage();
            process.exitCode = 1;
            return;
          }
          const payload = { short_descr: shortDescr, start_dttm: start, end_dttm: end };
          if (values["long-descr"]) payload.long_descr = values["long-descr"];
          if (values["json-metadata"]) payload.json_metadata = values["json-metadata"];
          const resp = await createAnnotation(layerId, payload);
          if (raw) { console.log(JSON.stringify(resp)); return; }
          const id = resp.id ?? resp.result?.id ?? "?";
          console.log(`Created annotation #${id} in layer ${layerId}: "${shortDescr}"  (${start} → ${end})`);
          return;
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
