# echarts_timeseries_scatter

Time-axis scatter plot. Same parameter shape as `echarts_timeseries_line` but each data point is rendered as an isolated marker.

## Required
| Field | Type | Example |
|-------|------|---------|
| `metrics` | array | `["count"]` |
| `x_axis` | string | `"event_time"` — temporal column |
| `time_grain_sqla` | string | `"P1D"` |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `groupby` | `[]` | dimension columns; one color per group |
| `markerEnabled` | `true` | scatter relies on markers — keep on |
| `markerSize` | `6` | marker size (px) |
| `zoomable` | `false` | data zoom controls |
| `y_axis_format` | `"SMART_NUMBER"` | |
| `y_axis_bounds` | `[null, null]` | clamp Y range |
| `logAxis` | `false` | |
| `row_limit` | `10000` | |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |

## Notes
- Uses `x_axis` (new style)
- For a non-time scatter (X column is numeric), `bubble_v2` is usually a better fit since `echarts_timeseries_scatter` always treats X as temporal
- Don't combine with `stack` — stacking is meaningless for scatter
