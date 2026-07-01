# Dashboard Monitor — Reference

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| Dashboard ID or name | Which dashboard to watch | required |
| `--start-hour` | Start checking (Bangkok hour 0-23) | 20 |
| `--end-hour` | Timeout hour; no data by then → alert | 22 |
| `--interval` | Check frequency: 10 / 30 / 60 min | 30 |
| `--notify` | WUID to send report to | current user |

## Setup Flow

1. `--add` resolves dashboard, discovers datasets via API, generates UTC cron expr, writes to `~/.superset-monitors.json`.
2. Output: `MONITOR_REGISTERED:<json>` with `monitorId`, `cronExpr`, `notifyWuid`.
3. Agent creates cron job using `cronExpr`, then saves the job ID:
   ```bash
   WUID=+xxx node monitor_setup.mjs --update-cron-id --monitor-id <id> --cron-job-id <cronId>
   ```

## Other Commands

```bash
WUID=+xxx node monitor_setup.mjs --list                          # list all
WUID=+xxx node monitor_setup.mjs --status --monitor-id <id>      # detail + state
WUID=+xxx node monitor_setup.mjs --remove --monitor-id <id>      # remove (outputs CRON_REMOVE:<id>)
```

## monitor_check.mjs (cron)

Each tick: check data freshness → ready: fetch dashboard data → run analyze phase → output `ANALYZE_READY` for agent. Not ready past end-hour → output `WEA_SEND` timeout alert. Dedup via `~/.superset-monitors.json` state.

**Stdout signals** for agent:
- `ANALYZE_READY:<json>` — `{monitorId, dashboardId, name, targetDate, dashUrl, notifyWuid, dataFile, analysisFile}` → agent takes over: do AI-driven analysis, screenshot, send WEA
- `WEA_SEND:<json>` — `{to, message}` → send WEA message (timeout alerts only)
- Other lines → logs, ignore

## Cron Agent Prompt Template

```
WUID=+<notifyWuid> node <scripts_dir>/monitor_check.mjs --monitor-id <monitorId>

Read stdout line by line:
- ANALYZE_READY:<json>:
  1. Read the analysisFile (JSON) — contains per-chart metric changes, correlations
  2. Use the standard Dashboard Analysis workflow to produce an AI-driven summary
     (judge significance, describe trends, identify root causes — do NOT use --phase summary template)
  3. Take dashboard screenshot: node screenshot.mjs --dashboard <dashboardId> --output /tmp/dash_<id>.png
  4. Send WEA to notifyWuid with: report text + screenshot image + dashboard URL
- WEA_SEND:<json>:
  Send WEA message to `to` with `message` (timeout alerts)
- Other lines: logs, ignore
```

## Data Freshness Check

All datasets use a single method: query `information_schema.partitions_meta` via sqllab.

```sql
SELECT TABLE_NAME, MAX(VISIBLE_VERSION_TIME) AS vt
  FROM information_schema.partitions_meta
  WHERE TABLE_NAME IN (...)
    AND ROW_COUNT > 0 AND DB_NAME = '{schema}'
  GROUP BY TABLE_NAME
```

Datasets sharing the same database + schema are batched into one SQL call (union of underlying tables). Ready if `MAX(VISIBLE_VERSION_TIME)` date >= UTC today.

**Virtual datasets** (`ds.sql` non-empty): underlying tables are extracted from the SQL (regex on `FROM`/`JOIN`) and each is checked in `partitions_meta`. Tables not found are treated as views and skipped.

**Skip rules** (assume ready, no alarm) — aligned with backend `data_readiness.py`:
- Dataset has no database.
- Virtual dataset with no extractable tables.
- partitions_meta query fails because the database engine does not expose this
  metadata table.
- Virtual dataset whose every underlying table is a view.

For physical datasets, a missing `partitions_meta` row is treated as not-ready.

## Dedup

`~/.superset-monitors.json` tracks `lastAnalyzedDate` and `timeoutAlertSentDate` — prevents duplicate reports/alerts within the same UTC day.
