# Dashboard Analysis Reference

## Commands

```bash
# Step 1 — Overview (lightweight, no data queries)
node fetch_dashboard.mjs --id <id> --overview

# Step 2 — Fetch data (with comparison offset; mixed modes auto-routed per chart)
node fetch_dashboard.mjs --id <id> --time-offset "1 week ago" [--time-range "Last 7 days"] --output <file>

# Step 3 — Analyze (maps to --phase analyze)
python3 dashboard_analysis.py --input <file> --phase analyze [--json]

# Step 4 — Drill (maps to --phase drill-plan / drill)
python3 dashboard_analysis.py --input <file> --phase drill-plan --analysis-file <file> --columns "dim1,dim2" [--metrics "m1,m2"] --json > <plan_file>
node fetch_dashboard.mjs --execute-drill <plan_file> --output <drill_data_file>
python3 dashboard_analysis.py --phase drill --analysis-file <file> --drill-data <drill_data_file> [--json]

# Step 5 — Summary (maps to --phase summary)
python3 dashboard_analysis.py --input <file> --phase summary --analysis-file <file> [--drill-file <file>] [--json]
```

## timeRange = "No filter" — No-Filter Mode

If a chart's `time_range` is `"No filter"` (or `granularity` is unset):

- **DO NOT** pass `--time-range` for the dashboard if you only want to scope these charts. `fetch_dashboard.mjs` will still respect `--time-range` for charts that have a real time filter, but for `"No filter"` charts the override is **ignored** with a stderr warning — overriding would override the chart's saved semantics and produce data inconsistent with what the dashboard page shows.
- `fetch_dashboard.mjs` auto-detects per chart and switches modes:
  - **`no_filter` mode** — query is sent as `POST /api/v1/chart/data` **without** `time_range` and **without** `time_offsets`. The chart's full stored series comes back as-is. We use POST here, not the per-chart `GET /api/v1/chart/{id}/data/`, because the GET path depends on a server-side `query_context` that is frequently `null` on imported charts.
  - **`with_offset` mode** — `TEMPORAL_RANGE` filter and `time_offsets: [<offset>]` are injected; the backend returns paired current/previous columns (`<metric>__<offset>`) for WoW comparison.
- The output cache marks each chart with `chart.time_mode: "no_filter" | "with_offset"`.
- `dashboard_analysis.py --phase analyze` reads `time_mode` per chart and routes:
  - `no_filter` → `extract_chart_series_no_filter()`. Computed in Python from the full series:
    - **`latest_value`** — last point in the series
    - **`trailing_mean`** — mean of the 7 points immediately before the latest (excludes latest)
    - **`latest_vs_trailing_mean`** — `(latest − trailing_mean) / trailing_mean`; magnitude proxy for sort
    - **`trend_slope`** — OLS slope over the last 8 points (sign = direction, magnitude = units/step)
    - **`stdev_deviation`** — `(latest − trailing_mean) / trailing_std`; |val| > 2 ≈ outlier
    - The unified-schema fields `previous_total` / `change_rate` / `abs_change` are `null` for these charts.
  - `with_offset` → classic WoW: `current_total`, `previous_total`, `change_rate`, `abs_change`.
