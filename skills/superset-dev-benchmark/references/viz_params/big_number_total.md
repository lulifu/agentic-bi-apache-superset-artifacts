# big_number_total (KPI without trendline)

## Required
| Field | Type | Example |
|-------|------|---------|
| `metric` | singular | `"count"` — **NOT** `metrics` array |
| `adhoc_filters` | array | `[]` |

## Optional
| Field | Default | Notes |
|-------|---------|-------|
| `subheader` | `""` | description text below the number |
| `header_font_size` | `0.4` | `0.2`=Tiny, `0.3`=Small, `0.4`=Normal, `0.5`=Large, `0.6`=Huge |
| `subheader_font_size` | `0.15` | `0.125`=Tiny, `0.15`=Small, `0.2`=Normal, `0.3`=Large, `0.4`=Huge |
| `y_axis_format` | `"SMART_NUMBER"` | D3 number format (e.g. `",.0f"`, `".2%"`) |
| `time_format` | `"smart_date"` | only used if a time dimension is somehow involved |

## Notes
- No `x_axis`, no `time_grain_sqla`, no trendline
- Uses **singular** `metric`, not `metrics` array
- For KPI **with** sparkline trend, use `big_number` instead
