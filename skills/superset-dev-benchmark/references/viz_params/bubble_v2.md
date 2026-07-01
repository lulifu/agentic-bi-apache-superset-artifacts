# bubble_v2

X/Y scatter plus a third dimension encoded as bubble size. Use for "country comparison: GDP × population × land area".

## Required
| Field | Type | Example |
|-------|------|---------|
| `x` | metric / column | metric used for the X coordinate |
| `y` | metric / column | metric used for the Y coordinate |
| `size` | metric / column | metric used for the bubble size |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `entity` | `null` | row identifier column (one bubble per entity, e.g. `"country"`) |
| `series` | `null` | grouping/color column |
| `max_bubble_size` | `25` | upper size in px |
| `x_axis_format` | `"SMART_NUMBER"` | |
| `y_axis_format` | `"SMART_NUMBER"` | |
| `x_log_scale` | `false` | log scale on X |
| `y_log_scale` | `false` | log scale on Y |
| `show_legend` | `true` | |
| `color_scheme` | `"supersetColors"` | |
| `row_limit` | `10000` | |

## Notes
- `x`, `y`, `size` are individual metric specs (SIMPLE / SQL adhoc metric or saved-metric name) — NOT arrays
- `entity` controls which row becomes a bubble; without it, rows can collide on the same X/Y point
- For multi-color groups (e.g., one color per region), set `series`
