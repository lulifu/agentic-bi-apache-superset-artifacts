# echarts_area

Identical to `echarts_timeseries_line` except `area: true` is force-set by the plugin.

## Required
| Field | Type | Example |
|-------|------|---------|
| `metrics` | array | `["count"]` |
| `x_axis` | string | `"order_date"` |
| `time_grain_sqla` | string | `"P1D"` |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Values |
|-------|---------|--------|
| `groupby` | `[]` | dimension columns |
| `stack` | `null` | `null`, `"Stack"`, `"Stream"`, `"Expand"` (one extra vs bar) |
| `opacity` | `0.2` | area fill opacity |
| `seriesType` | `"line"` | `"line"`, `"smooth"`, `"start"`, `"middle"`, `"end"` |
| `markerEnabled` | `false` | |
| `markerSize` | `6` | |
| `show_value` | `false` | |
| `only_total` | `true` | for stacked: show only total label |
| `zoomable` | `false` | |
| `order_desc` | `true` | |
| `row_limit` | `10000` | |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |

## Display
| Field | Default |
|-------|---------|
| `x_axis_time_format` | `"smart_date"` |
| `y_axis_format` | `"SMART_NUMBER"` |
| `rich_tooltip` | `true` |

## Notes
- Uses `x_axis` (new), NOT `granularity_sqla` (legacy)
- `metrics` is plural (array)
- `area: true` is automatic — do NOT set it manually
- **When `groupby` has dimensions, `stack: "Stack"` is common** for stacked area
