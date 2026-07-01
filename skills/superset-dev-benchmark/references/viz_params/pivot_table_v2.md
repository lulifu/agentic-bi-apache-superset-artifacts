# pivot_table_v2

## Required
| Field | Type | Example |
|-------|------|---------|
| `metrics` | array | `["count", "SUM(amount)"]` |
| `groupbyRows` | array | `["region"]` — row dimensions |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Values |
|-------|---------|--------|
| `groupbyColumns` | `[]` | column dimensions (cross-tab headers) |
| `time_grain_sqla` | `"P1D"` | when using temporal columns |
| `order_desc` | `true` | |
| `row_limit` | `10000` | |
| `aggregateFunction` | `"Sum"` | `"Sum"`, `"Count"`, `"Average"`, `"Minimum"`, `"Maximum"`, `"Median"`, `"Sample Variance"`, `"Sample Standard Deviation"`, `"Count Unique Values"` |
| `transposePivot` | `false` | swap rows and columns |
| `rowTotals` | `true` | show row totals |
| `colTotals` | `true` | show column totals |
| `rowSubTotals` | `false` | show row subtotals |
| `colSubTotals` | `false` | show column subtotals |
| `valueFormat` | `"SMART_NUMBER"` | number format |
| `metricsLayout` | `"COLUMNS"` | `"COLUMNS"` or `"ROWS"` — where to place metrics |
| `conditional_formatting` | `[]` | formatting rules |
| `color_scheme` | `"supersetColors"` | |

## Notes
- `metrics` is plural (array)
- Uses `groupbyRows` + `groupbyColumns`, NOT the standard `groupby`
- `aggregateFunction` controls how values are summarized in cells
