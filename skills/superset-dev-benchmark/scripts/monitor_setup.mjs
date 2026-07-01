#!/usr/bin/env node
/**
 * monitor_setup.mjs — Register / list / remove dashboard monitors
 *
 * NOT ACTIVE IN DEV. The dev Superset host has no link to the internal IM
 * platform, so the IM push channel that monitor_check.mjs would call
 * (WEA_SEND, WUID-based notify) is unreachable here. This file is kept for
 * shape parity with the production maintained skill; benchmark experiments
 * should not invoke it.
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Modes:
 *   --add --dashboard <id|name> [--start-hour H] [--end-hour H] [--interval M] [--notify <wuid>]
 *   --list
 *   --status --monitor-id <id>
 *   --remove --monitor-id <id>
 *   --update-cron-id --monitor-id <id> --cron-job-id <cronId>
 */

import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { searchDashboards, getDashboard, getDashboardDatasets } from "./query_dashboard.mjs";

// Dev-distinct state file. Production skill uses `~/.superset-monitors.json`;
// keeping the dev copy on a separate path prevents the two from intermixing
// when the same machine has been used against both environments.
const MONITORS_FILE = `${process.env.HOME}/.superset-monitors-dev.json`;

function loadMonitors() {
  if (!existsSync(MONITORS_FILE)) return {};
  try { return JSON.parse(readFileSync(MONITORS_FILE, "utf8")); } catch { return {}; }
}

function saveMonitors(data) {
  writeFileSync(MONITORS_FILE, JSON.stringify(data, null, 2));
}

function genId() {
  return randomBytes(4).toString("hex");
}

function buildCronExpr(startHourBkk, endHourBkk, intervalMin) {
  const startUTC = ((startHourBkk - 7) % 24 + 24) % 24;
  const endUTC = ((endHourBkk - 7) % 24 + 24) % 24;
  const minutePart = intervalMin === 60 ? "0" : `*/${intervalMin}`;
  if (startUTC <= endUTC) return `${minutePart} ${startUTC}-${endUTC} * * *`;
  return `${minutePart} ${startUTC}-23,0-${endUTC} * * *`;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    add: { type: "boolean", default: false },
    list: { type: "boolean", default: false },
    status: { type: "boolean", default: false },
    remove: { type: "boolean", default: false },
    "update-cron-id": { type: "boolean", default: false },
    dashboard: { type: "string" },
    "start-hour": { type: "string", default: "20" },
    "end-hour": { type: "string", default: "22" },
    interval: { type: "string", default: "30" },
    notify: { type: "string" },
    "monitor-id": { type: "string" },
    "cron-job-id": { type: "string" },
  },
  allowPositionals: true,
});

