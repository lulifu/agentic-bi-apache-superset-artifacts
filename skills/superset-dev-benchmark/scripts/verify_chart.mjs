#!/usr/bin/env node
/**
 * verify_chart.mjs — one-shot post-create / post-update verification.
 *
 *   1. POSTs the chart's saved query and counts returned rows
 *   2. Triggers a screenshot, polls until ready, writes the PNG
 *   3. Emits a single verdict JSON to stdout
 *
 * The verdict (`ok` true/false) is the source of truth — the caller does not
 * need to look at the screenshot. The script checks the things a machine can
 * check unambiguously:
 *
 *   Hard checks (flip `ok` to false on failure):
 *     - chart-data API call succeeded — covers MOST of what looks like
 *       "frontend errors": column-not-found, saved-metric-not-exist,
 *       bad-SQL-in-adhoc-metric, dataset-not-found, empty-required-field
 *       all surface here as HTTP 4xx with a `message` field, the same
 *       text the frontend would render as a red card.
 *     - the query returned rows (> 0)
 *     - the screenshot byte count is plausible (>= MIN_PNG_BYTES, default 4 KB)
 *
 *   Soft check (added to issues[] as a `warning:` but does NOT flip `ok`):
 *     - if rows > 0 AND screenshot < SOFT_WARN_PNG_BYTES (default 30 KB),
 *       emit a heuristic warning. Big Number / KPI cards can legitimately be
 *       small, so this is informational only — the loop should NOT iterate on
 *       a warning alone, but callers may surface it in their reply.
 *
 * Exit code is 0 only when ALL hard checks pass (warnings do not affect it).
 * On exit code 1, the caller should diagnose from issues[], call
 * create_chart.mjs --update with minimal fixes, then re-run verify_chart.mjs.
 * Cap the retry loop at 3 attempts (see SKILL.md "Verify-and-fix loop").
 *
 * Usage:
 *   node verify_chart.mjs --chart-id <id> [--output <png_path>] [--width 1600] [--height 1200]
 *
 * Output (stdout, single line of JSON; the LLM parses this):
 *   {
 *     "chart_id": 2052,
 *     "ok": false,
 *     "row_count": 0,
 *     "screenshot_path": "/tmp/superset_verify_2052_20260603_143012.png",
 *     "screenshot_bytes": 18234,
 *     "chart_url": "https://superset.example.invalid/superset/explore/?slice_id=2052",
 *     "issues": ["query returned 0 rows"]
 *   }
 *
 * Exit codes:
 *   0  — all hard checks passed; verdict.ok is true
 *   1  — at least one hard check failed; verdict.ok is false, issues[] populated
 *   2  — usage error or unexpected exception
 */

import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { getChartData } from "./query_chart.mjs";
import { screenshotChart } from "./screenshot.mjs";
import { API_BASE } from "./http.mjs";

const MIN_PNG_BYTES = 4096; // hard fail: smaller than this is almost certainly a blank / error frame
const SOFT_WARN_PNG_BYTES = 30 * 1024; // soft warn: between hard floor and this is suspicious — often a frontend render-error card (red banner inside the chart container) when row_count > 0
// Match the URL prefix that create_chart.mjs / create_dashboard.mjs use so chart_url
// links go to the same place users see in the rest of the skill's output.
const EXPLORE_BASE = `${API_BASE.replace(/\/$/, "")}/superset`;

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/** Walk a chart-data response and count rows in the first non-empty result. */
function countRows(payload) {
  if (!payload?.result || !Array.isArray(payload.result)) return 0;
  for (const entry of payload.result) {
    if (Array.isArray(entry?.data) && entry.data.length > 0) {
      return entry.data.length;
    }
  }
  return 0;
}

/** Extract a human-readable error from a chart-data response, if any.
 *
 * Two response shapes to handle:
 *   - 200 OK with per-query error: `{result: [{status: "...", error: "...", errors: [...]}]}`
 *   - 4xx with top-level message:  `{message: "Error: Columns missing..."}` or
 *                                  `{errors: [{message, error_type, ...}]}`
 *
 * Most "frontend render-error card" cases are actually 4xx from the chart-data
 * endpoint (column-not-found, metric-not-exist, missing required field, etc.) —
 * the frontend just renders the message as a red card. So API-level errors
 * cover most of what looked like "frontend-only" errors.
 */
function extractDataError(payload) {
  if (!payload || typeof payload !== "object") return null;
  // Top-level shapes (4xx responses)
  if (typeof payload.message === "string" && payload.message) {
    return payload.message;
  }
  if (Array.isArray(payload.errors) && payload.errors.length) {
    return payload.errors.map((e) => e.message || JSON.stringify(e)).join("; ");
  }
  // Per-query shape (200 OK with status="error" inside)
  if (Array.isArray(payload.result)) {
    for (const entry of payload.result) {
      if (entry?.error) return String(entry.error);
      if (entry?.errors?.length) {
        return entry.errors.map((e) => e.message || JSON.stringify(e)).join("; ");
      }
      if (entry?.status && entry.status !== "success") {
        return `query status: ${entry.status}`;
      }
    }
  }
  return null;
}

