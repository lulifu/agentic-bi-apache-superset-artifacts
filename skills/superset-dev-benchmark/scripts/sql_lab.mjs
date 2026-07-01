#!/usr/bin/env node

/**
 * Superset SQL Lab helper for dev benchmark validation.
 *
 * Auth is supplied externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Usage:
 *   node sql_lab.mjs --database-id <id> --schema <schema> --sql <sql> [--format|--json]
 */

import { parseArgs } from "node:util";
import { API_BASE, request } from "./http.mjs";

async function executeSql({ databaseId, schemaName, sql }) {
  const body = {
    database_id: databaseId,
    schema: schemaName || undefined,
    sql,
  };
  return await request("POST", `${API_BASE}/api/v1/sqllab/execute/`, body);
}

function extractRows(payload) {
  const data = payload?.data || payload?.result?.data || payload?.result?.[0]?.data || [];
  if (!Array.isArray(data) || data.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => row[h]));
  return { headers, rows };
}

function formatTable(headers, rows, maxWidth = 60) {
  if (!headers.length) return "(no rows)";
  const widths = headers.map((h, i) => Math.min(maxWidth, Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? "NULL").length))));
  const fmt = (row) => row.map((v, i) => {
    let s = String(v ?? "NULL").replace(/\n/g, " ");
    if (s.length > widths[i]) s = `${s.slice(0, widths[i] - 3)}...`;
    return s.padEnd(widths[i]);
  }).join("  ");
  return [
    fmt(headers),
    widths.map((w) => "-".repeat(w)).join("  "),
    ...rows.map(fmt),
  ].join("\n");
}

if (process.argv[1]?.endsWith("sql_lab.mjs")) {
  const { values } = parseArgs({
    options: {
      "database-id": { type: "string" },
      schema: { type: "string" },
      sql: { type: "string" },
      json: { type: "boolean", default: false },
      format: { type: "boolean", default: false },
    },
  });

  (async () => {
    try {
      if (!values["database-id"] || !values.sql) {
        throw new Error("--database-id and --sql are required");
      }
      const databaseId = parseInt(values["database-id"], 10);
      if (!databaseId) throw new Error("--database-id must be a positive integer");

      const result = await executeSql({
        databaseId,
        schemaName: values.schema,
        sql: values.sql,
      });

      if (values.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (values.format) {
        const { headers, rows } = extractRows(result);
        console.log(formatTable(headers, rows));
      } else {
        console.log(JSON.stringify({
          status: result.status || result.result?.status || "ok",
          rowcount: result.query?.rows || result.data?.length || 0,
        }, null, 2));
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  })();
}

export { executeSql };
