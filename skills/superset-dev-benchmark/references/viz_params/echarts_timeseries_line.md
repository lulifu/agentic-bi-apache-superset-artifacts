# echarts_timeseries_line

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
| `markerEnabled` | `false` | show data point markers |
| `markerSize` | `6` | marker size |
| `connectNulls` | `false` | bridge gaps in the line across NULL points |
| `zoomable` | `false` | data zoom controls |
| `show_value` | `false` | show values on points |
| `stack` | `null` | `null`, `"Stack"`, `"Stream"` |
| `area` | `false` | fill area under the line; for stacked area prefer `echarts_area` |
| `logAxis` | `false` | use logarithmic Y-axis |
| `y_axis_bounds` | `[null, null]` | clamp Y-axis range, e.g. `[0, 1]` for percentage |
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
| `legendType` | `"scroll"` |
| `legendOrientation` | `"top"` |

## Notes
- Uses `x_axis` (new), NOT `granularity_sqla` (legacy)
- `metric` is plural (`metrics` array)
- No `orientation` control (that's bar-specific)
