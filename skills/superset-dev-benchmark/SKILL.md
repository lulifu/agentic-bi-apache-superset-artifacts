---
name: superset-dev-benchmark
description: >-
  Use the development Apache Superset environment for benchmark experiments:
  search datasets, inspect dataset schemas, query chart data, create or update
  charts and dashboards, verify rendered artifacts, analyze dashboard metrics,
  add annotations, and export screenshots. This skill is dev-only and must not
  call the production Superset host.
version: 0.1.1
upstream: 1.7.1
tags:
  - superset
  - bi
  - benchmark
  - dashboard
  - chart
  - data-analysis
  - visualization
---

# Superset Dev Benchmark Skill

Use this skill for repository-local NL2BI benchmark work against the development
Superset deployment at `https://superset.example.invalid`.

Do not use this skill for production dashboards, production datasets, or any
workflow that needs the maintained production Superset skill. This copy is
intentionally stripped to benchmark-safe Superset operations only.

## Environment

- Default host: `https://superset.example.invalid`
- API base: `${SUPERSET_BASE_URL:-https://superset.example.invalid}/api/v1`
- Web base: `${SUPERSET_BASE_URL:-https://superset.example.invalid}/superset`
- Production host guard: `scripts/http.mjs` refuses `superset.toolsfdg.net`.

Authentication is external to the skill scripts. In local Codex runs, use the
repo interceptor:

```bash
node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/create_chart.mjs \
  --search-dataset <dataset_name>
```

Set `SUPERSET_DEV_TOKEN` or generic `SUPERSET_TOKEN` before using the
interceptor. Do not print tokens in logs, prompts, files, or command output.

## Constraints

- Use scripts in `scripts/` for Superset API operations. Extend a script or add
  a sibling script rather than hand-calling REST endpoints in an ad-hoc way.
- Do not delete datasets, dashboards, charts, annotations, or monitor records.
- Before running any `--dataset-id` query, inspect the dataset first:
  `node create_chart.mjs --dataset-info <id>`.
- For benchmark artifacts, use names containing a stable experiment prefix such
  as `nl2bi-bench` and keep chart/dashboard creation consolidated when possible.
- Analysis must be data-driven. Separate observations from hypotheses and state
  actual numbers, percentages, time ranges, and grouping dimensions.
- This dev copy has no external dashboard import, ticketing, or data warehouse
  provisioning workflow.

## Error Handling

- Auth/session errors: retry once after refreshing credentials or rerunning the
  token interceptor command.
- `403 Forbidden`: do not retry blindly. Report the missing permission.
- Other errors: report the script error as-is and fix the request parameters
  from dataset metadata or reference files.

## Commands

Run commands from this skill directory unless paths are made absolute.

### Query Charts and Datasets

```bash
node scripts/query_chart.mjs --search <keyword>
node scripts/query_chart.mjs --chart-id <id> [--format|--markdown|--info]
node scripts/query_chart.mjs --dataset-id <id> --metrics <expr,...> \
  [--columns <col,...>] [--time-range <range>] [--granularity <col>] \
  [--filters '<json>'] [--row-limit <n>]
node scripts/create_chart.mjs --search-dataset <keyword>
node scripts/create_chart.mjs --dataset-info <id>
node scripts/dataset_admin.mjs --list-databases
node scripts/dataset_admin.mjs --list-schemas --database-id <id>
node scripts/dataset_admin.mjs --list-tables --database-id <id> --schema <schema>
node scripts/dataset_admin.mjs --ensure-physical --database-id <id> \
  --schema <schema> --table <table> [--dry-run] [--apply-bird-metadata]
node scripts/dataset_admin.mjs --ensure-virtual --database-id <id> \
  --schema <schema> --table <name> --sql-file <path> [--description <text>]
node scripts/sql_lab.mjs --database-id <id> --schema <schema> \
  --sql '<read_only_sql>' [--format|--json]
```

Dataset query rules:

- `--columns` becomes the GROUP BY dimension list.
- Without `--columns`, Superset returns one aggregated row.
- Metrics may be saved metric names or SQL expressions such as `SUM(amount)`.
- `--filters` must be JSON in Superset chart-data filter shape, for example
  `{"col":"year","op":"==","val":2004}`.
- Use `dataset_admin.mjs` to resolve database IDs, schema names, physical table
  availability, and benchmark dataset registration at runtime. Do not assume a
  dataset ID from another Superset environment.
- Use `sql_lab.mjs` for read-only multi-table benchmark ground-truth checks that
  cannot be expressed against a single physical dataset through chart-data.

### Query Dashboards

