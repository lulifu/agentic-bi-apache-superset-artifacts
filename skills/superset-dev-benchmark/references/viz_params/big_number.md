# big_number (KPI with trendline)

A KPI card with a mini sparkline trend. For a KPI **without** trendline, use `big_number_total` instead.

## Required
| Field | Type | Example |
|-------|------|---------|
| `metric` | singular | `"count"` — **NOT** `metrics` array |
| `x_axis` | string | `"order_date"` — temporal column for the trendline |
| `time_grain_sqla` | string | `"P1D"`, `"P1W"`, `"P1M"` |
| `adhoc_filters` | array | `[]` |

## Optional
| Field | Default | Notes |
|-------|---------|-------|
| `subheader` | `""` | description text below the number |
| `compare_lag` | `null` | periods to compare (e.g., `1` for WoW) |
| `compare_suffix` | `null` | suffix label (e.g., `"WoW"`) |
| `show_trend_line` | `true` | toggle the sparkline |
| `start_y_axis_at_zero` | `true` | force Y-axis to start at 0 |
| `header_font_size` | `0.4` | `0.2`=Tiny, `0.3`=Small, `0.4`=Normal, `0.5`=Large, `0.6`=Huge |
| `subheader_font_size` | `0.15` | `0.125`=Tiny, `0.15`=Small, `0.2`=Normal, `0.3`=Large, `0.4`=Huge |
| `y_axis_format` | `"SMART_NUMBER"` | D3 number format (e.g. `",.0f"`, `".2%"`) |
| `time_format` | `"smart_date"` | tooltip time format |

## Notes
- Uses **singular** `metric`, not `metrics` array
- The `create_chart.mjs` resolver accepts both `x_axis` (new) and `granularity_sqla` (legacy) for the time column — prefer `x_axis`
- The sparkline uses the same time range and grain as the headline number