- For **mixed dashboards** (some charts have a time range, others don't), both paths run inside one `--phase analyze` call and outputs are interleaved by magnitude in `result["charts"]`.

## Workflow

**Overview → confirm → Fetch → Analyze → confirm → Drill → Verify → Summary**

1. **Overview** — Run `--overview`. Present charts, metrics, dimensions. **Inspect each chart's `timeRange`**:
   - `"No filter"` charts → no_filter mode, no comparison period needed.
   - Charts with an explicit time range → determine comparison period:
     - User specified a time range → default to previous-period offset (e.g., "Last 7 days" → `7 days ago`).
     - User did NOT specify → ask: WoW / MoM / YoY / custom.
   - **Wait for confirmation.**

2. **Fetch** — Run with confirmed `--time-offset` and optional `--time-range`. The script picks the right mode per chart automatically; check stderr for any `[fetch] WARN chart … ignoring --time-range` lines so you know which charts opted out of the override.

3. **Analyze** (`--phase analyze`) — AI examines two dimensions of change across both modes:
   - **Spike/drop detection**:
     - `with_offset` charts → abnormal current vs previous-period change (uses `change_rate` / `abs_change`).
     - `no_filter` charts → abnormal latest-day vs trailing-mean change (uses `latest_vs_trailing_mean` and `stdev_deviation`; |σ| > 2 is a strong signal).
   - **Trend detection**: Sustained rise or decline over consecutive recent periods. For `no_filter` charts the AI reads `trend_slope` (sign + magnitude over the last 8 points) and may also scan the embedded `series` for run-length.
   - AI judges significance holistically — no fixed threshold. Compare percentage change AND absolute change magnitude (50% on value 10 ≠ 50% on value 1M).
   - If significant changes found, ask user which dimensions to drill. **Wait for confirmation.** If no significant changes, present conclusion directly.

4. **Drill** (`--phase drill-plan` → `--execute-drill` → `--phase drill`):
   - Drill is conceptually a "current vs previous period root-cause" query, so **`no_filter` charts are skipped** by `--phase drill-plan` (stderr lists which were skipped). For dimensional analysis on a no_filter chart, run `query_chart.mjs --dataset-id <id> --metrics <m> --columns <dim>` directly — see "Drill-Down Decision Flow" below.
   - For `with_offset` charts, the plan groups queries by datasource, drills each `(metric × dimension)` pair, executes via JS, then `--phase drill` aggregates top contributors and common roots.

5. **Verify** — Before presenting the final report, cross-check key claims against actual data to prevent hallucination:
   - For each significant metric change cited in the analysis, run `query_chart.mjs --chart-id <id> --format` to confirm the actual numbers match the claimed change direction and magnitude.
   - For any drill-down root cause (e.g., "dimension X = Y accounts for Z% of the change"), run a targeted query: `query_chart.mjs --dataset-id <id> --metrics <metric> --columns <dimension> --time-range <range> --format` to verify the value.
   - For a `no_filter` chart, verify by `query_chart.mjs --chart-id <id> --format` and slice the result in your head against the same trailing window — do not pass `--time-range` to override its saved semantics.
   - If a claimed number does not match the query result, **correct it** before including it in the summary. Do NOT present unverified claims.
   - Only include conclusions that are supported by the queried data.

6. **Summary** (`--phase summary`) — Present final report. Every number in the report must have been verified in step 5.

## Analysis Rules

- Each analysis is independent — base conclusions on current data only, not prior conversation history.
- Skip dimensions whose root cause is already clear from current data.
- Only suggest drill-down when unexplored dimensions remain. Otherwise present conclusion directly.

## Limitation

Cross-chart correlation only compares charts sharing the same datasource. Charts on different datasources are analyzed independently — cross-datasource correlations are not detected. Pearson correlation runs on the **time series** of each metric (point-by-point alignment), so a `no_filter` chart and a `with_offset` chart on the same datasource can be correlated against each other — both contribute their `current` series; series of different time grains are resampled to the coarser grain before alignment. The `change_rate` value used for co-movement *direction* uses `latest_vs_trailing_mean` as a fallback for `no_filter` metrics (since their `change_rate` is `null`).

## Drill-Down Decision Flow

When the user asks for drill-down analysis after seeing anomalies:

1. **Check Superset dataset columns** — does it have dimension (groupby) fields beyond metrics?
   - Yes → drill directly on those dimensions
   - No (metrics-only aggregation table) → Step 2

2. **Stop or ask for a richer dataset** — benchmark drill-down must stay within
   the registered Superset dataset metadata. Do not invent upstream tables or
   unregistered dimensions.

**Never propose unvalidated SQL.** Validate columns with
`create_chart.mjs --dataset-info <id>` and run a small sanity query before
presenting a full drill-down result.
