# waterfall

Waterfall chart showing cumulative increase / decrease across stages. Good for revenue bridge, A→B variance breakdown.

## Required
| Field | Type | Example |
|-------|------|---------|
| `x_axis` | string | `"stage"` — categorical or temporal stage column |
| `metric` | singular | `"delta"` — change value per stage (NOT `metrics`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `groupby` | `[]` | breakdown column inside each stage |
| `show_total` | `true` | render the running total bar at the end |
| `time_grain_sqla` | `"P1D"` | only when `x_axis` is temporal |
| `increase_color` | `null` | object `{r,g,b,a}` — color for positive deltas |
| `decrease_color` | `null` | object `{r,g,b,a}` — color for negative deltas |
| `total_color` | `null` | color for the total bar |
| `legend_type` | `"scroll"` | |
| `show_legend` | `true` | |
| `y_axis_format` | `"SMART_NUMBER"` | |
| `row_limit` | `10000` | |

## Notes
- Uses **singular** `metric`; values may be negative (decreases)
- The chart auto-computes the running cumulative position — your `metric` should be the per-stage delta, not the cumulative value
- For a temporal waterfall (e.g., monthly revenue change), set `x_axis` to the time column and `time_grain_sqla` to the desired grain
