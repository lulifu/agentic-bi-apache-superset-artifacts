#!/usr/bin/env node
/**
 * verify_dashboard.mjs — one-shot post-create / post-add-charts dashboard verification.
 *
 * Mirrors verify_chart.mjs in shape and contract, but at the dashboard layer.
 * Returns a single verdict JSON to stdout; the caller (LLM workflow) reads
 * `ok` and `issues[]` to decide whether to fix-and-retry or surface to user.
 *
 *   Hard checks (flip `ok` to false on failure):
 *     - dashboard GET succeeds (catches "wrong id", auth issues)
 *     - position_json parses, has the canonical skeleton:
 *         * DASHBOARD_VERSION_KEY present
 *         * ROOT_ID present with non-empty children
 *         * GRID_ID present (or a TABS subtree under ROOT_ID)
 *     - layout contains at least one component with type === "CHART" and a
 *       meta.chartId — protects against the v1.6.0 bug where --add-charts ran
 *       on an empty layout and silently produced an unrenderable position_json
 *     - every chartId referenced from the layout resolves via getChartDetail
 *       (orphaned references mean the chart was deleted but layout still points
 *       at it; the dashboard renders a red "Chart not found" card for these)
 *     - if --expect-chart-ids is provided, every expected ID appears in the
 *       layout (catches "we said --add-charts but it didn't take")
 *     - dashboard screenshot fetched and >= MIN_PNG_BYTES (32 KB; dashboards
 *       are larger than single charts so the floor is higher than verify_chart)
 *
 *   Soft checks (issues[] entries prefixed with `warning:`; do NOT flip `ok`):
 *     - screenshot >= MIN_PNG_BYTES but < SOFT_WARN_PNG_BYTES (200 KB) — many
 *       charts may be rendering as error cards
 *     - count of charts in /api/v1/dashboard/<id>/charts (relation table) does
 *       not match count of CHART components in layout (orphan dashboards-chart
 *       relation; mostly harmless but worth surfacing)
 *
 * Usage:
 *   node verify_dashboard.mjs --dashboard-id <id> [--output <png_path>] \
 *     [--expect-chart-ids 101,102,103] [--width 1600] [--height 1200]
 *
 * Exit codes:
 *   0  — all hard checks passed; verdict.ok is true
 *   1  — at least one hard check failed; verdict.ok is false, issues[] populated
 *   2  — usage error or unexpected exception
 */

import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { getDashboard, getDashboardCharts } from "./query_dashboard.mjs";
import { getChartDetail } from "./query_chart.mjs";
import { screenshotDashboard } from "./screenshot.mjs";
import { API_BASE } from "./http.mjs";

// Dashboards composite many charts; the size floor is intentionally higher
// than verify_chart.mjs's 4 KB. A "blank" dashboard PNG (header only, no
// charts rendered) tends to be ~10-25 KB; anything under 32 KB is suspect.
const MIN_PNG_BYTES = 32 * 1024;
const SOFT_WARN_PNG_BYTES = 200 * 1024;

const DASHBOARD_BASE = `${API_BASE.replace(/\/$/, "")}/superset/dashboard`;

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/** Inspect a position_json object. Returns { skeletonOk, chartIds, missingSkeletonReasons }. */
function inspectLayout(positions) {
  const reasons = [];
  if (!positions || typeof positions !== "object") {
    return { skeletonOk: false, chartIds: [], missingSkeletonReasons: ["position_json is empty or not an object"] };
  }
  if (!positions.DASHBOARD_VERSION_KEY) reasons.push("DASHBOARD_VERSION_KEY missing");
  const root = positions.ROOT_ID;
  if (!root) {
    reasons.push("ROOT_ID component missing");
  } else if (!Array.isArray(root.children) || root.children.length === 0) {
    reasons.push("ROOT_ID.children is empty (no GRID/TABS attached)");
  }
  // Either a GRID_ID under ROOT_ID, or a TABS-* component handling the layout.
  const hasGrid = !!positions.GRID_ID;
  const hasTabs = root?.children?.some?.((c) => typeof c === "string" && c.startsWith("TABS-"));
  if (!hasGrid && !hasTabs) reasons.push("neither GRID_ID nor TABS-* component found");

  const chartIds = [];
  for (const comp of Object.values(positions)) {
    if (comp?.type === "CHART" && comp?.meta?.chartId) chartIds.push(comp.meta.chartId);
  }
  return { skeletonOk: reasons.length === 0, chartIds, missingSkeletonReasons: reasons };
}

