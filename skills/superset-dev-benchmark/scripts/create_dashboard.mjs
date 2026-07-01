#!/usr/bin/env node

/**
 * Dashboard Creation Helper
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Modes:
 *   --create              Create an empty dashboard from stdin JSON config
 *   --add-charts          Add charts to an existing dashboard (stdin JSON)
 *   --get-layout <id>     Get current dashboard position_json (for reference)
 */

import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { SUPERSET_WEB_BASE } from "./http.mjs";
import { getChartDetail } from "./query_chart.mjs";
import {
  getDashboard,
  createDashboard,
  updateDashboard,
} from "./query_dashboard.mjs";
import { verifyDashboard } from "./verify_dashboard.mjs";

// ── Verify helpers ──────────────────────────────────────────────────

// Pull every chart ID out of either form of dashboard config so --create /
// --add-charts can pass an authoritative expectChartIds to verifyDashboard.
function extractExpectedChartIds(config) {
  const ids = [];
  if (Array.isArray(config?.grid)) {
    for (const row of config.grid) for (const c of row?.charts || []) if (c?.chartId) ids.push(c.chartId);
  }
  for (const c of config?.charts || []) if (c?.chartId) ids.push(c.chartId);
  return [...new Set(ids)];
}

// ── Layout builder ──────────────────────────────────────────────────

function genId() {
  return randomBytes(4).toString("hex");
}

function buildLayout(charts, title) {
  const positions = {
    DASHBOARD_VERSION_KEY: "v2",
    ROOT_ID: { id: "ROOT_ID", type: "ROOT", children: ["GRID_ID"] },
    GRID_ID: { id: "GRID_ID", type: "GRID", children: [] },
    HEADER_ID: { id: "HEADER_ID", type: "HEADER", meta: { text: title } },
  };

  for (const chart of charts) {
    const rowId = `ROW-${genId()}`;
    const chartCompId = `CHART-${genId()}`;

    positions.GRID_ID.children.push(rowId);

    positions[rowId] = {
      id: rowId, type: "ROW", children: [chartCompId],
      meta: { background: "BACKGROUND_TRANSPARENT" },
    };

    positions[chartCompId] = {
      id: chartCompId, type: "CHART", children: [],
      meta: { chartId: chart.chartId, height: chart.height || 50, width: 12, sliceName: chart.sliceName },
    };
  }

  return positions;
}

function appendToLayout(existingPositions, charts) {
  const positions = { ...existingPositions };

  // Ensure ROOT_ID exists (may be missing if dashboard was created without charts)
  if (!positions.ROOT_ID) {
    positions.ROOT_ID = { id: "ROOT_ID", type: "ROOT", children: ["GRID_ID"] };
  }
  if (!positions.DASHBOARD_VERSION_KEY) {
    positions.DASHBOARD_VERSION_KEY = "v2";
  }

  let targetId = "GRID_ID";
  const root = positions.ROOT_ID;
  if (root?.children?.length) {
    const firstChild = root.children[0];
    if (typeof firstChild === "string" && firstChild.startsWith("TABS-")) {
      const tabsComp = positions[firstChild];
      if (tabsComp?.children?.length) {
        const lastTabId = tabsComp.children[tabsComp.children.length - 1];
        if (lastTabId && positions[lastTabId]) targetId = lastTabId;
      }
    }
  }

  if (!positions[targetId]) {
    positions[targetId] = { id: targetId, type: targetId === "GRID_ID" ? "GRID" : "TAB", children: [] };
  }
  positions[targetId] = { ...positions[targetId], children: [...(positions[targetId].children || [])] };

  const existingChartIds = new Set();
  for (const [, comp] of Object.entries(positions)) {
    if (comp?.type === "CHART" && comp?.meta?.chartId) existingChartIds.add(comp.meta.chartId);
  }

  for (const chart of charts) {
    if (existingChartIds.has(chart.chartId)) {
      console.error(`[layout] Chart ${chart.chartId} already in dashboard, skipping`);
      continue;
    }
    const rowId = `ROW-${genId()}`;
    const chartCompId = `CHART-${genId()}`;
    positions[targetId].children.push(rowId);
    positions[rowId] = { id: rowId, type: "ROW", children: [chartCompId], meta: { background: "BACKGROUND_TRANSPARENT" } };
    positions[chartCompId] = { id: chartCompId, type: "CHART", children: [], meta: { chartId: chart.chartId, height: chart.height || 50, width: 12, sliceName: chart.sliceName } };
  }

  return positions;
}

