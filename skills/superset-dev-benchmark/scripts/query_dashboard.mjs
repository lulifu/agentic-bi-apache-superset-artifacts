#!/usr/bin/env node

/**
 * Superset Dashboard Query Client
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * API endpoints:
 *   GET  /api/v1/dashboard/                    — list / search dashboards
 *   GET  /api/v1/dashboard/<id_or_slug>        — dashboard detail
 *   GET  /api/v1/dashboard/<id_or_slug>/charts — charts belonging to dashboard
 *   GET  /api/v1/dashboard/<id_or_slug>/datasets — datasets used by dashboard
 *   GET  /api/v1/dashboard/<id_or_slug>/tabs   — tab structure
 */

import { parseArgs } from "node:util";
import { getChartDetail } from "./query_chart.mjs";
import { API_BASE, request } from "./http.mjs";

// ── Dashboard API ────────────────────────────────────────────────────

async function searchDashboards(keyword, pageSize = 25) {
  const q = JSON.stringify({
    filters: [{ col: "dashboard_title", opr: "ct", value: keyword }],
    page: 0,
    page_size: pageSize,
    order_column: "changed_on_delta_humanized",
    order_direction: "desc",
  });
  const url = `${API_BASE}/api/v1/dashboard/?q=${encodeURIComponent(q)}`;
  console.error(`[superset] Searching dashboards matching "${keyword}" …`);
  return await request("GET", url);
}

async function getDashboard(idOrSlug) {
  const url = `${API_BASE}/api/v1/dashboard/${idOrSlug}`;
  console.error(`[superset] Fetching dashboard ${idOrSlug} …`);
  return await request("GET", url);
}

async function getDashboardCharts(idOrSlug) {
  const url = `${API_BASE}/api/v1/dashboard/${idOrSlug}/charts`;
  console.error(`[superset] Fetching charts for dashboard ${idOrSlug} …`);
  return await request("GET", url);
}

async function getDashboardDatasets(idOrSlug) {
  const url = `${API_BASE}/api/v1/dashboard/${idOrSlug}/datasets`;
  console.error(`[superset] Fetching datasets for dashboard ${idOrSlug} …`);
  return await request("GET", url);
}

async function getDashboardTabs(idOrSlug) {
  const url = `${API_BASE}/api/v1/dashboard/${idOrSlug}/tabs`;
  console.error(`[superset] Fetching tabs for dashboard ${idOrSlug} …`);
  return await request("GET", url);
}

async function createDashboard(payload) {
  const url = `${API_BASE}/api/v1/dashboard/`;
  console.error(`[superset] Creating dashboard "${payload.dashboard_title}" …`);
  return await request("POST", url, payload);
}

async function updateDashboard(idOrSlug, payload) {
  const url = `${API_BASE}/api/v1/dashboard/${idOrSlug}`;
  console.error(`[superset] Updating dashboard ${idOrSlug} …`);
  return await request("PUT", url, payload);
}

// ── Exports ─────────────────────────────────────────────────────────

export {
  searchDashboards,
  getDashboard,
  getDashboardCharts,
  getDashboardDatasets,
  getDashboardTabs,
  createDashboard,
  updateDashboard,
};