/** Same shape as verify_chart.mjs's cleanHttpError — extract a readable message
 *  out of an http.mjs assertOk() error. Returns { status, message }; status is
 *  null when the error didn't come from assertOk (e.g. socket error). */
function cleanHttpError(errMessage) {
  if (!errMessage) return { status: null, message: errMessage };
  const m = errMessage.match(/failed \(HTTP (\d+)\):\s*(.*)$/s);
  if (!m) return { status: null, message: errMessage };
  const [, statusStr, body] = m;
  const status = parseInt(statusStr, 10);
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.message === "string" && parsed.message) return { status, message: `HTTP ${status}: ${parsed.message}` };
    if (Array.isArray(parsed.errors) && parsed.errors.length) {
      return { status, message: `HTTP ${status}: ${parsed.errors.map((e) => e.message || JSON.stringify(e)).join("; ")}` };
    }
  } catch { /* ignore */ }
  return { status, message: `HTTP ${status}: ${body.slice(0, 200)}` };
}

/** Run an array of async thunks with at most `limit` in flight; preserves order. */
async function pMap(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

async function verifyDashboard(dashboardId, { outputPath, width, height, expectChartIds } = {}) {
  // Default to a sane viewport if the caller (e.g. create_dashboard.mjs --create)
  // doesn't pass width/height. Without this, the screenshot trigger URL ends up
  // with `window_size: [null, null]` which Superset's ALB front-end rejects as 400.
  width = width || 1600;
  height = height || 1200;
  const issues = [];
  const warnings = [];
  let chartIds = [];
  let skeletonOk = false;
  let missingSkeletonReasons = [];
  let orphanChartIds = [];
  let expectedMissing = [];
  let relationCount = null;
  let screenshotPath = null;
  let screenshotBytes = 0;

  // ── Step 1: GET dashboard, parse position_json ─────────────────────
  let positions = null;
  try {
    const detail = await getDashboard(dashboardId);
    const r = detail.result;
    try {
      positions = r.position_json ? JSON.parse(r.position_json) : {};
    } catch (e) {
      issues.push(`position_json is not valid JSON: ${e.message}`);
      positions = null;
    }
  } catch (err) {
    issues.push(`dashboard fetch failed: ${cleanHttpError(err.message).message}`);
  }

  // ── Step 2: skeleton + chartId extraction ──────────────────────────
  if (positions !== null) {
    const layout = inspectLayout(positions);
    skeletonOk = layout.skeletonOk;
    chartIds = layout.chartIds;
    missingSkeletonReasons = layout.missingSkeletonReasons;
    if (!skeletonOk) {
      issues.push(`layout skeleton incomplete: ${missingSkeletonReasons.join("; ")}`);
    } else if (chartIds.length === 0) {
      // Only meaningful when the skeleton itself is intact — otherwise the
      // skeleton-incomplete issue already covers the same root cause.
      issues.push("layout contains no CHART components — dashboard will render as an empty page");
    }

    // ── Step 3: every layout chartId must still resolve ──────────────
    // 8-way concurrency keeps large dashboards from hammering Superset and
    // tripping rate-limiters that surface as spurious 5xx.
    if (chartIds.length > 0) {
      const lookups = await pMap(chartIds, 8, async (cid) => {
        try { await getChartDetail(cid); return { cid, ok: true }; }
        catch (err) {
          const { status, message } = cleanHttpError(err.message);
          return { cid, ok: false, status, msg: message };
        }
      });
      // Only HTTP 404 is a true orphan (chart deleted but layout still references
      // it). 5xx / network / timeouts go to warnings so a transient backend hiccup
      // doesn't fail an otherwise-good dashboard.
      orphanChartIds = lookups.filter((l) => !l.ok && l.status === 404).map((l) => l.cid);
      for (const l of lookups) {
        if (l.ok) continue;
        if (l.status === 404) {
          issues.push(`layout references chart ${l.cid} but it no longer exists (404) — orphan reference`);
        } else {
          warnings.push(`chart ${l.cid} GET failed (${l.msg}) — transient, not treated as orphan`);
        }
      }
    }

    // ── Step 4: --expect-chart-ids must all be present ───────────────
    if (expectChartIds?.length) {
      const layoutSet = new Set(chartIds);
      expectedMissing = expectChartIds.filter((id) => !layoutSet.has(id));
      for (const id of expectedMissing) {
        issues.push(`expected chart ${id} not in layout — verify the chart exists via query_chart.mjs --id ${id}, then re-run create_dashboard.mjs --add-charts`);
      }
    }

    // ── Step 5: relation-table sanity (soft warning only) ────────────
    try {
      const rel = await getDashboardCharts(dashboardId);
      relationCount = Array.isArray(rel?.result) ? rel.result.length : null;
      if (relationCount !== null && relationCount !== chartIds.length) {
        warnings.push(
          `dashboards-chart relation count (${relationCount}) differs from layout CHART count (${chartIds.length}) — orphan relation, usually harmless`
        );
      }
    } catch (err) {
      // Soft: relation lookup failing shouldn't sink the whole verdict.
      warnings.push(`dashboards-chart relation fetch failed: ${cleanHttpError(err.message).message}`);
    }
  }

  // ── Step 6: dashboard screenshot ────────────────────────────────────
  try {
    const buf = await screenshotDashboard(dashboardId, { windowSize: [width, height] });
    screenshotBytes = buf.length;
    screenshotPath = outputPath || `/tmp/superset_verify_dashboard_${dashboardId}_${timestamp()}.png`;
    writeFileSync(screenshotPath, buf);
    if (buf.length < MIN_PNG_BYTES) {
      issues.push(`dashboard screenshot too small (${buf.length} bytes, threshold ${MIN_PNG_BYTES}) — likely a blank / error frame`);
    } else if (buf.length < SOFT_WARN_PNG_BYTES && chartIds.length >= 2) {
      // Multi-chart dashboard rendered to a small image — many cards likely
      // failed to render. KPI-only dashboards can legitimately be small, so
      // only warn when there are at least 2 charts in the layout.
      warnings.push(
        `dashboard screenshot only ${(buf.length / 1024).toFixed(1)} KB with ${chartIds.length} charts in layout — multiple charts may be rendering as error cards`
      );
    }
  } catch (err) {
    issues.push(`dashboard screenshot failed: ${cleanHttpError(err.message).message}`);
  }

  return {
    dashboard_id: dashboardId,
    ok: issues.length === 0,
    layout: {
      chart_count: chartIds.length,
      chart_ids: chartIds,
      skeleton_ok: skeletonOk,
      missing_skeleton_reasons: missingSkeletonReasons,
      orphan_chart_ids: orphanChartIds,
      expected_missing_chart_ids: expectedMissing,
      relation_count: relationCount,
    },
    screenshot_path: screenshotPath,
    screenshot_bytes: screenshotBytes,
    dashboard_url: `${DASHBOARD_BASE}/${dashboardId}/`,
    issues: [...issues, ...warnings.map((w) => `warning: ${w}`)],
  };
}

export { verifyDashboard, inspectLayout };

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("verify_dashboard.mjs")) {
  const { values } = parseArgs({
    options: {
      "dashboard-id": { type: "string" },
      output: { type: "string" },
      "expect-chart-ids": { type: "string" },
      width: { type: "string", default: "1600" },
      height: { type: "string", default: "1200" },
    },
    allowPositionals: true,
  });

  const dashboardId = parseInt(values["dashboard-id"], 10);
  if (!dashboardId) {
    console.error("Usage: node verify_dashboard.mjs --dashboard-id <id> [--output <path>] [--expect-chart-ids 1,2,3] [--width 1600] [--height 1200]");
    process.exit(2);
  }

  const expectChartIds = (values["expect-chart-ids"] || "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  (async () => {
    try {
      const verdict = await verifyDashboard(dashboardId, {
        outputPath: values.output,
        width: parseInt(values.width, 10) || 1600,
        height: parseInt(values.height, 10) || 1200,
        expectChartIds,
      });
      console.log(JSON.stringify(verdict, null, 2));
      process.exit(verdict.ok ? 0 : 1);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
  })();
}
