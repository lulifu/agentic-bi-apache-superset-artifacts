# mixed_timeseries (dual axis)

## Required
| Field | Type | Example |
|-------|------|---------|
| `metrics` | array | Query A metrics |
| `metrics_b` | array | Query B metrics |
| `x_axis` | string | shared X axis column |
| `time_grain_sqla` | string | shared time grain |
| `adhoc_filters` | array | Query A filters |

## Query A
| Field | Default | Notes |
|-------|---------|-------|
| `metrics` | (required) | |
| `groupby` | `[]` | |
| `adhoc_filters` | `[]` | |
| `order_desc` | `true` | |
| `row_limit` | `10000` | |
| `seriesType` | `"line"` | `"line"`, `"scatter"`, `"smooth"`, `"bar"` |
| `yAxisIndex` | `0` | `0` = primary, `1` = secondary |
| `stack` | `false` | |
| `area` | `false` | |
| `show_value` | `false` | |
| `opacity` | `0.2` | area opacity |
| `markerEnabled` | `false` | |
| `markerSize` | `6` | |

## Query B (suffixed with `_b` or `B`)
| Field | Default | Notes |
|-------|---------|-------|
| `metrics_b` | (required) | |
| `groupby_b` | `[]` | |
| `adhoc_filters_b` | `[]` | |
| `order_desc_b` | `true` | |
| `row_limit_b` | `10000` | |
| `seriesTypeB` | `"line"` | same choices as A |
| `yAxisIndexB` | `0` | `0` = primary, `1` = secondary |
| `stackB` | `false` | |
| `areaB` | `false` | |
| `show_valueB` | `false` | |
| `opacityB` | `0.2` | |
| `markerEnabledB` | `false` | |
| `markerSizeB` | `6` | |

## Shared Display
| Field | Default |
|-------|---------|
| `color_scheme` | `"supersetColors"` |
| `show_legend` | `true` |
| `zoomable` | `false` |
| `rich_tooltip` | `true` |
| `y_axis_format` | `"SMART_NUMBER"` (primary) |
| `y_axis_format_secondary` | `"SMART_NUMBER"` |
| `y_axis_bounds` | `[null, null]` (primary) |
| `y_axis_bounds_secondary` | `[null, null]` |

## Notes
- ⚠️ **`seriesType` / `seriesTypeB` use SHORT names**: `"line"` / `"bar"` / `"smooth"` / `"scatter"` / `"area"` / `"start"` / `"middle"` / `"end"`. Do **NOT** pass a full `viz_type` string like `"echarts_timeseries_line"` or `"echarts_timeseries_bar"` — the v2 control panel won't recognize it (you'll see *both* sides render as Line even though the saved value claims otherwise). Some older charts on the same instance may still have full-name values; that's a UI-side fallback, not the canonical form.
- `metrics` is plural (array) for both A and B
- Query B fields use `_b` suffix for data params, `B` suffix for display params
- **Defaults are both `"line"`** — you MUST explicitly set `seriesType`/`seriesTypeB` when the user wants bar+line
- **`x_axis` must be a string column name**, not an AdhocColumn dict (otherwise throws `unhashable type: 'dict'`)
- For percentage on the secondary axis, use D3 format `".2%"` / `".1%"` on `y_axis_format_secondary` — NOT `"PERCENT"` or `"%"`
- The week granularity value `"1969-12-29T00:00:00Z/P1W"` is Superset's internal representation — keep it as-is
- **`create_chart.mjs` writes a 2-query `query_context`** for `mixed_timeseries`: queries[0] = A side (metrics / groupby / adhoc_filters), queries[1] = B side (metrics_b / groupby_b / adhoc_filters_b). Both share `x_axis` / `granularity_sqla` / `time_range`. GET-data thus resolves BOTH sides directly without a frontend re-fetch — do NOT manually overwrite `query_context` to `""` on PUT (that was the legacy workaround for v1.7.0 and earlier).

## Common Patterns

**Stacked bar (A) + line (B) on dual axis:**
```json
{
  "seriesType": "bar",
  "stack": true,
  "yAxisIndex": 0,
  "seriesTypeB": "line",
  "yAxisIndexB": 1
}
```

**Both lines, dual axis:**
```json
{
  "seriesType": "line",
  "yAxisIndex": 0,
  "seriesTypeB": "line",
  "yAxisIndexB": 1
}
```

## Minimal Creation Template
```json
{
  "viz_type": "mixed_timeseries",
  "datasource": "{id}__table",
  "x_axis": "dt",
  "time_grain_sqla": "P1D",
  "metrics": [{"aggregate":"SUM","column":{"column_name":"hit_cnt"},"expressionType":"SIMPLE","label":"hit_cnt"}],
  "metrics_b": [{"expressionType":"SQL","label":"accuracy","sqlExpression":"SUM(not_pass_cnt)*1.0/NULLIF(SUM(hit_cnt),0)"}],
  "groupby": [], "groupby_b": [],
  "adhoc_filters": [], "adhoc_filters_b": [],
  "seriesType": "bar", "seriesTypeB": "line",
  "yAxisIndexB": 1,
  "y_axis_format": "SMART_NUMBER",
  "y_axis_format_secondary": ".2%",
  "yAxisTitleSecondary": "Accuracy",
  "color_scheme": "supersetColors",
  "x_axis_time_format": "%Y-%m-%d",
  "show_legend": true, "legendType": "plain", "legendOrientation": "top",
  "rich_tooltip": true, "tooltipTimeFormat": "smart_date",
  "stack": false, "stackB": false,
  "markerEnabled": true, "markerSize": 2,
  "markerEnabledB": true, "markerSizeB": 2,
  "row_limit": 10000, "row_limit_b": 10000
}
```

(Older versions of this template included `"query_context": ""` and `"query_context_generation": false`; with v1.7.1 the skill writes a complete 2-query query_context itself, so those keys are no longer needed.)
