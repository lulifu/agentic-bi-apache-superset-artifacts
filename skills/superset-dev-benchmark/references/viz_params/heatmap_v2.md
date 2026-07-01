# heatmap_v2

Two-dimensional density display via color intensity. Use when you want to see how a metric varies across two categorical/temporal axes.

## Required
| Field | Type | Example |
|-------|------|---------|
| `x_axis` | string \| adhoc dict | `"hour"` — X-axis column. Adhoc SQL/SIMPLE column dict also accepted. |
| `groupby` | **single** string | `"day_of_week"` — Y-axis column. **NOT an array** (heatmap is the only viz where `groupby` is a scalar string, not a list). |
| `metric` | singular | `"count"` — heat value (NOT `metrics` array) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `linear_color_scheme` | `"superset_seq_1"` | gradient name (Superset palette) |
| `xscale_interval` | `null` | tick density on X axis |
| `yscale_interval` | `null` | tick density on Y axis |
| `normalize_across` | `"heatmap"` | `"x"` (per-column %), `"y"` (per-row %), or `"heatmap"` (global) |
| `left_margin` | `"auto"` | Y-axis label margin |
| `bottom_margin` | `"auto"` | X-axis label margin |
| `show_legend` | `true` | |
| `show_percentage` | `true` | show % beside cell values |
| `show_values` | `false` | print value in each cell |
| `legend_type` | `"continuous"` | `"continuous"` or `"discrete"` |
| `value_bounds` | `[null, null]` | clamp the color scale |
| `time_grain_sqla` | `"P1D"` | required only if X or Y is a temporal column |
| `row_limit` | `10000` | |
| `sort_x_axis` | `"alpha_asc"` | `"alpha_asc"`, `"alpha_desc"`, `"value_asc"`, `"value_desc"` |
| `sort_y_axis` | `"alpha_asc"` | same options |

## Notes
- Uses **singular** `metric`, not `metrics` array
- `groupby` here is a **single string**, NOT a list — `groupby: "deal_size"` not `groupby: ["deal_size"]`
- The earlier `all_columns_x` / `all_columns_y` field names belong to the legacy heatmap (no v2). The v2 control panel reads `x_axis` + `groupby`; using the legacy names produces a chart whose axis pickers are blank in the UI.
- `normalize_across: "x"` is the typical choice for "what's the share within each column"
- For a time × dimension heatmap, set the temporal column as one axis (usually `x_axis`) and `time_grain_sqla`