```bash
node scripts/query_dashboard.mjs --search <keyword>
node scripts/query_dashboard.mjs --id <id> [--charts [--detail] | --datasets | --tabs] [--json]
```

### Create or Update Charts

```bash
echo '<config>' | node scripts/create_chart.mjs --preview
echo '<config>' | node scripts/create_chart.mjs --create
echo '<updates>' | node scripts/create_chart.mjs --update <chart_id>
node scripts/verify_chart.mjs --chart-id <chart_id>
```

Workflow:

1. Search and confirm the dataset.
2. Inspect dataset columns and saved metrics with `--dataset-info`.
3. Read `references/viz_types.md` for the chart type.
4. Read `references/viz_params/<viz_type>.md` for required params.
5. Preview the config.
6. Create or update the chart.
7. Run `verify_chart.mjs`; fix only from the returned `issues[]`.

The verify loop is capped at 3 attempts. Send or cite screenshots only after a
verdict returns `ok: true`.

### Create or Update Dashboards

```bash
echo '<config>' | node scripts/create_dashboard.mjs --create
echo '<config>' | node scripts/create_dashboard.mjs --add-charts
node scripts/create_dashboard.mjs --get-layout <dashboard_id>
node scripts/verify_dashboard.mjs --dashboard-id <dashboard_id> \
  [--expect-chart-ids 1,2,3]
```

`--create` and `--add-charts` run dashboard verification by default. Read
`references/dashboard_verify_workflow.md` when `verify.ok` is false.

For custom layout changes, read `references/dashboard_layout.md`. For native
filter bar changes, read `references/dashboard_filters.md`.

### Dashboard and Chart Analysis

```bash
node scripts/fetch_dashboard.mjs --id <id> --overview
node scripts/fetch_dashboard.mjs --id <id> --time-offset "1 week ago" \
  [--time-range "Last 7 days"] --output <file>
python3 scripts/dashboard_analysis.py --input <file> --phase analyze [--json]

node scripts/analyze_chart.mjs --chart-id <id> --analyze [--json] [--with-series]
node scripts/analyze_chart.mjs --drill --analysis-file <file> \
  --columns "dim1,dim2" [--timestamps "ts1,ts2"] [--metrics "m1,m2"]
```

Read `references/dashboard_analysis_reference.md` before multi-chart dashboard
analysis. Use drill-down only after dataset metadata confirms the dimensions.

### Statistical Analysis

Use only when the user explicitly asks for a statistical method. Re-run chart
analysis with `--with-series` first.

```bash
python3 scripts/stats_analysis.py --input <analysis.json> \
  --operation <trend|outlier|distribution|correlation|rolling> \
  [--metrics "m1,m2"] [--window N] [--json]
```

### Screenshots

```bash
node scripts/screenshot.mjs --chart <id> --output /tmp/chart.png
node scripts/screenshot.mjs --dashboard <id> --output /tmp/dashboard.png
node scripts/screenshot.mjs --dashboard <id> --format pdf --output /tmp/dashboard.pdf
node scripts/screenshot.mjs --dashboard <id> --output /tmp/dashboard.png --dry-run
```

Screenshot rules for benchmark runs:

- Do not issue chart screenshots concurrently. Use `concurrency=1` or a
  strictly serial loop.
- Prefer one dashboard-level screenshot over parallel screenshots for every
  chart mounted on the dashboard.
- If SQL/query preview succeeds but screenshot polling times out, record
  `render_verification_timeout` separately from chart/dashboard definition
  correctness.
- Retry screenshot verification 1-2 times before treating render verification
  as failed.

### Dashboard Monitor — not active in dev

The monitor scripts (`monitor_setup.mjs`, `monitor_check.mjs`) and the IM
push channel they call (`WEA_SEND:`, `WUID`-based notify) are **not active
in the development environment**. The dev Superset host has no link to the
internal IM platform, so a monitor created here will never deliver a
notification.

The scripts and `references/monitor_reference.md` are kept in this dev copy
only for shape parity with the production maintained skill, so paper
discussion of cron-driven monitoring can cite them without having to switch
repos. Benchmark experiments should not invoke them.

```bash
# Reference only — not runnable end-to-end in dev:
node scripts/monitor_setup.mjs --add --dashboard <id-or-name> --notify <wuid>
node scripts/monitor_check.mjs --monitor-id <monitor_id>
```

### Annotations

```bash
node scripts/annotation.mjs --list-layers --dashboard-id <id>
node scripts/annotation.mjs --add --layer-id <layer_id> \
  --short-descr "Event label" \
  --start 2026-05-08T14:30:00 --end 2026-05-08T14:30:00
node scripts/annotation.mjs --list-annotations --layer-id <layer_id>
```