function buildLayoutFromGrid(rows, title) {
  const positions = {
    DASHBOARD_VERSION_KEY: "v2",
    ROOT_ID: { id: "ROOT_ID", type: "ROOT", children: ["GRID_ID"] },
    GRID_ID: { id: "GRID_ID", type: "GRID", children: [], parents: ["ROOT_ID"] },
    HEADER_ID: { id: "HEADER_ID", type: "HEADER", meta: { text: title } },
  };

  for (const row of rows) {
    const rowId = `ROW-${genId()}`;
    positions.GRID_ID.children.push(rowId);
    const chartCompIds = [];
    for (const chart of row.charts) {
      const chartCompId = `CHART-${genId()}`;
      chartCompIds.push(chartCompId);
      positions[chartCompId] = {
        id: chartCompId, type: "CHART", children: [], parents: ["ROOT_ID", "GRID_ID", rowId],
        meta: { chartId: chart.chartId, height: chart.height || 50, width: chart.width || 12, sliceName: chart.sliceName },
      };
    }
    positions[rowId] = { id: rowId, type: "ROW", children: chartCompIds, parents: ["ROOT_ID", "GRID_ID"], meta: { background: "BACKGROUND_TRANSPARENT" } };
  }

  return positions;
}

export { buildLayout, appendToLayout, buildLayoutFromGrid };

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("create_dashboard.mjs")) {
  const { values } = parseArgs({
    options: {
      create: { type: "boolean", default: false },
      "add-charts": { type: "boolean", default: false },
      "get-layout": { type: "string" },
      json: { type: "boolean", default: false },
      "no-verify": { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const doCreate = values.create;
  const doAddCharts = values["add-charts"];
  const getLayoutId = values["get-layout"];
  const rawJson = values.json;
  const skipVerify = values["no-verify"];

  if (!doCreate && !doAddCharts && !getLayoutId) {
    console.error("Usage:");
    console.error('  echo \'{"dashboard_title":"My Dashboard","charts":[{"chartId":1,"sliceName":"Chart 1"}]}\' | node create_dashboard.mjs --create');
    console.error('  echo \'{"dashboard_id":123,"charts":[{"chartId":2,"sliceName":"Chart 2"}]}\' | node create_dashboard.mjs --add-charts');
    console.error("  node create_dashboard.mjs --get-layout <dashboard_id>");
    console.error("");
    console.error("Verification: --create / --add-charts run verifyDashboard() automatically;");
    console.error("              the verdict is merged into stdout under 'verify'. Use --no-verify");
    console.error("              to skip (e.g. fast batch creation; manually verify later).");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        if (getLayoutId) {
          const dash = await getDashboard(getLayoutId);
          const r = dash.result;
          let posJson = {};
          try { posJson = r.position_json ? JSON.parse(r.position_json) : {}; } catch { }
          let metaJson = {};
          try { metaJson = r.json_metadata ? JSON.parse(r.json_metadata) : {}; } catch { }

          if (rawJson) {
            console.log(JSON.stringify({ position_json: posJson, json_metadata: metaJson }, null, 2));
          } else {
            console.log(`Dashboard: ${r.dashboard_title} (#${r.id})`);
            console.log(`Published: ${r.published}`);
            console.log(``);
            const chartComps = Object.values(posJson).filter((c) => c?.type === "CHART" && c?.meta?.chartId);
            console.log(`Charts in layout (${chartComps.length}):`);
            for (const c of chartComps) console.log(`  #${c.meta.chartId}  ${c.meta.sliceName || "-"} (${c.meta.width}x${c.meta.height})`);
            console.log(``);
            console.log(`position_json keys: ${Object.keys(posJson).length}`);
            console.log(`json_metadata keys: ${Object.keys(metaJson).join(", ") || "(empty)"}`);
          }
          return;
        }

        const chunks = [];
        for await (const chunk of process.stdin) chunks.push(chunk);
        const config = JSON.parse(Buffer.concat(chunks).toString("utf-8"));

        if (doCreate) {
          const title = config.dashboard_title;
          if (!title) { console.error("Error: config must include dashboard_title"); process.exitCode = 1; return; }
          const useGrid = Array.isArray(config.grid) && config.grid.length > 0;
          const charts = config.charts || [];

          async function resolveChart(c) {
            if (!c.chartId) throw new Error("each chart must have chartId");
            let name = c.sliceName;
            if (!name) {
              try { const detail = await getChartDetail(c.chartId); name = detail.result?.slice_name || `Chart ${c.chartId}`; }
              catch { name = `Chart ${c.chartId}`; }
            }
            return { chartId: c.chartId, sliceName: name, height: c.height, width: c.width };
          }

          const createPayload = { dashboard_title: title, published: config.published ?? false };
          if (config.slug) createPayload.slug = config.slug;
          const createResult = await createDashboard(createPayload);
          const dashId = createResult.id;
          console.error(`[create] Dashboard created: #${dashId}`);

          let positions;
          let totalCharts = 0;
          if (useGrid) {
            const resolvedGrid = [];
            for (const row of config.grid) {
              const resolvedRow = [];
              for (const c of row.charts || []) { resolvedRow.push(await resolveChart(c)); totalCharts++; }
              resolvedGrid.push({ charts: resolvedRow });
            }
            positions = buildLayoutFromGrid(resolvedGrid, title);
          } else if (charts.length) {
            const resolvedCharts = [];
            for (const c of charts) { resolvedCharts.push(await resolveChart(c)); totalCharts++; }
            positions = buildLayout(resolvedCharts, title);
          }

          if (positions) {
            const jsonMetadata = { positions, color_scheme: config.color_scheme || "", cross_filters_enabled: config.cross_filters_enabled ?? true };
            await updateDashboard(dashId, { json_metadata: JSON.stringify(jsonMetadata) });
            console.error(`[create] Layout updated with ${totalCharts} chart(s)${useGrid ? " (grid layout)" : ""}`);
          }

          // Mandatory verify: layout-skeleton + chartId resolution + screenshot.
          // The workflow consumer reads `verify.ok` from this same stdout JSON
          // instead of running verify_dashboard.mjs as a separate step. Skip
          // only when --no-verify is set (e.g. fast batch creation).
          let verifyResult = null;
          if (!skipVerify) {
            const expected = extractExpectedChartIds(config);
            console.error(`[verify] Running verifyDashboard on #${dashId} (expecting ${expected.length} chart(s)) …`);
            verifyResult = await verifyDashboard(dashId, { expectChartIds: expected });
          }

          console.log(JSON.stringify({ id: dashId, dashboard_title: title, charts_added: totalCharts, verify: verifyResult }, null, 2));
          console.error(`[create] View dashboard: ${SUPERSET_WEB_BASE}/dashboard/${dashId}/`);
          if (verifyResult && !verifyResult.ok) {
            console.error(`[verify] FAILED — see verify.issues; consult references/dashboard_verify_workflow.md for fix mapping.`);
            process.exitCode = 1;
          }
          return;
        }

        if (doAddCharts) {
          const dashId = config.dashboard_id;
          if (!dashId) { console.error("Error: config must include dashboard_id"); process.exitCode = 1; return; }
          const charts = config.charts || [];
          if (!charts.length) { console.error("Error: config must include charts array"); process.exitCode = 1; return; }

          const resolvedCharts = [];
          for (const c of charts) {
            if (!c.chartId) { console.error("Error: each chart must have chartId"); process.exitCode = 1; return; }
            let name = c.sliceName;
            if (!name) {
              try { const detail = await getChartDetail(c.chartId); name = detail.result?.slice_name || `Chart ${c.chartId}`; }
              catch { name = `Chart ${c.chartId}`; }
            }
            resolvedCharts.push({ chartId: c.chartId, sliceName: name, height: c.height });
          }

          const dash = await getDashboard(dashId);
          const r = dash.result;
          let currentPositions = {};
          try { currentPositions = r.position_json ? JSON.parse(r.position_json) : {}; } catch { }
          let currentMeta = {};
          try { currentMeta = r.json_metadata ? JSON.parse(r.json_metadata) : {}; } catch { }

          const updatedPositions = appendToLayout(currentPositions, resolvedCharts);
          const updatedMeta = { ...currentMeta, positions: updatedPositions };
          await updateDashboard(dashId, { json_metadata: JSON.stringify(updatedMeta) });

          const addedCount = resolvedCharts.filter((c) => !Object.values(currentPositions).some((comp) => comp?.type === "CHART" && comp?.meta?.chartId === c.chartId)).length;
          console.error(`[add] Added ${addedCount} chart(s) to dashboard #${dashId}`);

          // Mandatory verify with the chart IDs that were just added so the
          // verdict tells the workflow whether they made it into the layout.
          let verifyResult = null;
          if (!skipVerify) {
            const expected = extractExpectedChartIds(config);
            console.error(`[verify] Running verifyDashboard on #${dashId} (expecting ${expected.length} chart(s) in layout) …`);
            verifyResult = await verifyDashboard(dashId, { expectChartIds: expected });
          }

          console.log(JSON.stringify({
            dashboard_id: dashId,
            charts_added: addedCount,
            total_charts_in_layout: Object.values(updatedPositions).filter((c) => c?.type === "CHART").length,
            verify: verifyResult,
          }, null, 2));
          console.error(`[add] View dashboard: ${SUPERSET_WEB_BASE}/dashboard/${dashId}/`);
          if (verifyResult && !verifyResult.ok) {
            console.error(`[verify] FAILED — see verify.issues; consult references/dashboard_verify_workflow.md for fix mapping.`);
            process.exitCode = 1;
          }
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
