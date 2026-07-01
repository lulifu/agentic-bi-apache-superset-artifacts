# histogram_v2

Frequency distribution of a numeric column.

## Required
| Field | Type | Example |
|-------|------|---------|
| `all_columns` | array | `["amount"]` — single numeric column (Superset histograms are univariate) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `bins` | `10` | number of buckets |
| `groupby` | `[]` | optional grouping → multi-series histogram (one color per group) |
| `normalize` | `false` | normalize counts to relative frequency (proportions) |
| `cumulative` | `false` | cumulative distribution |
| `x_axis_format` | `"SMART_NUMBER"` | bucket label format |
| `y_axis_format` | `"SMART_NUMBER"` | count axis format (use `".2%"` if `normalize: true`) |
| `row_limit` | `10000` | row sample size used to compute bins |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |

## Notes
- `all_columns` should be a single-element array with the numeric column
- `metrics` is NOT used — bin counts are computed automatically by Superset
- For per-group comparison, fill `groupby` (e.g., `["country"]`) → overlapping or stacked bars per country
- Set `y_axis_format: ".2%"` when `normalize: true` so the Y axis renders as percentage