if (!values.add && !values.list && !values.status && !values.remove && !values["update-cron-id"]) {
  console.error("Usage:");
  console.error("  node monitor_setup.mjs --add --dashboard <id|name> [--start-hour 20] [--end-hour 22] [--interval 30] [--notify <wuid>]");
  console.error("  node monitor_setup.mjs --list");
  console.error("  node monitor_setup.mjs --status --monitor-id <id>");
  console.error("  node monitor_setup.mjs --remove --monitor-id <id>");
  console.error("  node monitor_setup.mjs --update-cron-id --monitor-id <id> --cron-job-id <cronId>");
  process.exitCode = 1;
} else {
  (async () => {
    try {
      const monitors = loadMonitors();

      if (values.list) {
        const ids = Object.keys(monitors);
        if (!ids.length) { console.log("No monitors registered."); return; }
        console.log(`Monitors (${ids.length}):\n`);
        for (const id of ids) {
          const m = monitors[id];
          const state = m.state || {};
          const status = state.lastAnalyzedDate ? `last analyzed ${state.lastAnalyzedDate}` : "never analyzed";
          console.log(`  ${id}  ${m.name} (dashboard #${m.dashboardId})`);
          console.log(`        schedule: Bangkok ${m.startHourBangkok}:00-${m.endHourBangkok}:00 every ${m.intervalMinutes}min`);
          console.log(`        notify: ${m.notifyWuid}  status: ${status}`);
          if (m.cronJobId) console.log(`        cronJobId: ${m.cronJobId}`);
        }
        return;
      }

      if (values.status) {
        const mid = values["monitor-id"];
        if (!mid || !monitors[mid]) { console.error(`Monitor "${mid}" not found.`); process.exitCode = 1; return; }
        const m = monitors[mid];
        const s = m.state || {};
        console.log(JSON.stringify({
          monitorId: mid, name: m.name, dashboardId: m.dashboardId, datasetIds: m.datasetIds,
          schedule: `Bangkok ${m.startHourBangkok}:00-${m.endHourBangkok}:00 every ${m.intervalMinutes}min`,
          cronExpr: m.cronExpr, cronJobId: m.cronJobId || null, notifyWuid: m.notifyWuid,
          lastAnalyzedDate: s.lastAnalyzedDate || null, lastAnalyzedAt: s.lastAnalyzedAt || null,
          lastTargetDate: s.lastTargetDate || null, timeoutAlertSentDate: s.timeoutAlertSentDate || null,
        }, null, 2));
        return;
      }

      if (values.remove) {
        const mid = values["monitor-id"];
        if (!mid || !monitors[mid]) { console.error(`Monitor "${mid}" not found.`); process.exitCode = 1; return; }
        const m = monitors[mid];
        if (m.cronJobId) console.log(`CRON_REMOVE:${m.cronJobId}`);
        delete monitors[mid];
        saveMonitors(monitors);
        console.error(`[monitor] Removed monitor "${mid}".`);
        return;
      }

      if (values["update-cron-id"]) {
        const mid = values["monitor-id"];
        const cronJobId = values["cron-job-id"];
        if (!mid || !monitors[mid]) { console.error(`Monitor "${mid}" not found.`); process.exitCode = 1; return; }
        if (!cronJobId) { console.error("--cron-job-id is required."); process.exitCode = 1; return; }
        monitors[mid].cronJobId = cronJobId;
        saveMonitors(monitors);
        console.error(`[monitor] Updated cronJobId for "${mid}" -> ${cronJobId}`);
        return;
      }

      if (values.add) {
        if (!values.dashboard) { console.error("--dashboard <id|name> is required."); process.exitCode = 1; return; }

        let dashId;
        let dashTitle;
        if (/^\d+$/.test(values.dashboard)) {
          dashId = parseInt(values.dashboard, 10);
          const dash = await getDashboard(dashId);
          dashTitle = dash.result?.dashboard_title || `Dashboard ${dashId}`;
        } else {
          const searchResult = await searchDashboards(values.dashboard);
          const results = searchResult.result || [];
          if (!results.length) { console.error(`No dashboard found matching "${values.dashboard}".`); process.exitCode = 1; return; }
          if (results.length > 1) {
            console.error(`Multiple dashboards found -- specify by ID:`);
            for (const d of results) console.error(`  #${d.id}  ${d.dashboard_title}`);
            process.exitCode = 1;
            return;
          }
          dashId = results[0].id;
          dashTitle = results[0].dashboard_title;
        }

        const dsResult = await getDashboardDatasets(dashId);
        const datasets = dsResult.result || [];
        const datasetIds = datasets.map((d) => d.id);

        if (!datasetIds.length) { console.error(`Dashboard #${dashId} has no datasets.`); process.exitCode = 1; return; }

        const startHour = parseInt(values["start-hour"], 10);
        const endHour = parseInt(values["end-hour"], 10);
        const interval = parseInt(values.interval, 10);
        const wuid = process.env.WUID;
        const notifyWuid = values.notify || wuid;
        const cronExpr = buildCronExpr(startHour, endHour, interval);
        const monitorId = `mon_${dashId}_${genId()}`;

        monitors[monitorId] = {
          name: dashTitle, dashboardId: dashId, datasetIds,
          startHourBangkok: startHour, endHourBangkok: endHour, timeoutHourBangkok: endHour,
          intervalMinutes: interval, notifyWuid, cronExpr, cronJobId: null,
          createdAt: new Date().toISOString(), state: {},
        };
        saveMonitors(monitors);

        const registered = { monitorId, dashboardId: dashId, name: dashTitle, datasetIds, cronExpr, notifyWuid, schedule: `Bangkok ${startHour}:00-${endHour}:00 every ${interval}min` };
        console.log(`MONITOR_REGISTERED:${JSON.stringify(registered)}`);
        console.error(`[monitor] Registered "${monitorId}" for dashboard #${dashId} (${dashTitle})`);
        console.error(`[monitor] Datasets: ${datasetIds.join(", ")}`);
        console.error(`[monitor] Cron (UTC): ${cronExpr}`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  })();
}