// ── CLI ──────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("query_dashboard.mjs")) {
  const { values } = parseArgs({
    options: {
      search: { type: "string" },
      id: { type: "string" },
      charts: { type: "boolean", default: false },
      detail: { type: "boolean", default: false },
      datasets: { type: "boolean", default: false },
      tabs: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const searchKeyword = values.search;
  const dashId = values.id;

  if (!searchKeyword && !dashId) {
    console.error("Usage:");
    console.error("  node query_dashboard.mjs --search <keyword>              # fuzzy search by title");
    console.error("  node query_dashboard.mjs --id <id|slug>                  # dashboard detail");
    console.error("  node query_dashboard.mjs --id <id|slug> --charts         # list charts");
    console.error("  node query_dashboard.mjs --id <id|slug> --datasets       # list datasets");
    console.error("  node query_dashboard.mjs --id <id|slug> --tabs           # tab structure");
    console.error("  Add --json for raw JSON output");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        const raw = values.json;

        if (searchKeyword) {
          const data = await searchDashboards(searchKeyword);
          if (raw) { console.log(JSON.stringify(data, null, 2)); return; }
          const dashboards = data.result || [];
          console.log(`Found ${data.count ?? dashboards.length} dashboard(s):\n`);
          for (const d of dashboards) {
            const owners = (d.owners || []).map((o) => `${o.first_name} ${o.last_name}`.trim()).join(", ") || "-";
            console.log(`  #${d.id}  ${d.dashboard_title}`);
            console.log(`        published: ${d.published}  owners: ${owners}  changed: ${d.changed_on_delta_humanized || ""}`);
            if (d.url) console.log(`        url: ${API_BASE}${d.url}`);
          }
          return;
        }

        if (values.charts) {
          const data = await getDashboardCharts(dashId);
          const charts = data.result || [];
          if (!values.detail) {
            if (raw) { console.log(JSON.stringify(data, null, 2)); return; }
            console.log(`Dashboard ${dashId} has ${charts.length} chart(s):\n`);
            for (const c of charts) {
              console.log(`  #${c.id}  ${c.slice_name}`);
              console.log(`        viz: ${c.viz_type}  datasource: ${c.datasource_id || "-"}`);
            }
            return;
          }
          const CONCURRENCY = 5;
          const detailed = [];
          for (let i = 0; i < charts.length; i += CONCURRENCY) {
            const batch = charts.slice(i, i + CONCURRENCY);
            const results = await Promise.allSettled(
              batch.map(async (chart) => {
                const chartId = chart.id || chart.slice_id;
                const detail = await getChartDetail(chartId);
                const r = detail.result;
                const params = typeof r.params === "string" ? JSON.parse(r.params) : (r.params || {});
                const metrics = (params.metrics || []).map((m) => typeof m === "string" ? m : m.label || m.column?.column_name || JSON.stringify(m));
                return {
                  id: chartId, name: r.slice_name || chart.slice_name,
                  vizType: r.viz_type || params.viz_type || "-", metrics,
                  groupby: params.groupby || params.columns || [],
                  granularity: params.granularity_sqla || params.x_axis || params.granularity || null,
                  timeRange: params.time_range || "No filter",
                  timeGrain: params.time_grain_sqla || null,
                  filterCount: (params.adhoc_filters || []).length,
                };
              })
            );
            for (let j = 0; j < results.length; j++) {
              if (results[j].status === "fulfilled") {
                detailed.push(results[j].value);
              } else {
                const chart = batch[j];
                detailed.push({ id: chart.id || chart.slice_id, name: chart.slice_name || "-", error: results[j].reason?.message || String(results[j].reason) });
              }
            }
          }
          if (raw) { console.log(JSON.stringify(detailed, null, 2)); return; }
          console.log(`Dashboard ${dashId} has ${charts.length} chart(s):\n`);
          for (const c of detailed) {
            if (c.error) { console.log(`  #${c.id}  ${c.name}  [ERROR: ${c.error}]`); continue; }
            console.log(`  #${c.id}  ${c.name}`);
            console.log(`        viz: ${c.vizType}  metrics: ${c.metrics.join(", ") || "-"}  groupby: ${c.groupby.join(", ") || "-"}`);
            console.log(`        time: ${c.granularity || "-"} (${c.timeGrain || "-"})  range: ${c.timeRange}  filters: ${c.filterCount}`);
          }
          return;
        }

        if (values.datasets) {
          const data = await getDashboardDatasets(dashId);
          if (raw) { console.log(JSON.stringify(data, null, 2)); return; }
          const datasets = data.result || [];
          console.log(`Dashboard ${dashId} uses ${datasets.length} dataset(s):\n`);
          for (const ds of datasets) {
            console.log(`  #${ds.id}  ${ds.table_name || ds.datasource_name || ds.name || "-"}`);
            console.log(`        database: ${ds.database?.name || "-"}  columns: ${ds.columns?.length || 0}`);
          }
          return;
        }

        if (values.tabs) {
          const data = await getDashboardTabs(dashId);
          if (raw) { console.log(JSON.stringify(data, null, 2)); return; }
          const tabs = data.result || [];
          console.log(`Dashboard ${dashId} has ${Array.isArray(tabs) ? tabs.length : 0} tab(s):\n`);
          if (Array.isArray(tabs)) {
            for (const tab of tabs) {
              const name = tab.title || tab.name || tab.id || "-";
              const charts = tab.charts || tab.children || [];
              console.log(`  ${name}`);
              if (Array.isArray(charts) && charts.length) {
                console.log(`        charts: ${charts.map((c) => typeof c === "object" ? `#${c.id || c.slice_id || "?"}` : `#${c}`).join(", ")}`);
              }
            }
          } else {
            console.log(JSON.stringify(tabs, null, 2));
          }
          return;
        }

        // --id (detail)
        const data = await getDashboard(dashId);
        if (raw) { console.log(JSON.stringify(data, null, 2)); return; }
        const r = data.result;
        console.log(`Dashboard #${r.id}: ${r.dashboard_title}`);
        console.log(`  slug: ${r.slug || "-"}`);
        console.log(`  published: ${r.published}`);
        console.log(`  url: ${API_BASE}${r.url}`);
        console.log(`  owners: ${(r.owners || []).map((o) => `${o.first_name} ${o.last_name}`.trim()).join(", ") || "-"}`);
        console.log(`  charts: ${(r.charts || []).join(", ") || "-"}`);
        console.log(`  changed: ${r.changed_on_delta_humanized || ""} by ${r.changed_by_name || "-"}`);
        if (r.json_metadata) {
          try {
            const meta = JSON.parse(r.json_metadata);
            if (meta.native_filter_configuration?.length) console.log(`  filters: ${meta.native_filter_configuration.length} native filter(s)`);
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
