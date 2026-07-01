#!/usr/bin/env python3
"""General-purpose statistical analysis for Superset chart/dashboard JSON output.

Reads Phase 1 analysis JSON (from analyze_chart.mjs or dashboard_analysis.py)
and performs on-demand statistical operations. Only use when the user explicitly
requests a specific statistical method.

Only uses Python standard library — no numpy/scipy required.
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from statistics import mean, median, stdev, variance, quantiles


# ── Input parsing ────────────────────────────────────────────────────


def load_input(args):
    """Load JSON from --input file or stdin."""
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return json.load(sys.stdin)


def extract_time_series(data, metric_filter=None):
    """Extract {metric: [(timestamp, value)]} from chart analysis JSON.

    Reads from `analysis.full_data_series` (complete time series) if available,
    falls back to reconstructing from `analysis.changes` (top-N subset).
    """
    if not data.get("is_time_series"):
        return {}

    analysis = data.get("analysis", {})
    metrics = metric_filter or data.get("metrics", [])

    # Prefer full_data_series (complete, not truncated)
    full_series = analysis.get("full_data_series", {})
    if full_series:
        result = {}
        for m, points in full_series.items():
            if metrics and m not in metrics:
                continue
            series = [(p.get("timestamp", ""), p.get("value", 0)) for p in points]
            if series:
                result[m] = series
        if result:
            return result

    # Fallback: reconstruct from changes array (may be incomplete)
    changes = analysis.get("changes", [])
    if not changes:
        return {}

    by_metric = {}
    for ch in changes:
        m = ch.get("metric", "")
        if metrics and m not in metrics:
            continue
        by_metric.setdefault(m, []).append(ch)

    result = {}
    for m, chs in by_metric.items():
        chs.sort(key=lambda c: c.get("timestamp", ""))
        points = {}
        for ch in chs:
            ts_prev = ch.get("prev_timestamp")
            ts_curr = ch.get("timestamp")
            if ts_prev and ts_prev not in points:
                points[ts_prev] = ch.get("prev_value", 0)
            if ts_curr:
                points[ts_curr] = ch.get("value", 0)
        series = sorted(points.items(), key=lambda x: x[0])
        if series:
            result[m] = series

    return result


def extract_static_values(data, metric_filter=None):
    """Extract numeric arrays from static chart summary."""
    summary = data.get("analysis", {}).get("summary", {})
    result = {}

    # Metric totals
    totals = summary.get("metrics_totals", {})
    for m, v in totals.items():
        if metric_filter and m not in metric_filter:
            continue
        result.setdefault(m, []).append(v)

    # Top values — primary metric
    top_values = summary.get("top_values", [])
    if top_values:
        primary = top_values[0].get("metric", "")
        if not metric_filter or primary in metric_filter:
            vals = [tv.get("value", 0) for tv in top_values]
            result[primary] = vals

    return result


def extract_dashboard_values(data, metric_filter=None):
    """Extract {metric: [values]} from dashboard analysis JSON.

    Reads from the phase_analyze output: charts[].metrics.{name: {current_total, previous_total}}.
    """
    result = {}
    for chart in data.get("charts", []):
        if chart.get("error"):
            continue
        for m, info in chart.get("metrics", {}).items():
            if metric_filter and m not in metric_filter:
                continue
            result.setdefault(m, [])
            if info.get("current_total") is not None:
                result[m].append(info["current_total"])
            if info.get("previous_total") is not None:
                result[m].append(info["previous_total"])
    return result


def detect_input_type(data):
    """Detect JSON input type: 'chart_ts', 'chart_static', or 'dashboard'."""
    if data.get("is_time_series") is True:
        return "chart_ts"
    if data.get("is_time_series") is False:
        return "chart_static"
    if "charts" in data:
        return "dashboard"
    return "unknown"


def require_time_series(input_type, operation):
    if input_type not in ("chart_ts",):
        print(
            f"Error: --operation {operation} requires time-series data "
            f"(got {input_type}). Only 'distribution' works on non-time-series.",
            file=sys.stderr,
        )
        sys.exit(1)


# ── Statistical functions ────────────────────────────────────────────


def linear_regression(values):
    """Ordinary least squares regression. x = 0,1,2,...,n-1."""
    n = len(values)
    if n < 2:
        return {"slope": 0, "intercept": values[0] if values else 0, "r_squared": 0}

    x_mean = (n - 1) / 2
    y_mean = mean(values)

    ss_xy = sum((i - x_mean) * (y - y_mean) for i, y in enumerate(values))
    ss_xx = sum((i - x_mean) ** 2 for i in range(n))
    ss_yy = sum((y - y_mean) ** 2 for y in values)

    slope = ss_xy / ss_xx if ss_xx else 0
    intercept = y_mean - slope * x_mean
    r_squared = (ss_xy ** 2) / (ss_xx * ss_yy) if ss_xx and ss_yy else 0

    return {"slope": slope, "intercept": intercept, "r_squared": r_squared}


def calc_percentiles(values):
    """Calculate key percentiles using statistics.quantiles."""
    if len(values) < 2:
        v = values[0] if values else 0
        return {"p25": v, "p50": v, "p75": v, "p90": v, "p95": v, "p99": v}

    q4 = quantiles(values, n=4)   # Q1, Q2, Q3
    q100 = quantiles(values, n=100) if len(values) >= 4 else None

    return {
        "p25": q4[0],
        "p50": q4[1],
        "p75": q4[2],
        "p90": q100[89] if q100 else q4[2],
        "p95": q100[94] if q100 else q4[2],
        "p99": q100[98] if q100 else q4[2],
    }


def calc_skewness(values):
    """Sample skewness (Fisher)."""
    n = len(values)
    if n < 3:
        return 0.0
    m = mean(values)
    s = stdev(values)
    if s == 0:
        return 0.0
    return (n / ((n - 1) * (n - 2))) * sum(((x - m) / s) ** 3 for x in values)


def calc_kurtosis(values):
    """Sample excess kurtosis (Fisher, bias-corrected)."""
    n = len(values)
    if n < 4:
        return 0.0
    m = mean(values)
    s = stdev(values)
    if s == 0:
        return 0.0
    m4 = sum(((x - m) / s) ** 4 for x in values)
    # Bias-corrected formula: matches scipy.stats.kurtosis(fisher=True, bias=False)
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * m4 - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3))


def describe_shape(skew, kurt):
    """Human-readable shape description."""
    if abs(skew) < 0.5:
        shape = "approximately symmetric"
    elif skew > 0:
        shape = "right-skewed"
    else:
        shape = "left-skewed"
    if kurt > 1:
        shape += ", heavy-tailed"
    elif kurt < -1:
        shape += ", light-tailed"
    return shape


def pearson_r(xs, ys):
    """Pearson correlation coefficient between two equal-length sequences."""
    n = len(xs)
    if n < 2:
        return 0.0
    mx, my = mean(xs), mean(ys)
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if sx == 0 or sy == 0:
        return 0.0
    return cov / (sx * sy)


def rolling_average(values, window):
    """Simple moving average with given window size."""
    if window < 1:
        window = 1
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        segment = values[start : i + 1]
        result.append(mean(segment))
    return result


# ── Cross-chart analysis helpers ─────────────────────────────────────


GRAIN_SECONDS = {
    "PT1M": 60, "PT5M": 300, "PT15M": 900, "PT30M": 1800,
    "PT1H": 3600, "P1D": 86400, "P1W": 604800,
    "P1M": 2592000, "P3M": 7776000, "P1Y": 31536000,  # approximate
}


def _parse_iso(ts_str):
    """Parse ISO 8601 timestamp string to datetime (stdlib only)."""
    s = str(ts_str).replace("Z", "+00:00")
    # Handle common formats: with/without fractional seconds, with/without tz
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f%z",
                "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f",
                "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f",
                "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    # Last resort: just use the string for sorting (won't bucket correctly)
    raise ValueError(f"Cannot parse timestamp: {ts_str}")


def resample_time_series(series, target_grain_seconds, agg="sum"):
    """Resample a time series to a coarser grain by bucketing timestamps.

    Args:
        series: list of (timestamp_str, value) sorted by time
        target_grain_seconds: bucket size in seconds (use 0 for monthly P1M)
        agg: 'sum' or 'mean'

    Returns: sorted list of (bucket_start_iso, aggregated_value)
    """
    if not series:
        return []

    buckets = {}
    for ts_str, val in series:
        try:
            dt = _parse_iso(ts_str)
        except ValueError:
            continue

        if target_grain_seconds == 0:
            # Monthly bucketing: use (year, month) as key
            bucket_key = f"{dt.year:04d}-{dt.month:02d}-01T00:00:00"
        else:
            epoch = dt.timestamp()
            bucket_start = int(epoch // target_grain_seconds) * target_grain_seconds
            bucket_key = datetime.fromtimestamp(bucket_start, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

        buckets.setdefault(bucket_key, []).append(val)

    result = []
    for bk in sorted(buckets.keys()):
        vals = buckets[bk]
        if agg == "mean":
            result.append((bk, mean(vals)))
        else:
            result.append((bk, sum(vals)))
    return result


def align_and_correlate(series_a, series_b, min_points=5):
    """Align two time series by timestamp intersection and compute Pearson r.

    Args:
        series_a: list of (timestamp_str, value)
        series_b: list of (timestamp_str, value)
        min_points: minimum overlapping points required

    Returns: {"pearson_r": float, "n_points": int, "aligned": bool}
    """
    lookup_a = dict(series_a)
    lookup_b = dict(series_b)
    common_ts = sorted(set(lookup_a.keys()) & set(lookup_b.keys()))

    if len(common_ts) < min_points:
        return {"pearson_r": 0.0, "n_points": len(common_ts), "aligned": False}

    vals_a = [lookup_a[ts] for ts in common_ts]
    vals_b = [lookup_b[ts] for ts in common_ts]

    r = pearson_r(vals_a, vals_b)
    return {"pearson_r": round(r, 4), "n_points": len(common_ts), "aligned": True}


def detect_co_movement(anomalies, correlations, r_threshold=0.7):
    """Cluster anomalous metrics that are strongly correlated using Union-Find.

    Args:
        anomalies: list of {"chart_id", "metric", "direction", "change_rate", ...}
        correlations: list of {"metric_a_key", "metric_b_key", "pearson_r", ...}
            where metric keys are "chart_id.metric_name"
        r_threshold: minimum |r| to consider as co-moving

    Returns: list of groups, each group is a list of anomaly dicts
    """
    # Build anomaly lookup by key
    anomaly_keys = set()
    anomaly_by_key = {}
    for a in anomalies:
        key = f"{a['chart_id']}.{a['metric']}"
        anomaly_keys.add(key)
        anomaly_by_key[key] = a

    # Union-Find
    parent = {k: k for k in anomaly_keys}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py

    # Union strongly correlated anomalous pairs
    for c in correlations:
        ka, kb = c.get("metric_a_key", ""), c.get("metric_b_key", "")
        if ka in anomaly_keys and kb in anomaly_keys and abs(c.get("pearson_r", 0)) >= r_threshold:
            union(ka, kb)

    # Group by root
    groups_map = {}
    for k in anomaly_keys:
        root = find(k)
        groups_map.setdefault(root, []).append(anomaly_by_key[k])

    # Only return groups with 2+ members (actual co-movement)
    return [g for g in groups_map.values() if len(g) >= 2]


# ── Operations ───────────────────────────────────────────────────────


def op_trend(data, metric_filter):
    """Linear trend analysis per metric."""
    series = extract_time_series(data, metric_filter)
    results = {}
    for m, points in series.items():
        values = [v for _, v in points]
        reg = linear_regression(values)
        slope = reg["slope"]

        if abs(slope) < 1e-10:
            direction = "stable"
        elif slope > 0:
            direction = "rising"
        else:
            direction = "falling"

        # Forecast next 3 points
        n = len(values)
        forecast = [reg["intercept"] + reg["slope"] * (n + i) for i in range(3)]

        results[m] = {
            "points": len(values),
            "slope": round(slope, 6),
            "intercept": round(reg["intercept"], 4),
            "r_squared": round(reg["r_squared"], 4),
            "direction": direction,
            "forecast_next_3": [round(f, 2) for f in forecast],
            "first_value": values[0] if values else None,
            "last_value": values[-1] if values else None,
        }
    return {"operation": "trend", "metrics": results}


def op_outlier(data, metric_filter):
    """Z-score + IQR outlier detection."""
    series = extract_time_series(data, metric_filter)
    results = {}

    for m, points in series.items():
        values = [v for _, v in points]
        timestamps = [t for t, _ in points]

        if len(values) < 3:
            results[m] = {"outliers": [], "message": "Not enough data points (need >= 3)"}
            continue

        m_val = mean(values)
        s_val = stdev(values)

        # IQR
        q = quantiles(values, n=4)
        q1, q3 = q[0], q[2]
        iqr = q3 - q1
        iqr_lower = q1 - 1.5 * iqr
        iqr_upper = q3 + 1.5 * iqr

        outliers = []
        for i, (ts, v) in enumerate(points):
            z = (v - m_val) / s_val if s_val else 0
            is_zscore = abs(z) > 2
            is_iqr = v < iqr_lower or v > iqr_upper

            if is_zscore or is_iqr:
                outliers.append({
                    "index": i,
                    "timestamp": ts,
                    "value": round(v, 4),
                    "z_score": round(z, 4),
                    "iqr_outlier": is_iqr,
                    "zscore_outlier": is_zscore,
                })

        results[m] = {
            "total_points": len(values),
            "outlier_count": len(outliers),
            "outliers": outliers,
            "confidence_interval": {
                "lower": round(m_val - 2 * s_val, 4),
                "upper": round(m_val + 2 * s_val, 4),
            },
            "iqr_bounds": {
                "lower": round(iqr_lower, 4),
                "upper": round(iqr_upper, 4),
            },
            "mean": round(m_val, 4),
            "stdev": round(s_val, 4),
        }

    return {"operation": "outlier", "metrics": results}


def op_distribution(data, metric_filter):
    """Percentiles, stdev, skewness, kurtosis."""
    input_type = detect_input_type(data)

    if input_type == "chart_ts":
        raw = extract_time_series(data, metric_filter)
        values_map = {m: [v for _, v in pts] for m, pts in raw.items()}
    elif input_type == "chart_static":
        values_map = extract_static_values(data, metric_filter)
    elif input_type == "dashboard":
        values_map = extract_dashboard_values(data, metric_filter)
    else:
        print("Error: unrecognized input format", file=sys.stderr)
        sys.exit(1)

    results = {}
    for m, values in values_map.items():
        if not values:
            results[m] = {"message": "No data"}
            continue

        n = len(values)
        sorted_vals = sorted(values)
        pcts = calc_percentiles(sorted_vals)
        skew = calc_skewness(values)
        kurt = calc_kurtosis(values)

        results[m] = {
            "count": n,
            "min": round(min(values), 4),
            "max": round(max(values), 4),
            "mean": round(mean(values), 4),
            "median": round(median(values), 4),
            "stdev": round(stdev(values), 4) if n >= 2 else 0,
            "variance": round(variance(values), 4) if n >= 2 else 0,
            "percentiles": {k: round(v, 4) for k, v in pcts.items()},
            "skewness": round(skew, 4),
            "kurtosis": round(kurt, 4),
            "shape": describe_shape(skew, kurt),
        }

    return {"operation": "distribution", "metrics": results}


def op_correlation(data, metric_filter):
    """Pearson correlation between metrics."""
    series = extract_time_series(data, metric_filter)
    metric_names = list(series.keys())

    if len(metric_names) < 2:
        return {
            "operation": "correlation",
            "message": "Need at least 2 metrics for correlation analysis",
            "available_metrics": metric_names,
        }

    # Align series by timestamp intersection
    ts_sets = [set(t for t, _ in series[m]) for m in metric_names]
    common_ts = sorted(set.intersection(*ts_sets)) if ts_sets else []

    if len(common_ts) < 3:
        return {
            "operation": "correlation",
            "message": "Not enough overlapping data points (need >= 3)",
        }

    # Build aligned value arrays
    aligned = {}
    for m in metric_names:
        lookup = dict(series[m])
        aligned[m] = [lookup[ts] for ts in common_ts]

    pairs = []
    for i in range(len(metric_names)):
        for j in range(i + 1, len(metric_names)):
            ma, mb = metric_names[i], metric_names[j]
            r = pearson_r(aligned[ma], aligned[mb])
            abs_r = abs(r)
            if abs_r >= 0.7:
                strength = "strong"
            elif abs_r >= 0.4:
                strength = "moderate"
            else:
                strength = "weak"
            pairs.append({
                "metric_a": ma,
                "metric_b": mb,
                "pearson_r": round(r, 4),
                "strength": strength,
            })

    return {
        "operation": "correlation",
        "common_points": len(common_ts),
        "pairs": pairs,
    }


def op_rolling(data, metric_filter, window):
    """Rolling average per metric."""
    series = extract_time_series(data, metric_filter)
    results = {}

    for m, points in series.items():
        values = [v for _, v in points]
        timestamps = [t for t, _ in points]
        smoothed = rolling_average(values, window)
        deviations = [round(v - s, 4) for v, s in zip(values, smoothed)]

        results[m] = {
            "window": window,
            "points": len(values),
            "series": [
                {
                    "timestamp": ts,
                    "original": round(v, 4),
                    "smoothed": round(s, 4),
                    "deviation": d,
                }
                for ts, v, s, d in zip(timestamps, values, smoothed, deviations)
            ],
        }

    return {"operation": "rolling", "window": window, "metrics": results}


# ── Formatters ───────────────────────────────────────────────────────


def fmt_num(v):
    if v is None:
        return "N/A"
    if isinstance(v, float):
        if abs(v) >= 1000:
            return f"{v:,.0f}"
        return f"{v:.4f}"
    return str(v)


def format_trend(result):
    lines = ["## Trend Analysis", ""]
    for m, r in result.get("metrics", {}).items():
        lines.append(f"### {m}")
        lines.append(f"- Points: {r['points']}")
        lines.append(f"- Direction: **{r['direction']}**")
        lines.append(f"- Slope: {fmt_num(r['slope'])} per period")
        lines.append(f"- R²: {fmt_num(r['r_squared'])}")
        lines.append(f"- Range: {fmt_num(r['first_value'])} → {fmt_num(r['last_value'])}")
        lines.append(f"- Forecast next 3: {', '.join(fmt_num(f) for f in r['forecast_next_3'])}")
        lines.append("")
    return "\n".join(lines)


def format_outlier(result):
    lines = ["## Outlier Detection", ""]
    for m, r in result.get("metrics", {}).items():
        lines.append(f"### {m}")
        if r.get("message"):
            lines.append(f"> {r['message']}")
            lines.append("")
            continue
        lines.append(f"- Total points: {r['total_points']}, Outliers: {r['outlier_count']}")
        lines.append(f"- Mean: {fmt_num(r['mean'])}, Stdev: {fmt_num(r['stdev'])}")
        ci = r["confidence_interval"]
        lines.append(f"- 95% CI: [{fmt_num(ci['lower'])}, {fmt_num(ci['upper'])}]")
        iqr = r["iqr_bounds"]
        lines.append(f"- IQR bounds: [{fmt_num(iqr['lower'])}, {fmt_num(iqr['upper'])}]")
        if r["outliers"]:
            lines.append("")
            lines.append("| # | Timestamp | Value | Z-score | IQR? |")
            lines.append("|---|-----------|-------|---------|------|")
            for i, o in enumerate(r["outliers"], 1):
                iqr_flag = "Yes" if o["iqr_outlier"] else "No"
                lines.append(f"| {i} | {o['timestamp']} | {fmt_num(o['value'])} | {fmt_num(o['z_score'])} | {iqr_flag} |")
        lines.append("")
    return "\n".join(lines)


def format_distribution(result):
    lines = ["## Distribution Statistics", ""]
    for m, r in result.get("metrics", {}).items():
        lines.append(f"### {m}")
        if r.get("message"):
            lines.append(f"> {r['message']}")
            lines.append("")
            continue
        lines.append(f"- Count: {r['count']}")
        lines.append(f"- Min: {fmt_num(r['min'])}, Max: {fmt_num(r['max'])}")
        lines.append(f"- Mean: {fmt_num(r['mean'])}, Median: {fmt_num(r['median'])}")
        lines.append(f"- Stdev: {fmt_num(r['stdev'])}, Variance: {fmt_num(r['variance'])}")
        lines.append(f"- Skewness: {fmt_num(r['skewness'])}, Kurtosis: {fmt_num(r['kurtosis'])}")
        lines.append(f"- Shape: {r['shape']}")
        p = r["percentiles"]
        lines.append(f"- Percentiles: P25={fmt_num(p['p25'])} P50={fmt_num(p['p50'])} P75={fmt_num(p['p75'])} P90={fmt_num(p['p90'])} P95={fmt_num(p['p95'])} P99={fmt_num(p['p99'])}")
        lines.append("")
    return "\n".join(lines)


def format_correlation(result):
    lines = ["## Correlation Analysis", ""]
    if result.get("message"):
        lines.append(f"> {result['message']}")
        return "\n".join(lines)
    lines.append(f"Common data points: {result['common_points']}")
    lines.append("")
    lines.append("| Metric A | Metric B | Pearson r | Strength |")
    lines.append("|----------|----------|-----------|----------|")
    for p in result.get("pairs", []):
        lines.append(f"| {p['metric_a']} | {p['metric_b']} | {fmt_num(p['pearson_r'])} | {p['strength']} |")
    lines.append("")
    return "\n".join(lines)


def format_rolling(result):
    lines = ["## Rolling Average", ""]
    lines.append(f"Window size: {result.get('window', 3)}")
    lines.append("")
    for m, r in result.get("metrics", {}).items():
        lines.append(f"### {m}")
        lines.append("")
        lines.append("| Timestamp | Original | Smoothed | Deviation |")
        lines.append("|-----------|----------|----------|-----------|")
        for s in r.get("series", []):
            lines.append(f"| {s['timestamp']} | {fmt_num(s['original'])} | {fmt_num(s['smoothed'])} | {fmt_num(s['deviation'])} |")
        lines.append("")
    return "\n".join(lines)


FORMATTERS = {
    "trend": format_trend,
    "outlier": format_outlier,
    "distribution": format_distribution,
    "correlation": format_correlation,
    "rolling": format_rolling,
}


# ── CLI ──────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Statistical analysis for Superset chart/dashboard JSON output",
    )
    parser.add_argument("--input", help="Path to analysis JSON file (reads stdin if omitted)")
    parser.add_argument(
        "--operation",
        required=True,
        choices=["trend", "outlier", "distribution", "correlation", "rolling"],
        help="Statistical operation to perform",
    )
    parser.add_argument("--metrics", help="Comma-separated metric names to analyze (default: all)")
    parser.add_argument("--window", type=int, default=3, help="Window size for rolling average (default: 3)")
    parser.add_argument("--json", action="store_true", dest="as_json", help="Output raw JSON instead of Markdown")
    args = parser.parse_args()

    data = load_input(args)
    input_type = detect_input_type(data)
    metric_filter = [m.strip() for m in args.metrics.split(",")] if args.metrics else None

    # Route to operation
    op = args.operation
    ts_only = ("trend", "outlier", "correlation", "rolling")

    if op in ts_only:
        require_time_series(input_type, op)

    if op == "trend":
        result = op_trend(data, metric_filter)
    elif op == "outlier":
        result = op_outlier(data, metric_filter)
    elif op == "distribution":
        result = op_distribution(data, metric_filter)
    elif op == "correlation":
        result = op_correlation(data, metric_filter)
    elif op == "rolling":
        result = op_rolling(data, metric_filter, args.window)

    if args.as_json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        formatter = FORMATTERS.get(op, lambda r: json.dumps(r, indent=2, ensure_ascii=False))
        print(formatter(result))


if __name__ == "__main__":
    main()
