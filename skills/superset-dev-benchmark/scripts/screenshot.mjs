#!/usr/bin/env node

/**
 * Superset Screenshot Client
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Trigger async screenshot generation, poll until ready, download binary.
 *
 * Modes:
 *   --chart <id>       Screenshot a chart (PNG)
 *   --dashboard <id>   Screenshot a dashboard (PNG or PDF)
 *
 * Requires server-side feature flag THUMBNAILS to be enabled.
 */

import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import { API_BASE, request } from "./http.mjs";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40; // 3s * 40 = 2 min max wait

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Chart screenshot ────────────────────────────────────────────────

async function screenshotChart(chartId, opts = {}) {
  const force = opts.force ?? true;
  const windowSize = opts.windowSize || [1600, 1200];

  const qs = encodeURIComponent(JSON.stringify({
    force,
    window_size: windowSize,
    thumb_size: windowSize,
  }));
  const triggerUrl = `${API_BASE}/api/v1/chart/${chartId}/cache_screenshot/?q=${qs}`;

  if (opts.dryRun) {
    console.log(JSON.stringify({ method: "GET", url: triggerUrl, body: null }, null, 2));
    return null;
  }

  console.error(`[screenshot] Triggering chart ${chartId} screenshot …`);
  const triggerData = await request("GET", triggerUrl);

  const cacheKey = triggerData?.cache_key;
  if (!cacheKey) {
    throw new Error(`No cache_key returned: ${JSON.stringify(triggerData).substring(0, 500)}`);
  }

  console.error(`[screenshot] cache_key: ${cacheKey}`);

  const imageUrl = `${API_BASE}/api/v1/chart/${chartId}/screenshot/${cacheKey}/`;
  return await pollImage(imageUrl);
}

// ── Dashboard screenshot ────────────────────────────────────────────

async function screenshotDashboard(dashboardId, opts = {}) {
  const force = opts.force ?? true;
  const windowSize = opts.windowSize || [1600, 1200];
  const format = opts.format || "png";

  // Superset backend: force/window_size/thumb_size are decoded from ?q= (rison schema);
  // only dataMask/activeTabs/anchor/urlParams belong in the POST body (CacheScreenshotSchema).
  const qs = encodeURIComponent(JSON.stringify({ force, window_size: windowSize, thumb_size: windowSize }));
  const triggerUrl = `${API_BASE}/api/v1/dashboard/${dashboardId}/cache_dashboard_screenshot/?q=${qs}`;
  const body = {};
  if (opts.dataMask) body.dataMask = opts.dataMask;
  if (opts.activeTabs) body.activeTabs = opts.activeTabs;

  if (opts.dryRun) {
    console.log(JSON.stringify({ method: "POST", url: triggerUrl, body, headers: { "X-CSRFToken": "(fetched at runtime)" } }, null, 2));
    return null;
  }

  // Fetch CSRF token for POST
  const csrfUrl = `${API_BASE}/api/v1/security/csrf_token/`;
  console.error("[screenshot] Fetching CSRF token …");
  let csrfToken = null;
  try {
    const csrfData = await request("GET", csrfUrl);
    csrfToken = csrfData?.result;
  } catch {
    console.error("[screenshot] Warning: could not obtain CSRF token");
  }

  const extraHeaders = csrfToken ? { "X-CSRFToken": csrfToken } : {};

  console.error(`[screenshot] Triggering dashboard ${dashboardId} screenshot …`);
  const triggerData = await request("POST", triggerUrl, body, { extraHeaders });

  const cacheKey = triggerData?.cache_key;
  if (!cacheKey) {
    throw new Error(`No cache_key returned: ${JSON.stringify(triggerData).substring(0, 500)}`);
  }

  console.error(`[screenshot] cache_key: ${cacheKey}`);

  const imageUrl = `${API_BASE}/api/v1/dashboard/${dashboardId}/screenshot/${cacheKey}/?download_format=${format}`;
  return await pollImage(imageUrl);
}

// ── Poll helper ─────────────────────────────────────────────────────

async function pollImage(imageUrl) {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    console.error(`[screenshot] Polling … (attempt ${attempt}/${MAX_POLL_ATTEMPTS})`);

    try {
      const data = await request("GET", imageUrl, undefined, {
        acceptHeader: "*/*",
        responseType: "buffer",
      });

      // If we got binary-looking data, it is the image
      if (data && typeof data !== "string") {
        let buf;
        if (Buffer.isBuffer(data)) buf = data;
        else if (data instanceof ArrayBuffer || data instanceof Uint8Array) buf = Buffer.from(data);
        else buf = Buffer.from(String(data), "binary");
        console.error(`[screenshot] Downloaded ${buf.length} bytes`);
        return buf;
      }

      // If string, might be JSON (not ready yet) or image data
      if (typeof data === "string" && data.length > 1000) {
        const buf = Buffer.from(data, "latin1");
        console.error(`[screenshot] Downloaded ${buf.length} bytes`);
        return buf;
      }

      // Not ready yet
      await sleep(POLL_INTERVAL_MS);
    } catch (e) {
      // 404 means not ready yet
      if (e.message.includes("HTTP 404") || e.message.includes("HTTP 202")) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      throw e;
    }
  }

  throw new Error(`Screenshot not ready after ${MAX_POLL_ATTEMPTS} attempts (${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s)`);
}

// ── Exports ─────────────────────────────────────────────────────────

export { screenshotChart, screenshotDashboard };

// ── CLI ─────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith("screenshot.mjs")) {
  const { values } = parseArgs({
    options: {
      chart: { type: "string" },
      dashboard: { type: "string" },
      output: { type: "string" },
      format: { type: "string", default: "png" },
      width: { type: "string", default: "1600" },
      height: { type: "string", default: "1200" },
      "dry-run": { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const chartId = values.chart;
  const dashboardId = values.dashboard;
  const outputFile = values.output;
  const format = values.format;
  const width = parseInt(values.width, 10) || 1600;
  const height = parseInt(values.height, 10) || 1200;
  const dryRun = values["dry-run"];

  if (!chartId && !dashboardId) {
    console.error("Usage:");
    console.error("  node screenshot.mjs --chart <id> --output /tmp/chart.png");
    console.error("  node screenshot.mjs --dashboard <id> --output /tmp/dashboard.png");
    console.error("  node screenshot.mjs --dashboard <id> --format pdf --output /tmp/dashboard.pdf");
    console.error("");
    console.error("Options:");
    console.error("  --output <path>    Save to file (required)");
    console.error("  --format <fmt>     png (default) or pdf (dashboard only)");
    console.error("  --width <px>       Viewport width (default 1600)");
    console.error("  --height <px>      Viewport height (default 1200)");
    console.error("  --dry-run          Print request info without sending");
    process.exitCode = 1;
  } else if (!outputFile) {
    console.error("Error: --output <path> is required");
    process.exitCode = 1;
  } else {
    (async () => {
      try {
        let buf;
        if (chartId) {
          buf = await screenshotChart(parseInt(chartId, 10), { windowSize: [width, height], dryRun });
        } else {
          buf = await screenshotDashboard(parseInt(dashboardId, 10), { windowSize: [width, height], format, dryRun });
        }

        if (dryRun) {
          console.error("[screenshot] Dry run complete — no request sent.");
          return;
        }

        writeFileSync(outputFile, buf);
        console.error(`[screenshot] Saved to ${outputFile} (${buf.length} bytes)`);
        console.log(JSON.stringify({ output: outputFile, size: buf.length, format: chartId ? "png" : format }));
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    })();
  }
}
