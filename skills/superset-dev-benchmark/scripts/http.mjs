/**
 * Shared HTTP client for Superset API.
 *
 * Auth is supplied externally by the local benchmark token interceptor or by
 * the runtime environment. No credential values are read or logged here.
 */

import https from "node:https";
import { URL } from "node:url";

// ── Constants ───────────────────────────────────────────────────────

const DEFAULT_DEV_BASE = "https://superset.example.invalid";
const PROD_HOST = "superset.toolsfdg.net";
const DEV_HOST = "superset.example.invalid";

function normalizeBaseUrl(value) {
  const base = (value || DEFAULT_DEV_BASE).trim().replace(/\/+$/, "");
  const url = new URL(base);
  if (url.hostname === PROD_HOST) {
    throw new Error(`Refusing production Superset host: ${PROD_HOST}`);
  }
  if (url.hostname !== DEV_HOST && process.env.SUPERSET_ALLOW_NON_DEV !== "1") {
    throw new Error(`Refusing non-dev Superset host: ${url.hostname}. Set SUPERSET_ALLOW_NON_DEV=1 only for explicit local tests.`);
  }
  return base;
}

export const API_BASE = normalizeBaseUrl(process.env.SUPERSET_BASE_URL);
export const SUPERSET_WEB_BASE = `${API_BASE}/superset`;

// Diagnostic line so a host mismatch between this module and the local token
// interceptor (which prints its own `target=` line) is visible at a glance.
if (process.env.SUPERSET_QUIET !== "1") {
  console.error(`[http] base=${new URL(API_BASE).hostname}`);
}

// ── Response parsing ────────────────────────────────────────────────

/**
 * Parse JSON from raw string. Returns parsed object or the raw string
 * if parsing fails.
 */
export function parseData(raw) {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

/**
 * Assert HTTP status is OK (< 400). Throws with a truncated body
 * excerpt on failure.
 */
export function assertOk(status, data, label) {
  if (status >= 400) {
    const msg =
      typeof data === "object"
        ? JSON.stringify(data).substring(0, 300)
        : String(data).substring(0, 300);
    throw new Error(`${label} failed (HTTP ${status}): ${msg}`);
  }
}

// ── HTTP request ────────────────────────────────────────────────────

/**
 * Make an HTTP request via plain node:https. Authorization is injected
 * externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs).
 *
 * @param {string} method    - HTTP method (GET, POST, PUT, DELETE, ...)
 * @param {string} url       - Full URL
 * @param {*}      [body]    - Request body (will be JSON.stringify'd)
 * @param {object} [opts]    - Extra options
 * @param {string} [opts.acceptHeader]  - Custom Accept header
 * @param {object} [opts.extraHeaders]  - Additional headers to merge
 * @param {string} [opts.responseType]  - Set to "buffer" for binary payloads
 * @returns {Promise<*>} parsed response data
 */
export function request(method, url, body, opts = {}) {
  const { acceptHeader, extraHeaders, responseType } = opts;
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = {
      "Content-Type": "application/json",
      Accept: acceptHeader || "application/json",
      ...extraHeaders,
    };
    let bodyStr;
    if (body != null) {
      bodyStr = typeof body === "string" ? body : JSON.stringify(body);
      headers["Content-Length"] = Buffer.byteLength(bodyStr).toString();
    }

    const req = https.request(
      {
        method,
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        headers,
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          // assertOk throws on 4xx/5xx. Inside a node:http(s) `end` event the
          // throw is unhandled (the listener is a plain event handler, not the
          // Promise executor) — it kills the process instead of rejecting the
          // promise. Wrap so callers can `try { await request(...) } catch`.
          try {
            const rawBuffer = Buffer.concat(chunks);
            if (responseType === "buffer") {
              assertOk(res.statusCode, rawBuffer.toString("utf-8"), `${method} ${urlObj.pathname}`);
              resolve(rawBuffer);
              return;
            }

            const raw = rawBuffer.toString("utf-8");
            const data = parseData(raw);
            assertOk(res.statusCode, data, `${method} ${urlObj.pathname}`);
            resolve(data);
          } catch (err) {
            reject(err);
          }
        });
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}
