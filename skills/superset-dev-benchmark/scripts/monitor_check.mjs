#!/usr/bin/env node
/**
 * monitor_check.mjs — Data freshness check + analysis trigger
 *
 * NOT ACTIVE IN DEV. The IM push channel (WEA_SEND, WUID-based notify) is not
 * reachable from the dev Superset host. Kept for shape parity with the
 * production maintained skill; benchmark experiments should not invoke it.
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Usage:
 *   node monitor_check.mjs --monitor-id <id>
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { API_BASE, SUPERSET_WEB_BASE, request } from "./http.mjs";
import { getDatasetDetail } from "./query_chart.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Dev-distinct state file; see monitor_setup.mjs for the rationale.
const MONITORS_FILE = `${process.env.HOME}/.superset-monitors-dev.json`;

// ─── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const monitorId = args[args.indexOf("--monitor-id") + 1];

if (!monitorId) {
  console.error("Usage: node monitor_check.mjs --monitor-id <id>");
  process.exit(2);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function utcToday() {
  return new Date().toISOString().slice(0, 10);
}

function bangkokHour() {
  return ((new Date().getUTCHours() + 7) % 24);
}

function loadMonitors() {
  if (!existsSync(MONITORS_FILE)) return {};
  try { return JSON.parse(readFileSync(MONITORS_FILE, "utf8")); } catch { return {}; }
}

function saveMonitors(data) {
  writeFileSync(MONITORS_FILE, JSON.stringify(data, null, 2));
}

function runProcess(cmd, cmdArgs, env = {}, timeout = 120) {
  const result = spawnSync(cmd, cmdArgs, {
    encoding: "utf8",
    timeout: timeout * 1000,
    env: { ...process.env, ...env },
    cwd: __dirname,
  });
  return { ok: result.status === 0, stdout: result.stdout || "", stderr: result.stderr || "" };
}

// ─── Data Freshness Check via partitions_meta ────────────────────────────────

const VALID_IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Extract underlying table names from a virtual dataset's SQL.
 * Best-effort regex over FROM/JOIN; strips schema prefix and quoting,
 * filters out invalid identifiers. CTE aliases are not detected — they
 * will simply miss partitions_meta and be treated as views (skipped).
 */