/** Pull a clean message out of an Error thrown by http.mjs assertOk().
 *
 * assertOk produces messages like:
 *   "GET /api/v1/chart/2127/data/ failed (HTTP 400): {\"message\":\"Error: Columns missing in dataset: ['xxx']\"}"
 *
 * We strip the prefix and parse the embedded JSON so the user-facing issue
 * reads as "Error: Columns missing in dataset: ['xxx']" instead of the raw blob.
 */
function cleanHttpError(errMessage) {
  if (!errMessage) return errMessage;
  const m = errMessage.match(/failed \(HTTP (\d+)\):\s*(.*)$/s);
  if (!m) return errMessage;
  const [, status, body] = m;
  try {
    const parsed = JSON.parse(body);
    const inner = extractDataError(parsed);
    if (inner) return `HTTP ${status}: ${inner}`;
  } catch { /* ignore */ }
  // Fall back: keep the raw body but trim the verbose prefix
  return `HTTP ${status}: ${body.slice(0, 200)}`;
}

async function verifyChart(chartId, { outputPath, width, height }) {
  const issues = []; // hard issues — flip ok to false
  const warnings = []; // soft issues — surfaced but ok stays true
  let rowCount = 0;
  let screenshotBytes = 0;
  let screenshotPath = null;

  // ── Step 1: data check ─────────────────────────────────────────────
  try {
    const data = await getChartData(chartId);
    const dataErr = extractDataError(data);
    if (dataErr) {
      issues.push(`chart-data error: ${dataErr}`);
    } else {
      rowCount = countRows(data);
      if (rowCount === 0) {
        issues.push("query returned 0 rows");
      }
    }
  } catch (err) {
    // 4xx errors come through here as exceptions from http.mjs assertOk().
    // The body usually contains the same structured error the frontend would
    // render as a red card (e.g. "Error: Columns missing in dataset: [...]").
    issues.push(`chart-data request failed: ${cleanHttpError(err.message)}`);
  }

  // ── Step 2: screenshot ─────────────────────────────────────────────
  try {
    const buf = await screenshotChart(chartId, { windowSize: [width, height] });
    screenshotBytes = buf.length;
    screenshotPath = outputPath || `/tmp/superset_verify_${chartId}_${timestamp()}.png`;
    writeFileSync(screenshotPath, buf);
    if (buf.length < MIN_PNG_BYTES) {
      issues.push(`screenshot too small (${buf.length} bytes, threshold ${MIN_PNG_BYTES}) — likely a blank / error frame`);
    } else if (rowCount > 0 && buf.length < SOFT_WARN_PNG_BYTES) {
      // Backend returned data but the rendered image is suspiciously small.
      // Most often this is a frontend render-error card (e.g. "Required parameter
      // X is missing", incompatible viz_type / data shape) drawn inside the chart
      // container. Big-number / KPI cards can also legitimately fall in this range,
      // so this is a soft warning, not a hard fail — the LLM still inspects the
      // image either way.
      warnings.push(
        `screenshot only ${(buf.length / 1024).toFixed(1)} KB despite ${rowCount} rows — may be a frontend render-error card; inspect the image`
      );
    }
  } catch (err) {
    issues.push(`screenshot failed: ${err.message}`);
  }

  return {
    chart_id: chartId,
    ok: issues.length === 0,
    row_count: rowCount,
    screenshot_path: screenshotPath,
    screenshot_bytes: screenshotBytes,
    chart_url: `${EXPLORE_BASE}/explore/?slice_id=${chartId}`,
    issues: [...issues, ...warnings.map((w) => `warning: ${w}`)],
  };
}

export { verifyChart };

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("verify_chart.mjs")) {
  const { values } = parseArgs({
    options: {
      "chart-id": { type: "string" },
      output: { type: "string" },
      width: { type: "string", default: "1600" },
      height: { type: "string", default: "1200" },
    },
    allowPositionals: true,
  });

  const chartId = parseInt(values["chart-id"], 10);
  if (!chartId) {
    console.error("Usage: node verify_chart.mjs --chart-id <id> [--output <path>] [--width 1600] [--height 1200]");
    process.exit(2);
  }

  (async () => {
    try {
      const verdict = await verifyChart(chartId, {
        outputPath: values.output,
        width: parseInt(values.width, 10) || 1600,
        height: parseInt(values.height, 10) || 1200,
      });
      console.log(JSON.stringify(verdict, null, 2));
      process.exit(verdict.ok ? 0 : 1);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
  })();
}
