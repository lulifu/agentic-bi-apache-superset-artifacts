# echarts_timeseries_bar

## Required
| Field | Type | Example |
|-------|------|---------|
| `metrics` | array | `["count"]` or adhoc metric objects |
| `x_axis` | string | `"order_date"` — temporal or categorical column |
| `time_grain_sqla` | string | `"P1D"`, `"P1W"`, `"P1M"` |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Values |
|-------|---------|--------|
| `groupby` | `[]` | dimension columns for series breakdown |
| `stack` | `null` | `null` (None), `"Stack"`, `"Stream"` — must be the **string** `"Stack"`, NOT boolean `true` |
| `contributionMode` | `null` | `"row"` for 100% stacked (percentage) bar; `null` for absolute |
| `orientation` | `"vertical"` | `"vertical"`, `"horizontal"` |
| `show_value` | `false` | show values on bars |
| `only_total` | `true` | only show total on stacked (needs show_value + stack) |
| `order_desc` | `true` | sort descending |
| `row_limit` | `10000` | |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |
| `zoomable` | `false` | data zoom controls |

## Display
| Field | Default |
|-------|---------|
| `x_axis_time_format` | `"smart_date"` |
| `y_axis_format` | `"SMART_NUMBER"` |
| `rich_tooltip` | `true` |
| `legendType` | `"scroll"` |
| `legendOrientation` | `"top"` |
| `truncateXAxis` | `true` |
| `y_axis_bounds` | `[null, null]` |

## Notes
- Uses `x_axis` (new style), NOT `granularity_sqla` (legacy)
- Uses `stack: "Stack"` (new style), NOT `bar_stacked: true` (legacy)
- `metric` is plural (`metrics` array)
- **When `groupby` has dimensions, default to `stack: "Stack"`** for better readability