function extractTableNames(sql) {
  if (!sql || typeof sql !== "string") return [];
  const clean = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const re = /\b(?:FROM|JOIN)\s+([`"\w.]+)/gi;
  const names = new Set();
  let m;
  while ((m = re.exec(clean)) !== null) {
    const raw = m[1].replace(/[`"]/g, "");
    const parts = raw.split(".");
    const name = parts[parts.length - 1];
    if (VALID_IDENT.test(name)) names.add(name);
  }
  return [...names];
}

async function executeSql(databaseId, sql, schema) {
  const url = `${API_BASE}/api/v1/sqllab/execute/`;
  const body = { database_id: databaseId, sql, schema: schema || undefined };
  return await request("POST", url, body);
}

/**
 * Resolve dataset metadata for the freshness query.
 * Virtual datasets (ds.sql non-empty) have their underlying tables extracted
 * from the SQL; physical datasets use ds.table_name directly.
 */
async function resolveDatasetMeta(datasetId) {
  const detail = await getDatasetDetail(datasetId);
  const ds = detail.result;
  const tableName = ds.table_name || `dataset#${datasetId}`;
  const sql = ds.sql || null;
  const isVirtual = Boolean(sql);
  const physicalTables = isVirtual ? extractTableNames(sql) : [tableName];
  return {
    datasetId,
    tableName,
    isVirtual,
    physicalTables,
    dbId: ds.database?.id,
    schema: ds.schema || null,
  };
}

/**
 * Check all datasets for a monitor using information_schema.partitions_meta.
 *
 * Datasets sharing the same (dbId, schema) are batched into a single SQL call
 * on the union of underlying tables. Ready if MAX(VISIBLE_VERSION_TIME) date
 * >= UTC today.
 *
 * Skip (assume ready) — aligned with backend data_readiness.py:
 *   - Dataset has no database_id.
 *   - Virtual dataset with no extractable tables.
 *   - partitions_meta query fails for the whole group (engine unsupported,
 *     e.g. the engine does not expose this metadata table).
 *   - Virtual dataset whose every underlying table is missing (all views).
 *
 * For physical datasets, a missing partitions_meta row is treated as not-ready.
 */
async function checkAllDatasets(datasetIds) {
  const today = utcToday();
  const metas = [];
  for (const dsId of datasetIds) {
    metas.push(await resolveDatasetMeta(dsId));
  }

  // Group by (dbId, schema); value holds the union of underlying tables
  const groups = new Map();
  for (const m of metas) {
    if (!m.dbId || m.physicalTables.length === 0) continue;
    const key = `${m.dbId}::${m.schema || ""}`;
    if (!groups.has(key)) groups.set(key, { dbId: m.dbId, schema: m.schema, tables: new Set() });
    for (const t of m.physicalTables) groups.get(key).tables.add(t);
  }

  // Query each group once; track per-table results and per-group failures
  const versionTimes = new Map(); // "dbId::schema::table" → version_time
  const groupErrors = new Map();  // "dbId::schema" → error message

  for (const [key, group] of groups) {
    const tableNames = [...group.tables];
    const inClause = tableNames.map((t) => `'${t.replace(/'/g, "''")}'`).join(", ");
    const sql = [
      `SELECT TABLE_NAME, MAX(VISIBLE_VERSION_TIME) AS vt`,
      `  FROM information_schema.partitions_meta`,
      `  WHERE TABLE_NAME IN (${inClause})`,
      `    AND ROW_COUNT > 0`,
      group.schema ? `    AND DB_NAME = '${group.schema.replace(/'/g, "''")}'` : "",
      `  GROUP BY TABLE_NAME`,
    ].filter(Boolean).join("\n");

    console.error(`[freshness] Querying partitions_meta for [${tableNames.join(", ")}] (db=${group.dbId}, schema=${group.schema || "N/A"})`);

    try {
      const result = await executeSql(group.dbId, sql, group.schema);
      const rows = result?.data || [];
      for (const row of rows) {
        const name = row.TABLE_NAME ?? row.table_name;
        const vt = row.vt ?? row.VT;
        if (name) versionTimes.set(`${key}::${name}`, vt);
      }
    } catch (err) {
      console.error(`[freshness] partitions_meta query failed (db=${group.dbId}, schema=${group.schema || "N/A"}), assuming ready: ${err.message}`);
      groupErrors.set(key, err.message);
    }
  }

  // Evaluate per-dataset readiness
  const tables = {};
  let allReady = true;

  for (const m of metas) {
    if (!m.dbId) {
      console.error(`[freshness] Dataset #${m.datasetId} (${m.tableName}): no database_id, skip`);
      tables[m.datasetId] = { ready: true, table: m.tableName, method: "skip", reason: "no_database_id" };
      continue;
    }
    if (m.physicalTables.length === 0) {
      console.error(`[freshness] Dataset #${m.datasetId} (${m.tableName}): virtual with no extractable tables, skip`);
      tables[m.datasetId] = { ready: true, table: m.tableName, method: "skip", reason: "virtual_no_tables" };
      continue;
    }

    const groupKey = `${m.dbId}::${m.schema || ""}`;
    if (groupErrors.has(groupKey)) {
      tables[m.datasetId] = { ready: true, table: m.tableName, method: "skip", reason: `unsupported: ${groupErrors.get(groupKey)}` };
      continue;
    }

    const tableChecks = [];
    let datasetReady = true;
    let anyFound = false;

    for (const t of m.physicalTables) {
      const vt = versionTimes.get(`${groupKey}::${t}`);
      if (vt == null) {
        if (m.isVirtual) {
          tableChecks.push({ table: t, found: false, skipped: true });
          continue;
        }
        tableChecks.push({ table: t, found: false, ready: false });
        datasetReady = false;
        continue;
      }
      anyFound = true;
      const vtDate = new Date(vt).toISOString().slice(0, 10);
      const ready = vtDate >= today;
      tableChecks.push({ table: t, found: true, versionTime: vt, versionDate: vtDate, ready });
      if (!ready) datasetReady = false;
    }

    if (m.isVirtual && !anyFound) {
      console.error(`[freshness] Dataset #${m.datasetId} (${m.tableName}): virtual, all tables are views, skip`);
      tables[m.datasetId] = { ready: true, table: m.tableName, method: "skip", reason: "virtual_all_views" };
      continue;
    }

    console.error(`[freshness] Dataset #${m.datasetId} (${m.tableName}, virtual=${m.isVirtual}, today(UTC)=${today}): ready=${datasetReady}`, tableChecks);
    tables[m.datasetId] = {
      ready: datasetReady,
      table: m.tableName,
      method: "partitions_meta",
      virtual: m.isVirtual,
      tableChecks,
    };
    if (!datasetReady) allReady = false;
  }

  return { allReady, tables, targetDate: today };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  try {
    const monitors = loadMonitors();
    const monitor = monitors[monitorId];

    if (!monitor) {
      console.error(`Monitor "${monitorId}" not found in ${MONITORS_FILE}`);
      process.exit(2);
    }

    const today = utcToday();
    const state = monitor.state || {};
    const bkkHour = bangkokHour();
    const wuid = process.env.WUID;

    if (state.lastAnalyzedDate === today) { console.log(`Already analyzed today (${today}), skipping.`); process.exit(0); }
    if (state.timeoutAlertSentDate === today) { console.log(`Timeout alert already sent today (${today}), skipping.`); process.exit(0); }

    console.error(`Checking data freshness for dashboard #${monitor.dashboardId}...`);
    const freshData = await checkAllDatasets(monitor.datasetIds);

    if (!freshData.allReady) {
      const notReadyList = Object.entries(freshData.tables).filter(([, v]) => !v.ready).map(([id, v]) => v.table || `dataset#${id}`).join(", ");
      const timeoutHour = monitor.timeoutHourBangkok ?? 22;
      if (bkkHour >= timeoutHour) {
        const msg = [
          `Dashboard #${monitor.dashboardId} (${monitor.name}) data not updated on time`,
          `Bangkok passed ${timeoutHour}:00, no data for ${freshData.targetDate}: ${notReadyList}`,
          `Please check the data pipeline.`,
        ].join("\n");
        console.log(`WEA_SEND:${JSON.stringify({ to: monitor.notifyWuid || wuid, message: msg })}`);
        monitors[monitorId].state = { ...state, timeoutAlertSentDate: today };
        saveMonitors(monitors);
      } else {
        console.error(`Data not ready (Bangkok ${bkkHour}:xx < ${timeoutHour}:00). Will retry.`);
      }
      process.exit(1);
    }

    console.error("Data is ready! Starting analysis...");

    const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);
    const dataFile = `/tmp/superset_${monitor.dashboardId}_monitor_${ts}.json`;
    const analysisFile = `/tmp/superset_${monitor.dashboardId}_analysis_${ts}.json`;

    const fetchResult = runProcess("node", [
      "fetch_dashboard.mjs", "--id", String(monitor.dashboardId),
      "--time-offset", "1 week ago", "--time-range", "Last 7 days",
      "--output", dataFile,
    ]);
    if (!fetchResult.ok) { console.error("fetch_dashboard failed:", fetchResult.stderr); process.exit(2); }

    const analyzeResult = runProcess("python3", ["dashboard_analysis.py", "--input", dataFile, "--phase", "analyze", "--json"]);
    if (!analyzeResult.ok) { console.error("dashboard_analysis (analyze) failed:", analyzeResult.stderr); process.exit(2); }
    writeFileSync(analysisFile, analyzeResult.stdout);

    const dashUrl = `${SUPERSET_WEB_BASE}/dashboard/${monitor.dashboardId}/`;
    console.log(`ANALYZE_READY:${JSON.stringify({
      monitorId, dashboardId: monitor.dashboardId, name: monitor.name,
      targetDate: freshData.targetDate, dashUrl, notifyWuid: monitor.notifyWuid || wuid,
      dataFile, analysisFile,
    })}`);

    monitors[monitorId].state = { ...state, lastAnalyzedDate: today, lastAnalyzedAt: new Date().toISOString(), lastTargetDate: freshData.targetDate };
    saveMonitors(monitors);

    console.error(`Done. Report sent for dashboard #${monitor.dashboardId}, target date ${freshData.targetDate}.`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
})();
