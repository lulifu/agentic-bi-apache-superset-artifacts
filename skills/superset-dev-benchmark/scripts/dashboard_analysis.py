#!/usr/bin/env python3
"""Dashboard cross-analysis engine.

Reads cached JSON from fetch_dashboard.mjs and performs:
  --phase analyze      Anomaly detection + cross-chart correlation
  --phase drill-plan   Generate drill query plan for JS execution
  --phase drill        Analyze drill results, find common root causes
  --phase summary      Merge all findings into final report

Python stdlib only. Imports helpers from stats_analysis.py.
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from statistics import mean

# Import cross-chart helpers from stats_analysis.py (same directory)
import importlib.util
import os

_stats_spec = importlib.util.spec_from_file_location(
    "stats_analysis",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "stats_analysis.py"),
)
_stats_mod = importlib.util.module_from_spec(_stats_spec)
_stats_spec.loader.exec_module(_stats_mod)

pearson_r = _stats_mod.pearson_r
resample_time_series = _stats_mod.resample_time_series
align_and_correlate = _stats_mod.align_and_correlate
detect_co_movement = _stats_mod.detect_co_movement
GRAIN_SECONDS = _stats_mod.GRAIN_SECONDS


# ── Data extraction ─────────────────────────────────────────────────


def materialize_rows(qr):
    """Return list[dict] from a query_result in either format.

    Columnar (new): {colnames: [...], rows: [[v, v, ...], ...]}
    Legacy:        {colnames: [...], data: [{col: v, ...}, ...]}
    """
    if not qr:
        return []
    if "rows" in qr:
        colnames = qr.get("colnames") or []
        return [dict(zip(colnames, row)) for row in qr.get("rows", [])]
    return qr.get("data", [])


def find_time_column(colnames, granularity):
    """Locate the time column in query result colnames.

    Priority: granularity field > __timestamp > common date patterns.
    """
    if granularity and granularity in colnames:
        return granularity
    if "__timestamp" in colnames:
        return "__timestamp"
    pattern = re.compile(r"(?:^|_)(time|date|day|month|year|week|hour|ts|dt|ds|timestamp)(?:_|$)", re.I)
    for c in colnames:
        if pattern.search(c):
            return c
    return colnames[0] if colnames else None


def extract_chart_series(chart, time_offset):
    """Extract per-metric current/previous time series from a chart's query_result.

    Returns: {metric_name: {
        current: [(ts, val), ...],
        previous: [(ts, val), ...],
        current_total: float,
        previous_total: float
    }}
    """
    qr = chart.get("query_result", {})
    data = materialize_rows(qr)
    colnames = qr.get("colnames", [])
    config = chart.get("config", {})
    metrics = config.get("metrics", [])
    granularity = config.get("granularity")

    if not data or not metrics:
        return {}

    time_col = find_time_column(colnames, granularity)
    result = {}

    for metric_name in metrics:
        compare_col = f"{metric_name}__{time_offset}"

        current_series = []
        previous_series = []
        current_total = 0.0
        previous_total = 0.0

        # Accumulate by timestamp to handle groupby data (multiple rows per ts)
        current_by_ts = {}
        previous_by_ts = {}

        for row in data:
            val = row.get(metric_name)
            prev_val = row.get(compare_col)
            ts = str(row.get(time_col, "")) if time_col else ""

            try:
                c = float(val) if val is not None else 0.0
            except (ValueError, TypeError):
                c = 0.0
            try:
                p = float(prev_val) if prev_val is not None else 0.0
            except (ValueError, TypeError):
                p = 0.0

            current_total += c
            previous_total += p

            if time_col and ts:
                current_by_ts[ts] = current_by_ts.get(ts, 0.0) + c
                previous_by_ts[ts] = previous_by_ts.get(ts, 0.0) + p

        # Sort by timestamp for consistent series ordering
        current_series = sorted(current_by_ts.items(), key=lambda x: x[0])
        previous_series = sorted(previous_by_ts.items(), key=lambda x: x[0])

        result[metric_name] = {
            "current": current_series,
            "previous": previous_series,
            "current_total": current_total,
            "previous_total": previous_total,
        }

    return result


# ── Groupby dimension breakdown ─────────────────────────────────────


def extract_groupby_breakdown(chart, time_offset):
    """For charts with groupby columns (but no time dimension), extract per-dimension WoW.

    Returns: {metric_name: [{dimension: col, value: val, current, previous, change_rate}, ...]}
    Sorted by abs change descending. Returns {} if no groupby or time-series chart.
    """
    config = chart.get("config", {})
    groupby_cols = config.get("groupby", [])
    granularity = config.get("granularity")
    metrics = config.get("metrics", [])

    # Only run for non-time-series groupby charts (groupby present, no time_grain grouping in rows)
    if not groupby_cols or not metrics:
        return {}

    qr = chart.get("query_result", {})
    data = materialize_rows(qr)
    if not data:
        return {}

    result = {}
    dim_col = groupby_cols[0]  # use first groupby dimension

    for metric_name in metrics:
        compare_col = f"{metric_name}__{time_offset}"
        rows_out = []
        for row in data:
            dim_val = str(row.get(dim_col, "N/A"))
            try:
                c = float(row.get(metric_name) or 0)
            except (ValueError, TypeError):
                c = 0.0
            try:
                p = float(row.get(compare_col) or 0)
            except (ValueError, TypeError):
                p = 0.0
            rate = calc_change_rate(c, p)
            rows_out.append({
                "dimension": dim_col,
                "value": dim_val,
                "current": round(c, 4),
                "previous": round(p, 4),
                "abs_change": round(c - p, 4),
                "change_rate": round(rate, 4),
            })
        rows_out.sort(key=lambda x: abs(x["abs_change"]), reverse=True)
        result[metric_name] = rows_out

    return result


# ── No-filter time-series extraction ────────────────────────────────


def extract_chart_series_no_filter(chart, trailing_window=7):
    """Extract per-metric stats from a chart that has no time filter.

    Used when fetch_dashboard.mjs sets time_mode == "no_filter": the chart's
    own configuration is `time_range = "No filter"`, so the query result is
    the FULL time series and no comparison-period column was injected. We
    derive change signals in-process instead:

      - latest_value:               last point in the series
      - trailing_mean:              mean of the trailing_window points
                                    immediately before the latest point
      - latest_vs_trailing_mean:    (latest - trailing_mean) / trailing_mean
                                    smoothed comparison; resilient to
                                    weekend / holiday spikes
      - trend_slope:                ordinary least-squares slope over
                                    series[-trailing_window:]; sign
                                    indicates direction, magnitude is in
                                    metric-units / step
      - stdev_deviation:            (latest - trailing_mean) / trailing_std
                                    z-score-style deviation; |val| > 2 is
                                    typical "outlier" cutoff
      - current_total:              sum across the entire returned series
                                    (kept for schema parity with with_offset)

    Returns: {metric_name: {
        current_total, latest_value, latest_ts,
        trailing_mean, latest_vs_trailing_mean,
        trend_slope, stdev_deviation, series
    }}

    Returns {} if there's no usable time column or no rows.
    """
    qr = chart.get("query_result", {})
    data = materialize_rows(qr)
    colnames = qr.get("colnames", [])
    config = chart.get("config", {})
    metrics = config.get("metrics", [])
    granularity = config.get("granularity")

    if not data or not metrics:
        return {}

    time_col = find_time_column(colnames, granularity)
    if not time_col:
        # No time column → can't build a series. Caller should fall back to
        # treating this as a single-bucket chart (groupby breakdown only).
        return {}

    result = {}
    for metric_name in metrics:
        # Aggregate by timestamp (multiple rows per ts when groupby is set).
        by_ts = {}
        total = 0.0
        for row in data:
            try:
                v = float(row.get(metric_name) or 0)
            except (ValueError, TypeError):
                v = 0.0
            ts = str(row.get(time_col, ""))
            if not ts:
                continue
            by_ts[ts] = by_ts.get(ts, 0.0) + v
            total += v

        series = sorted(by_ts.items(), key=lambda x: x[0])
        if len(series) < 2:
            # Not enough points to derive any change signal.
            result[metric_name] = {
                "current_total": round(total, 4),
                "latest_value": round(series[-1][1], 4) if series else 0.0,
                "latest_ts": series[-1][0] if series else None,
                "trailing_mean": None,
                "latest_vs_trailing_mean": None,
                "trend_slope": None,
                "stdev_deviation": None,
                "series": series,
            }
            continue

        latest_ts, latest_val = series[-1]
        # Trailing window: up to `trailing_window` points immediately BEFORE
        # the latest point. Excludes latest itself so it's a true comparison.
        trailing = [v for _, v in series[-(trailing_window + 1):-1]]
        if not trailing:
            trailing = [series[-2][1]]  # at minimum, the previous point

        t_mean = mean(trailing)

        # Population stdev (avoid stdev() requiring n>=2 by inlining)
        if len(trailing) >= 2:
            variance = sum((x - t_mean) ** 2 for x in trailing) / len(trailing)
            t_std = variance ** 0.5
        else:
            t_std = 0.0

        latest_vs_mean = ((latest_val - t_mean) / t_mean) if t_mean != 0 else (
            9999.0 if latest_val != 0 else 0.0
        )
        stdev_dev = ((latest_val - t_mean) / t_std) if t_std > 0 else None

        # Linear regression over the trailing window + latest point.
        # x = 0..n-1, y = values. slope = sum((x-x_mean)(y-y_mean)) / sum((x-x_mean)^2)
        recent = [v for _, v in series[-(trailing_window + 1):]]
        n = len(recent)
        if n >= 2:
            x_mean = (n - 1) / 2.0
            y_mean = sum(recent) / n
            num = sum((i - x_mean) * (recent[i] - y_mean) for i in range(n))
            den = sum((i - x_mean) ** 2 for i in range(n))
            slope = (num / den) if den > 0 else 0.0
        else:
            slope = 0.0

        result[metric_name] = {
            "current_total": round(total, 4),
            "latest_value": round(latest_val, 4),
            "latest_ts": latest_ts,
            "trailing_mean": round(t_mean, 4),
            "latest_vs_trailing_mean": round(latest_vs_mean, 4),
            "trend_slope": round(slope, 4),
            "stdev_deviation": round(stdev_dev, 4) if stdev_dev is not None else None,
            "series": series,
        }

    return result


# ── Anomaly detection ───────────────────────────────────────────────


def calc_change_rate(current, previous):
    if previous == 0:
        return 9999.0 if current != 0 else 0.0
    return (current - previous) / abs(previous)


def detect_changes(cache, time_offset):
    """Compute change rates for all metrics across all charts.

    Returns list of chart-level dicts sorted by change magnitude.
    No fixed threshold — the AI judges significance.

    Two routing modes per chart, decided by chart["time_mode"] (set by
    fetch_dashboard.mjs):

      "with_offset" — chart had a time filter, so the cache contains paired
                      current/previous columns. Compute classic WoW.
      "no_filter"   — chart had no time filter, cache has the full series.
                      Compute latest-vs-trailing-mean + trend slope +
                      stdev deviation in-process.

    Output schema is unified: every metric carries current_total +
    previous_total + change_rate + abs_change + direction. For no_filter
    metrics, previous_total / change_rate / abs_change are None and the
    no-filter signals are added under latest_value, trailing_mean,
    latest_vs_trailing_mean, trend_slope, stdev_deviation. Sorting falls
    back to abs(latest_vs_trailing_mean) when change_rate is None.
    """
    charts = cache.get("charts", {})
    results = []

    for chart_id_str, chart in charts.items():
        if chart.get("error"):
            continue

        chart_id = str(chart.get("chart_id", chart_id_str))
        chart_name = chart.get("chart_name", f"Chart {chart_id}")
        datasource_id = chart.get("datasource_id")
        # Default to with_offset for caches predating the time_mode field —
        # they were always fetched with offsets so the legacy behavior is
        # the right backstop.
        time_mode = chart.get("time_mode", "with_offset")

        metric_results = {}

        if time_mode == "no_filter":
            series_map = extract_chart_series_no_filter(chart)
            if not series_map:
                continue
            for m, s in series_map.items():
                rate = s.get("latest_vs_trailing_mean")
                if rate is None:
                    direction = "flat"
                elif rate > 0:
                    direction = "up"
                elif rate < 0:
                    direction = "down"
                else:
                    direction = "flat"
                metric_results[m] = {
                    # Unified schema fields
                    "current_total": round(s["current_total"], 4),
                    "previous_total": None,
                    "change_rate": None,
                    "abs_change": None,
                    "direction": direction,
                    # No-filter-specific fields
                    "latest_value": s["latest_value"],
                    "latest_ts": s["latest_ts"],
                    "trailing_mean": s["trailing_mean"],
                    "latest_vs_trailing_mean": s["latest_vs_trailing_mean"],
                    "trend_slope": s["trend_slope"],
                    "stdev_deviation": s["stdev_deviation"],
                }
        else:
            series = extract_chart_series(chart, time_offset)
            if not series:
                continue
            for m, s in series.items():
                ct, pt = s["current_total"], s["previous_total"]
                rate = calc_change_rate(ct, pt)
                direction = "up" if rate > 0 else ("down" if rate < 0 else "flat")
                metric_results[m] = {
                    "current_total": round(ct, 4),
                    "previous_total": round(pt, 4),
                    "change_rate": round(rate, 4),
                    "abs_change": round(ct - pt, 4),
                    "direction": direction,
                }

        results.append({
            "chart_id": chart_id,
            "chart_name": chart_name,
            "datasource_id": datasource_id,
            "is_time_series": chart.get("is_time_series", False),
            "time_mode": time_mode,
            "metrics": metric_results,
            "groupby_breakdown": extract_groupby_breakdown(chart, time_offset) if time_mode == "with_offset" else {},
        })

    def _sort_magnitude(r):
        """Sort key: max absolute change signal across this chart's metrics.
        Uses change_rate for with_offset metrics, latest_vs_trailing_mean
        for no_filter metrics. Falls back to 0 if neither is present.
        """
        best = 0.0
        for v in r["metrics"].values():
            cr = v.get("change_rate")
            if cr is not None:
                best = max(best, abs(cr))
                continue
            lvm = v.get("latest_vs_trailing_mean")
            if lvm is not None:
                best = max(best, abs(lvm))
        return best

    results.sort(key=_sort_magnitude, reverse=True)
    return results


# ── Cross-chart correlation ─────────────────────────────────────────


def _get_grain_seconds(time_grain):
    """Convert time_grain string to seconds. Returns None if unknown."""
    if not time_grain:
        return None
    return GRAIN_SECONDS.get(time_grain)


def compute_cross_correlation(cache, changes, time_offset):
    """Compute Pearson correlation between metrics sharing the same dataset.

    For datasets with 2+ charts, extract all metric time series, align them,
    and compute pairwise correlations. Mark co-moving anomalous pairs.
    """
    charts = cache.get("charts", {})
    datasets = cache.get("datasets", {})

    # Group charts by datasource_id
    ds_charts = {}
    for chart_id_str, chart in charts.items():
        if chart.get("error"):
            continue
        ds_id = chart.get("datasource_id")
        if ds_id is not None:
            ds_charts.setdefault(ds_id, []).append(chart)

    # Build metric lookup: "chart_id.metric" -> change info (all metrics, no threshold filter).
    # For no_filter charts change_rate is None — fall back to latest_vs_trailing_mean
    # so the lookup still has a comparable signal for downstream sorting / co-movement.
    metric_lookup = {}
    for a in changes:
        for m, info in a.get("metrics", {}).items():
            key = f"{a['chart_id']}.{m}"
            rate = info.get("change_rate")
            if rate is None:
                rate = info.get("latest_vs_trailing_mean")
            metric_lookup[key] = {
                "chart_id": a["chart_id"],
                "chart_name": a.get("chart_name", ""),
                "metric": m,
                "change_rate": rate,
                "direction": info["direction"],
            }

    results = []

    for ds_id, ds_chart_list in ds_charts.items():
        if len(ds_chart_list) < 2:
            continue

        ds_name = datasets.get(str(ds_id), {}).get("name", f"dataset_{ds_id}")

        # Extract all metric time series for this dataset
        metric_series = {}  # "chart_id.metric" -> [(ts, val)]
        metric_grains = {}  # "chart_id.metric" -> grain_seconds

        for chart in ds_chart_list:
            cid = str(chart.get("chart_id"))
            time_grain = chart.get("config", {}).get("time_grain")
            grain_sec = _get_grain_seconds(time_grain)

            series = extract_chart_series(chart, time_offset)
            for m, s in series.items():
                if not s["current"]:
                    continue
                key = f"{cid}.{m}"
                metric_series[key] = s["current"]
                if grain_sec:
                    metric_grains[key] = grain_sec

        keys = list(metric_series.keys())
        if len(keys) < 2:
            continue

        # Pairwise correlation
        correlations = []
        for i in range(len(keys)):
            for j in range(i + 1, len(keys)):
                ka, kb = keys[i], keys[j]
                sa, sb = metric_series[ka], metric_series[kb]

                # Resample if different grains
                ga = metric_grains.get(ka)
                gb = metric_grains.get(kb)
                if ga and gb and ga != gb:
                    target = max(ga, gb)
                    if ga < target:
                        sa = resample_time_series(sa, target)
                    if gb < target:
                        sb = resample_time_series(sb, target)

                result = align_and_correlate(sa, sb, min_points=5)
                if not result["aligned"]:
                    continue

                r_val = result["pearson_r"]
                abs_r = abs(r_val)
                strength = "strong" if abs_r >= 0.7 else "moderate" if abs_r >= 0.4 else "weak"

                correlations.append({
                    "metric_a_key": ka,
                    "metric_b_key": kb,
                    "metric_a": ka.split(".", 1)[1] if "." in ka else ka,
                    "metric_b": kb.split(".", 1)[1] if "." in kb else kb,
                    "chart_a": ka.split(".")[0],
                    "chart_b": kb.split(".")[0],
                    "pearson_r": r_val,
                    "n_points": result["n_points"],
                    "strength": strength,
                })

        # Detect co-movement groups among correlated metrics
        flat_metrics = [metric_lookup[k] for k in keys if k in metric_lookup]
        co_groups = detect_co_movement(flat_metrics, correlations, r_threshold=0.7)

        results.append({
            "datasource_id": ds_id,
            "dataset_name": ds_name,
            "correlations": correlations,
            "co_movement_groups": [
                [{"chart_id": a["chart_id"], "metric": a["metric"],
                  "direction": a["direction"], "change_rate": a["change_rate"]}
                 for a in group]
                for group in co_groups
            ],
        })

    return results


# ── Phase 2: Analyze ────────────────────────────────────────────────


def phase_analyze(cache):
    time_offset = cache.get("time_offset", "1 week ago")
    changes = detect_changes(cache, time_offset)
    correlations = compute_cross_correlation(cache, changes, time_offset)

    co_movement_count = sum(len(c["co_movement_groups"]) for c in correlations)

    return {
        "dashboard_id": cache.get("dashboard_id"),
        "time_offset": time_offset,
        "charts": changes,
        "correlations": correlations,
        "co_movement_groups_count": co_movement_count,
    }


# ── Phase 3a: Drill plan ───────────────────────────────────────────


def phase_drill_plan(cache, analysis, drill_columns, target_metrics=None):
    """Generate drill query plan for JS to execute.

    Groups queries by datasource. Each query drills one metric × one dimension.
    If target_metrics is provided, only drill those metrics. Otherwise drill all.
    """
    time_offset = cache.get("time_offset", "1 week ago")
    charts = cache.get("charts", {})

    # Collect metrics to drill.
    #
    # Skip no_filter charts: drill is conceptually "explain why metric M
    # changed in current vs previous period" — a comparison the no_filter
    # mode never produced (no time_offsets sent on fetch). For those charts,
    # the analyze-phase output already carries trailing-mean / trend signals;
    # explicit dimensional drill-down should be requested separately if needed.
    skipped_no_filter = []
    to_drill = []
    for a in analysis.get("charts", []):
        if a.get("time_mode") == "no_filter":
            skipped_no_filter.append({"chart_id": a["chart_id"], "chart_name": a.get("chart_name", "")})
            continue
        for m, info in a.get("metrics", {}).items():
            if target_metrics and m not in target_metrics:
                continue
            to_drill.append({
                "chart_id": a["chart_id"],
                "datasource_id": a["datasource_id"],
                "metric": m,
            })

    if skipped_no_filter:
        names = ", ".join(f"{c['chart_name']} (id={c['chart_id']})" for c in skipped_no_filter[:5])
        more = "" if len(skipped_no_filter) <= 5 else f" (+{len(skipped_no_filter) - 5} more)"
        print(
            f"[drill-plan] Skipping {len(skipped_no_filter)} no_filter chart(s): {names}{more}",
            file=sys.stderr,
        )

    # Group by datasource
    by_ds = {}
    for item in to_drill:
        ds_id = item["datasource_id"]
        by_ds.setdefault(ds_id, []).append(item)

    plan = []
    for ds_id, items in by_ds.items():
        # Find chart config for building queries
        queries = []
        query_meta = []

        for item in items:
            chart_id = item["chart_id"]
            # JSON keys are always strings; chart_id may be int from anomaly detection
            chart = charts.get(str(chart_id), charts.get(chart_id, {}))
            config = chart.get("config", {})

            # Find the raw metric object
            raw_metrics = config.get("raw_metrics", [])
            metric_name = item["metric"]
            raw_metric = None
            for rm in raw_metrics:
                if isinstance(rm, str) and rm == metric_name:
                    raw_metric = metric_name
                    break
                elif isinstance(rm, dict) and rm.get("label") == metric_name:
                    raw_metric = rm
                    break
            if raw_metric is None:
                raw_metric = metric_name

            # Build one query per drill column
            filters, extra_where = _build_filters_from_config(config)
            for col in drill_columns:
                queries.append({
                    "columns": [col],
                    "metrics": [raw_metric],
                    "filters": list(filters),  # copy to avoid shared mutation
                    "granularity": config.get("granularity"),
                    "time_range": config.get("time_range", "No filter"),
                    "time_offsets": [time_offset],
                    "row_limit": 100,
                    "order_desc": True,
                    "extras": {
                        "time_grain_sqla": config.get("time_grain"),
                        **({"where": extra_where} if extra_where else {}),
                    },
                })
                query_meta.append({
                    "chart_id": chart_id,
                    "metric": metric_name,
                    "drill_column": col,
                })

        ds_type = "table"
        # Try to get datasource_type from any chart
        for item in items:
            cid = item["chart_id"]
            chart = charts.get(str(cid), charts.get(cid, {}))
            if chart.get("datasource_type"):
                ds_type = chart["datasource_type"]
                break

        plan.append({
            "datasource_id": ds_id,
            "datasource_type": ds_type,
            "queries": queries,
            "query_meta": query_meta,
        })

    return plan


def _build_filters_from_config(config):
    """Reconstruct API filters from chart config."""
    filters = []
    adhoc = config.get("adhoc_filters", [])
    extra_where_parts = []

    for af in adhoc:
        clause = (af.get("clause") or "").upper()
        if clause != "WHERE":
            continue
        if af.get("expressionType") == "SIMPLE" and af.get("subject"):
            filters.append({
                "col": af["subject"],
                "op": af.get("operator", "=="),
                "val": af.get("comparator"),
            })
        elif af.get("expressionType") == "SQL" and af.get("sqlExpression"):
            extra_where_parts.append(af["sqlExpression"])

    granularity = config.get("granularity")
    time_range = config.get("time_range", "No filter")
    if granularity and time_range != "No filter":
        filters.append({"col": granularity, "op": "TEMPORAL_RANGE", "val": time_range})

    # Attach extra_where for SQL expressions (consumed by query.extras.where)
    extra_where = f"({') AND ('.join(extra_where_parts)})" if extra_where_parts else ""
    return filters, extra_where


# ── Phase 3b: Drill analysis ───────────────────────────────────────


def phase_drill(analysis, drill_data):
    """Analyze drill results to find common root causes across co-moving metrics."""
    time_offset = analysis.get("time_offset", "1 week ago")
    co_groups = []
    for corr in analysis.get("correlations", []):
        for g in corr.get("co_movement_groups", []):
            co_groups.append({
                "datasource_id": corr["datasource_id"],
                "dataset_name": corr["dataset_name"],
                "metrics": g,
            })

    # Build drill result lookup: (chart_id, metric, drill_column) -> top values
    drill_lookup = {}
    for ds_group in drill_data:
        for item in ds_group.get("results", []):
            meta = item.get("meta", {})
            key = (meta.get("chart_id"), meta.get("metric"), meta.get("drill_column"))
            if item.get("status") != "ok":
                continue

            rows = materialize_rows(item)
            metric_name = meta.get("metric", "")
            compare_col = f"{metric_name}__{time_offset}"
            drill_col = meta.get("drill_column", "")

            top_values = []
            for row in rows:
                try:
                    c = float(row.get(metric_name, 0) or 0)
                except (ValueError, TypeError):
                    c = 0.0
                try:
                    p = float(row.get(compare_col, 0) or 0)
                except (ValueError, TypeError):
                    p = 0.0
                abs_change = c - p
                rate = calc_change_rate(c, p)
                top_values.append({
                    "dimension_value": str(row.get(drill_col, "N/A")),
                    "current": round(c, 4),
                    "previous": round(p, 4),
                    "abs_change": round(abs_change, 4),
                    "change_rate": round(rate, 4),
                })

            top_values.sort(key=lambda x: abs(x["abs_change"]), reverse=True)
            drill_lookup[key] = top_values[:10]

    # Find common contributors across co-moving metric groups
    cross_results = []
    for group in co_groups:
        group_metrics = group["metrics"]
        # Get all drill columns available for this group
        drill_cols = set()
        for gm in group_metrics:
            for key in drill_lookup:
                if key[0] == gm["chart_id"] and key[1] == gm["metric"]:
                    drill_cols.add(key[2])

        for drill_col in drill_cols:
            # For each dimension value, check how many metrics it appears in as top contributor
            dim_appearances = {}  # dim_value -> list of {metric, rank, abs_change}
            per_metric_top = {}

            for gm in group_metrics:
                key = (gm["chart_id"], gm["metric"], drill_col)
                top = drill_lookup.get(key, [])
                per_metric_top[f"{gm['chart_id']}.{gm['metric']}"] = top

                for rank, tv in enumerate(top):
                    dv = tv["dimension_value"]
                    dim_appearances.setdefault(dv, []).append({
                        "chart_id": gm["chart_id"],
                        "metric": gm["metric"],
                        "rank": rank + 1,
                        "abs_change": tv["abs_change"],
                        "change_rate": tv["change_rate"],
                    })

            # Filter to dimension values appearing in 2+ metrics
            common = []
            for dv, appearances in dim_appearances.items():
                if len(appearances) >= 2:
                    common.append({
                        "dimension_value": dv,
                        "appears_in_n_metrics": len(appearances),
                        "metrics": appearances,
                    })
            common.sort(key=lambda x: x["appears_in_n_metrics"], reverse=True)

            cross_results.append({
                "datasource_id": group["datasource_id"],
                "dataset_name": group["dataset_name"],
                "dimension": drill_col,
                "co_moving_metrics": [
                    {"chart_id": gm["chart_id"], "metric": gm["metric"]}
                    for gm in group_metrics
                ],
                "common_contributors": common,
                "per_metric_top10": per_metric_top,
            })

    # Also include per-metric drill results for isolated anomalies
    isolated = []
    co_metric_keys = set()
    for group in co_groups:
        for gm in group["metrics"]:
            co_metric_keys.add((gm["chart_id"], gm["metric"]))

    for key, top in drill_lookup.items():
        chart_id, metric, drill_col = key
        if (chart_id, metric) not in co_metric_keys:
            isolated.append({
                "chart_id": chart_id,
                "metric": metric,
                "dimension": drill_col,
                "top_contributors": top,
            })

    return {
        "cross_analysis": cross_results,
        "isolated_drills": isolated,
    }


# ── Phase 4: Summary ───────────────────────────────────────────────


def phase_summary(cache, analysis, drill_results=None):
    """Merge all findings into a final report."""
    dashboard_id = cache.get("dashboard_id")
    time_offset = cache.get("time_offset", "1 week ago")

    chart_changes = analysis.get("charts", [])
    correlations = analysis.get("correlations", [])

    total_charts = len(cache.get("charts", {}))
    co_movement_count = sum(len(c["co_movement_groups"]) for c in correlations)

    # Per-dataset summaries
    per_dataset = []
    datasets = cache.get("datasets", {})
    for corr in correlations:
        ds_id = corr["datasource_id"]
        ds_name = corr["dataset_name"]

        # All metrics in this dataset (sorted by change magnitude).
        # For no_filter charts change_rate is None — fall back to
        # latest_vs_trailing_mean so they sort alongside WoW changes.
        ds_metrics = []
        for a in chart_changes:
            if a["datasource_id"] == ds_id:
                for m, info in a["metrics"].items():
                    rate = info.get("change_rate")
                    if rate is None:
                        rate = info.get("latest_vs_trailing_mean") or 0.0
                    ds_metrics.append({
                        "chart_id": a["chart_id"],
                        "chart_name": a.get("chart_name", ""),
                        "metric": m,
                        "change_rate": rate,
                        "abs_change": info.get("abs_change", 0) or 0,
                        "direction": info["direction"],
                        "time_mode": a.get("time_mode", "with_offset"),
                    })
        ds_metrics.sort(key=lambda x: abs(x["change_rate"] or 0), reverse=True)

        # Strong correlations
        strong_corr = [c for c in corr["correlations"] if abs(c["pearson_r"]) >= 0.7]

        # Common root causes from drill
        common_roots = []
        if drill_results:
            for cr in drill_results.get("cross_analysis", []):
                if cr["datasource_id"] == ds_id:
                    for cc in cr.get("common_contributors", []):
                        if cc["appears_in_n_metrics"] >= 2:
                            common_roots.append({
                                "dimension": cr["dimension"],
                                "dimension_value": cc["dimension_value"],
                                "appears_in": cc["appears_in_n_metrics"],
                            })

        # Build narrative
        narrative = _build_narrative(ds_name, ds_metrics, strong_corr, corr["co_movement_groups"], common_roots, time_offset)

        per_dataset.append({
            "datasource_id": ds_id,
            "dataset_name": ds_name,
            "metrics": ds_metrics,
            "strong_correlations": strong_corr,
            "co_movement_groups": corr["co_movement_groups"],
            "common_root_causes": common_roots,
            "narrative": narrative,
        })

    # Isolated metrics (not in any cross-correlated dataset)
    cross_ds_ids = {c["datasource_id"] for c in correlations}
    isolated = []
    for a in chart_changes:
        if a["datasource_id"] not in cross_ds_ids:
            for m, info in a["metrics"].items():
                isolated.append({
                    "chart_id": a["chart_id"],
                    "chart_name": a.get("chart_name", ""),
                    "metric": m,
                    "change_rate": info["change_rate"],
                    "direction": info["direction"],
                })

    # Action items
    action_items = _generate_action_items(per_dataset, isolated, drill_results)

    return {
        "dashboard_id": dashboard_id,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "time_offset": time_offset,
        "summary": {
            "total_charts": total_charts,
            "co_movement_groups": co_movement_count,
        },
        "per_dataset_summary": per_dataset,
        "isolated_metrics": isolated,
        "action_items": action_items,
    }


def _build_narrative(ds_name, anomalous, strong_corr, co_groups, common_roots, time_offset):
    """Build a human-readable narrative for a dataset."""
    parts = [f"Dataset '{ds_name}':"]

    if not anomalous:
        parts.append("all metrics within normal range.")
        return " ".join(parts)

    # Describe changes
    desc = []
    for a in anomalous:
        pct = f"{a['change_rate']*100:+.1f}%"
        desc.append(f"{a['metric']} ({pct})")
    parts.append(f"metric changes: {', '.join(desc)}.")

    # Describe correlations
    if co_groups:
        for g in co_groups:
            metrics_in_g = [f"{m['metric']}" for m in g]
            parts.append(f"{' and '.join(metrics_in_g)} show co-movement.")

    if strong_corr:
        for c in strong_corr[:3]:  # top 3
            parts.append(
                f"{c['metric_a']} and {c['metric_b']} strongly correlated (r={c['pearson_r']:.2f})."
            )

    # Describe root causes
    if common_roots:
        for cr in common_roots[:3]:
            parts.append(
                f"Drill on '{cr['dimension']}' found '{cr['dimension_value']}' as common contributor "
                f"across {cr['appears_in']} metrics."
            )

    return " ".join(parts)


def _generate_action_items(per_dataset, isolated, drill_results):
    """Generate actionable recommendations."""
    items = []

    for ds in per_dataset:
        if ds["co_movement_groups"]:
            for g in ds["co_movement_groups"]:
                metrics = [m["metric"] for m in g]
                items.append(
                    f"Investigate co-moving metrics [{', '.join(metrics)}] in dataset '{ds['dataset_name']}' — likely share a common root cause."
                )
        if ds["common_root_causes"]:
            for cr in ds["common_root_causes"][:2]:
                items.append(
                    f"Check dimension '{cr['dimension']}' value '{cr['dimension_value']}' — it contributes to changes in {cr['appears_in']} metrics."
                )

    for iso in isolated:
        pct = f"{iso['change_rate']*100:+.1f}%"
        items.append(
            f"Review isolated anomaly: {iso['metric']} ({pct}) in chart '{iso['chart_name']}'."
        )

    if not items:
        items.append("No anomalies detected. Dashboard metrics are within normal range.")

    return items


# ── Formatters ──────────────────────────────────────────────────────


def fmt_pct(rate):
    if rate is None:
        return "N/A"
    if abs(rate) >= 9999:
        return "N/A (new)"
    return f"{rate*100:+.2f}%"


def fmt_num(n):
    if n is None:
        return "N/A"
    if isinstance(n, float) and abs(n) >= 1000:
        return f"{n:,.0f}"
    if isinstance(n, float):
        return f"{n:.2f}"
    return str(n)


def format_analyze(result):
    lines = []
    lines.append(f"## Dashboard {result['dashboard_id']} Analysis")
    lines.append("")
    # Only mention the comparison offset when at least one chart actually
    # used with_offset mode — otherwise the line is misleading on dashboards
    # that are 100% no_filter charts.
    has_with_offset = any(
        c.get("time_mode", "with_offset") == "with_offset" for c in result["charts"]
    )
    has_no_filter = any(
        c.get("time_mode") == "no_filter" for c in result["charts"]
    )
    if has_with_offset:
        lines.append(f"- Comparison: current vs `{result['time_offset']}` (with_offset charts)")
    if has_no_filter:
        lines.append("- Full-series mode: latest vs trailing-7-mean (no_filter charts)")
    lines.append(f"- Co-movement groups: {result['co_movement_groups_count']}")
    lines.append("")

    # Per-chart metrics table (sorted by change magnitude)
    lines.append("### Per-Chart Metrics")
    lines.append("")
    for a in result["charts"]:
        time_mode = a.get("time_mode", "with_offset")
        mode_tag = " — no time filter (full series)" if time_mode == "no_filter" else ""
        lines.append(f"#### {a['chart_name']} (ID: {a['chart_id']}, DS: {a['datasource_id']}){mode_tag}")
        lines.append("")

        if time_mode == "no_filter":
            # Different signal columns: latest vs trailing mean + slope + σ-deviation.
            # No "previous period" exists for these charts.
            lines.append("| Metric | Latest | Trailing Mean | Latest vs Trailing | Trend Slope | σ Deviation |")
            lines.append("|--------|--------|---------------|--------------------|-------------|-------------|")
            for m, info in a["metrics"].items():
                lines.append(
                    f"| {m} | {fmt_num(info.get('latest_value'))} "
                    f"| {fmt_num(info.get('trailing_mean'))} "
                    f"| {fmt_pct(info.get('latest_vs_trailing_mean'))} "
                    f"| {fmt_num(info.get('trend_slope'))} "
                    f"| {fmt_num(info.get('stdev_deviation'))} |"
                )
            lines.append("")

            # Narrative for no-filter charts
            summary_parts = []
            for m, info in a["metrics"].items():
                rate = info.get("latest_vs_trailing_mean")
                latest = info.get("latest_value")
                tmean = info.get("trailing_mean")
                z = info.get("stdev_deviation")
                if rate is None:
                    summary_parts.append(f"**{m}** insufficient history.")
                    continue
                direction = "up" if rate > 0 else ("down" if rate < 0 else "flat")
                severity = "significantly" if abs(rate) >= 0.2 else "slightly" if abs(rate) >= 0.05 else "marginally"
                z_note = f" (σ={z:+.2f})" if z is not None else ""
                summary_parts.append(
                    f"**{m}** latest {direction} {severity} {fmt_pct(rate)} "
                    f"vs trailing mean ({fmt_num(tmean)} → {fmt_num(latest)}){z_note}."
                )
            if summary_parts:
                lines.append("> " + " ".join(summary_parts))
                lines.append("")
        else:
            lines.append("| Metric | Current | Previous | Change | Abs Change |")
            lines.append("|--------|---------|----------|--------|------------|")
            for m, info in a["metrics"].items():
                lines.append(
                    f"| {m} | {fmt_num(info['current_total'])} | {fmt_num(info['previous_total'])} "
                    f"| {fmt_pct(info['change_rate'])} | {fmt_num(info.get('abs_change', 0))} |"
                )
            lines.append("")

            # Per-chart narrative summary
            summary_parts = []
            for m, info in a["metrics"].items():
                rate = info["change_rate"]
                cur = info["current_total"]
                prev = info["previous_total"]
                if abs(rate) >= 9999:
                    summary_parts.append(f"**{m}** is new this period ({fmt_num(cur)}, no prior data).")
                else:
                    direction = "up" if rate > 0 else "down"
                    severity = "significantly" if abs(rate) >= 0.2 else "slightly" if abs(rate) >= 0.05 else "marginally"
                    summary_parts.append(
                        f"**{m}** {direction} {severity} {fmt_pct(rate)} "
                        f"({fmt_num(prev)} → {fmt_num(cur)})."
                    )
            if summary_parts:
                lines.append("> " + " ".join(summary_parts))
                lines.append("")

        # Groupby dimension breakdown (for charts like "daily hit of each model")
        breakdown = a.get("groupby_breakdown", {})
        for metric_name, rows in breakdown.items():
            if not rows:
                continue
            dim_col = rows[0]["dimension"] if rows else "dimension"
            lines.append(f"**Breakdown by `{dim_col}`** ({metric_name}):")
            lines.append("")
            lines.append(f"| {dim_col} | Current | Previous | Change |")
            lines.append(f"|{'---'*3}|---------|----------|--------|")
            for row in rows[:15]:  # top 15 by abs change
                lines.append(
                    f"| {row['value']} | {fmt_num(row['current'])} | {fmt_num(row['previous'])} | {fmt_pct(row['change_rate'])} |"
                )
            lines.append("")

    # Correlation summary
    if result["correlations"]:
        lines.append("### Cross-Chart Correlations")
        lines.append("")
        for corr in result["correlations"]:
            lines.append(f"**Dataset: {corr['dataset_name']}** (ID: {corr['datasource_id']})")
            lines.append("")
            strong = [c for c in corr["correlations"] if abs(c["pearson_r"]) >= 0.4]
            if strong:
                lines.append("| Metric A | Metric B | Pearson r | Strength |")
                lines.append("|----------|----------|-----------|----------|")
                for c in strong:
                    lines.append(
                        f"| {c['metric_a']} (chart {c['chart_a']}) "
                        f"| {c['metric_b']} (chart {c['chart_b']}) "
                        f"| {c['pearson_r']:.4f} | {c['strength']} |"
                    )
                lines.append("")

            if corr["co_movement_groups"]:
                lines.append("**Co-movement groups:**")
                for i, g in enumerate(corr["co_movement_groups"], 1):
                    members = ", ".join(f"{m['metric']} ({fmt_pct(m['change_rate'])})" for m in g)
                    lines.append(f"  {i}. {members}")
                lines.append("")

    return "\n".join(lines)


def format_drill(result):
    lines = []
    lines.append("## Drill-down Analysis")
    lines.append("")

    if result.get("cross_analysis"):
        lines.append("### Cross-Analysis (Co-moving Metrics)")
        lines.append("")
        for cr in result["cross_analysis"]:
            metrics_desc = ", ".join(
                f"{m['metric']} (chart {m['chart_id']})" for m in cr["co_moving_metrics"]
            )
            lines.append(f"**{cr['dataset_name']}** — Dimension: `{cr['dimension']}`")
            lines.append(f"Co-moving metrics: {metrics_desc}")
            lines.append("")

            if cr["common_contributors"]:
                lines.append("**Common Contributors:**")
                lines.append("")
                lines.append("| Dimension Value | Appears In | Details |")
                lines.append("|-----------------|-----------|---------|")
                for cc in cr["common_contributors"]:
                    details = "; ".join(
                        f"{m['metric']}(rank #{m['rank']}, {fmt_pct(m['change_rate'])})"
                        for m in cc["metrics"]
                    )
                    lines.append(
                        f"| {cc['dimension_value']} | {cc['appears_in_n_metrics']} metrics | {details} |"
                    )
                lines.append("")
            else:
                lines.append("No common contributors found across metrics.")
                lines.append("")

    if result.get("isolated_drills"):
        lines.append("### Isolated Metric Drills")
        lines.append("")
        for iso in result["isolated_drills"]:
            lines.append(f"**{iso['metric']}** (chart {iso['chart_id']}) — Dimension: `{iso['dimension']}`")
            lines.append("")
            lines.append("| Value | Current | Previous | Change | Rate |")
            lines.append("|-------|---------|----------|--------|------|")
            for tv in iso["top_contributors"]:
                lines.append(
                    f"| {tv['dimension_value']} | {fmt_num(tv['current'])} "
                    f"| {fmt_num(tv['previous'])} | {fmt_num(tv['abs_change'])} "
                    f"| {fmt_pct(tv['change_rate'])} |"
                )
            lines.append("")

    return "\n".join(lines)


def format_summary(result):
    lines = []
    s = result["summary"]
    lines.append(f"## Dashboard {result['dashboard_id']} — Summary Report")
    lines.append("")
    lines.append(f"- Comparison: current vs `{result['time_offset']}`")
    lines.append(f"- Total charts: {s['total_charts']}")
    lines.append(f"- Co-movement groups: {s['co_movement_groups']}")
    lines.append("")

    if result["per_dataset_summary"]:
        lines.append("### Per-Dataset Findings")
        lines.append("")
        for ds in result["per_dataset_summary"]:
            lines.append(f"#### {ds['dataset_name']} (ID: {ds['datasource_id']})")
            lines.append("")
            lines.append(ds["narrative"])
            lines.append("")

    if result["isolated_metrics"]:
        lines.append("### Isolated Metrics")
        lines.append("")
        lines.append("| Chart | Metric | Change |")
        lines.append("|-------|--------|--------|")
        for iso in result["isolated_metrics"]:
            lines.append(f"| {iso['chart_name']} | {iso['metric']} | {fmt_pct(iso['change_rate'])} |")
        lines.append("")

    if result["action_items"]:
        lines.append("### Recommended Actions")
        lines.append("")
        for i, item in enumerate(result["action_items"], 1):
            lines.append(f"{i}. {item}")
        lines.append("")

    return "\n".join(lines)


# ── CLI ─────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="Dashboard cross-analysis engine")
    parser.add_argument("--input", help="Path to fetch_dashboard.mjs cache JSON")
    parser.add_argument(
        "--phase", required=True,
        choices=["analyze", "drill-plan", "drill", "summary"],
        help="Analysis phase to run",
    )
    parser.add_argument("--analysis-file", help="Path to Phase 2 analysis JSON")
    parser.add_argument("--metrics", help="Comma-separated metric names to drill (for drill-plan)")
    parser.add_argument("--drill-data", help="Path to drill execution results JSON")
    parser.add_argument("--drill-file", help="Path to drill analysis results JSON (for summary)")
    parser.add_argument("--columns", help="Comma-separated drill columns")
    parser.add_argument("--json", action="store_true", dest="as_json", help="Output raw JSON")
    args = parser.parse_args()

    def load_json(path, label, required_keys=None):
        """Load and validate a JSON file."""
        if not os.path.isfile(path):
            print(f"Error: {label} not found: {path}", file=sys.stderr)
            sys.exit(1)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error: {label} is not valid JSON: {e}", file=sys.stderr)
            sys.exit(1)
        if required_keys:
            missing = [k for k in required_keys if k not in data]
            if missing:
                print(f"Error: {label} missing required keys: {', '.join(missing)}", file=sys.stderr)
                sys.exit(1)
        return data

    phase = args.phase

    if phase == "analyze":
        if not args.input:
            print("Error: --phase analyze requires --input <cache.json>", file=sys.stderr)
            sys.exit(1)
        cache = load_json(args.input, "cache file", required_keys=["charts", "time_offset"])
        result = phase_analyze(cache)
        if args.as_json:
            print(json.dumps(result, ensure_ascii=False))
        else:
            print(format_analyze(result))

    elif phase == "drill-plan":
        if not args.input or not args.analysis_file or not args.columns:
            print("Error: --phase drill-plan requires --input, --analysis-file, --columns", file=sys.stderr)
            sys.exit(1)
        cache = load_json(args.input, "cache file", required_keys=["charts"])
        analysis = load_json(args.analysis_file, "analysis file", required_keys=["charts", "time_offset"])
        columns = [c.strip() for c in args.columns.split(",") if c.strip()]
        target_metrics = [m.strip() for m in args.metrics.split(",") if m.strip()] if args.metrics else None
        result = phase_drill_plan(cache, analysis, columns, target_metrics)
        print(json.dumps(result, ensure_ascii=False))

    elif phase == "drill":
        if not args.analysis_file or not args.drill_data:
            print("Error: --phase drill requires --analysis-file and --drill-data", file=sys.stderr)
            sys.exit(1)
        analysis = load_json(args.analysis_file, "analysis file", required_keys=["time_offset"])
        drill_data = load_json(args.drill_data, "drill data file")
        result = phase_drill(analysis, drill_data)
        if args.as_json:
            print(json.dumps(result, ensure_ascii=False))
        else:
            print(format_drill(result))

    elif phase == "summary":
        if not args.input or not args.analysis_file:
            print("Error: --phase summary requires --input and --analysis-file", file=sys.stderr)
            sys.exit(1)
        cache = load_json(args.input, "cache file", required_keys=["charts"])
        analysis = load_json(args.analysis_file, "analysis file", required_keys=["charts"])
        drill_results = None
        if args.drill_file:
            drill_results = load_json(args.drill_file, "drill results file")
        result = phase_summary(cache, analysis, drill_results)
        if args.as_json:
            print(json.dumps(result, ensure_ascii=False))
        else:
            print(format_summary(result))


if __name__ == "__main__":
    main()
