# gauge_chart

Gauge / dial showing a single value's position within a range. Common for completion %, KPI vs target, SLA progress.

## Required
| Field | Type | Example |
|-------|------|---------|
| `metric` | singular | `"completion_rate"` — current value (NOT `metrics`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `groupby` | `[]` | optional — multiple gauges, one per group |
| `min_val` | `0` | gauge minimum |
| `max_val` | `100` | gauge maximum |
| `start_angle` | `225` | arc start (degrees, ECharts convention) |
| `end_angle` | `-45` | arc end (degrees) |
| `show_pointer` | `true` | show pointer needle |
| `value_formatter` | `"{value}"` | label format, e.g. `".1%"` for percentage |
| `intervals` | `""` | comma-separated thresholds for color zones, e.g. `"50,80,100"` |
| `interval_color_indices` | `""` | comma-separated palette indices to color the zones, e.g. `"1,2,4"` |
| `font_size` | `14` | label font size |
| `color_scheme` | `"supersetColors"` | |

## Notes
- Uses **singular** `metric`
- For a 0–1 percentage gauge: set `min_val: 0`, `max_val: 1`, `value_formatter: ".1%"`
- `intervals` + `interval_color_indices` define the colored ranges (e.g. red/yellow/green)
- For multi-gauge dashboards, prefer one chart per metric instead of using `groupby`
