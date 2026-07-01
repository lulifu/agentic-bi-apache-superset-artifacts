/**
 * Benchmark-only Superset bearer-token interceptor.
 *
 * This module is a local replacement for the chat runtime's
 * weasso-plugin interceptor. It is for Codex benchmark/smoke runs only:
 * governed runtime sessions use their own SSO/session-cookie path, not this
 * bearer token.
 *
 * Usage:
 *   node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs <script>
 *
 * The token value is never logged. Requests outside the configured Superset
 * hostname are left untouched.
 */

import http from "node:http";
import https from "node:https";

const DEFAULT_SUPERSET_BASE_URL = "https://superset.example.invalid";
const SUPERSET_BASE_URL = process.env.SUPERSET_BASE_URL || DEFAULT_SUPERSET_BASE_URL;
const TARGET = new URL(SUPERSET_BASE_URL);
const TARGET_HOSTNAME = TARGET.hostname;
const PROD_HOSTNAME = "superset.toolsfdg.net";

if (TARGET_HOSTNAME === PROD_HOSTNAME && process.env.SUPERSET_ALLOW_PROD !== "1") {
  throw new Error(`[token-interceptor] refusing production host ${PROD_HOSTNAME}`);
}

const TOKEN = process.env.SUPERSET_TOKEN || process.env.SUPERSET_DEV_TOKEN || (
  TARGET_HOSTNAME === PROD_HOSTNAME ? process.env.SUPERSET_PROD_TOKEN : undefined
);
if (!TOKEN) {
  throw new Error("[token-interceptor] SUPERSET_TOKEN or SUPERSET_DEV_TOKEN is required");
}

// Refuse to send a known-prod token to a non-prod host. Catches the common
// shell mistake of `export SUPERSET_TOKEN=$SUPERSET_PROD_TOKEN` while pointing
// the shim at dev.
if (TARGET_HOSTNAME !== PROD_HOSTNAME && process.env.SUPERSET_PROD_TOKEN &&
    TOKEN === process.env.SUPERSET_PROD_TOKEN) {
  throw new Error(
    `[token-interceptor] refusing to send SUPERSET_PROD_TOKEN to non-prod host ${TARGET_HOSTNAME}`,
  );
}

const AUTH_HEADER = "Authorization";
const AUTH_VALUE = `Bearer ${TOKEN}`;

console.error(`[token-interceptor] target=${TARGET_HOSTNAME}`);

function isUrl(value) {
  return value instanceof URL;
}

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isRequest(value) {
  return typeof Request !== "undefined" && value instanceof Request;
}

function isOptionsObject(value) {
  return isObject(value) && !isUrl(value) && !isRequest(value);
}

function toRequestUrl(value, fallbackProtocol = "https:") {
  if (typeof value === "string") {
    try {
      return new URL(value);
    } catch {
      return null;
    }
  }
  if (isUrl(value)) return value;
  if (!isOptionsObject(value)) return null;

  const hostname = value.hostname || (value.host ? String(value.host).split(":")[0] : undefined);
  if (!hostname) return null;
  const protocol = value.protocol || fallbackProtocol;
  const port = value.port ? `:${value.port}` : "";
  const path = value.path || value.pathname || "/";
  return new URL(`${protocol}//${hostname}${port}${path}`);
}

function requestTargetFromArgs(args, fallbackProtocol) {
  const first = args[0];
  const second = args[1];

  if (typeof first === "string" || isUrl(first)) {
    const base = toRequestUrl(first, fallbackProtocol);
    if (base && isOptionsObject(second)) {
      const overrideHost = second.hostname || (second.host ? String(second.host).split(":")[0] : null);
      if (overrideHost) base.hostname = overrideHost;
      if (second.port) base.port = String(second.port);
      if (second.path || second.pathname) base.pathname = String(second.path || second.pathname);
    }
    return base;
  }

  return toRequestUrl(first, fallbackProtocol);
}

function matchesTarget(url) {
  return url?.hostname === TARGET_HOSTNAME;
}

function headerHas(headers, name) {
  const lowerName = name.toLowerCase();
  if (!headers) return false;
  if (headers instanceof Headers) return headers.has(name);
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lowerName) return true;
  }
  return false;
}

function injectHeaderMap(headers = {}) {
  const nextHeaders = { ...headers };
  if (!headerHas(nextHeaders, AUTH_HEADER)) {
    nextHeaders[AUTH_HEADER] = AUTH_VALUE;
  }
  return nextHeaders;
}

function injectFetchHeaders(headers) {
  const nextHeaders = new Headers(headers || {});
  if (!nextHeaders.has(AUTH_HEADER)) {
    nextHeaders.set(AUTH_HEADER, AUTH_VALUE);
  }
  return nextHeaders;
}

function logInjection(url) {
  const path = `${url.pathname || "/"}${url.search || ""}`;
  console.error(`[token-interceptor] injected on ${url.hostname}${path}`);
}

function injectIntoRequestArgs(args, fallbackProtocol) {
  const targetUrl = requestTargetFromArgs(args, fallbackProtocol);
  if (!matchesTarget(targetUrl)) return args;

  logInjection(targetUrl);

  const first = args[0];
  const second = args[1];
  const third = args[2];

  if (typeof first === "string" || isUrl(first)) {
    if (isOptionsObject(second)) {
      return [first, { ...second, headers: injectHeaderMap(second.headers) }, third].filter((v) => v !== undefined);
    }
    if (typeof second === "function") {
      return [first, { headers: injectHeaderMap() }, second];
    }
    return [first, { headers: injectHeaderMap() }];
  }

  if (isOptionsObject(first)) {
    return [{ ...first, headers: injectHeaderMap(first.headers) }, second].filter((v) => v !== undefined);
  }

  return args;
}

function patchRequest(moduleObject, protocol) {
  const originalRequest = moduleObject.request;
  const originalGet = moduleObject.get;

  function patchedRequest(...args) {
    return originalRequest.apply(this, injectIntoRequestArgs(args, protocol));
  }

  function patchedGet(...args) {
    const req = patchedRequest.apply(this, args);
    req.end();
    return req;
  }

  moduleObject.request = patchedRequest;
  moduleObject.get = originalGet ? patchedGet : originalGet;
}

function patchFetch() {
  if (typeof globalThis.fetch !== "function") return;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function patchedFetch(input, init = undefined) {
    const requestUrl = isRequest(input)
      ? new URL(input.url)
      : toRequestUrl(input, "https:");

    if (!matchesTarget(requestUrl)) {
      return originalFetch.call(this, input, init);
    }

    logInjection(requestUrl);

    if (isRequest(input)) {
      const headers = injectFetchHeaders(init?.headers || input.headers);
      return originalFetch.call(this, new Request(input, { ...init, headers }));
    }

    const headers = injectFetchHeaders(init?.headers);
    return originalFetch.call(this, input, { ...init, headers });
  };
}

patchRequest(http, "http:");
patchRequest(https, "https:");
patchFetch();
