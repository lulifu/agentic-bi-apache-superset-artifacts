# box_plot

Statistical distribution display: median, quartiles, whiskers, outliers. Use for response-time distribution, A/B test result spread, etc.

## Required
| Field | Type | Example |
|-------|------|---------|
| `columns` | array | `["latency_ms"]` — numeric columns to plot |
| `metrics` | array | `["count"]` — at least one (often the implicit count) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `groupby` | `[]` | dimension columns; one box per group |
| `whiskerOptions` | `"Tukey"` | `"Tukey"`, `"Min/max (no outliers)"`, `"2/98 percentiles"`, `"9/91 percentiles"` |
| `x_ticks_layout` | `"auto"` | `"auto"`, `"flat"`, `"45°"`, `"90°"`, `"staggered"` |
| `time_grain_sqla` | `"P1D"` | only when a temporal column is in `groupby` |
| `row_limit` | `10000` | |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |
| `number_format` | `"SMART_NUMBER"` | |

## Notes
- Uses `columns` for the numeric columns and `groupby` for grouping — different from most charts
- `whiskerOptions: "Tukey"` is the standard 1.5×IQR rule
- For per-time-bucket distributions, put the temporal column in `groupby` and set `time_grain_sqla`
