# radar

Spider / radar chart for multi-dimensional comparison. Each axis is a metric; each polygon is one group.

## Required
| Field | Type | Example |
|-------|------|---------|
| `metrics` | array | 3–8 numeric metrics, one per radar axis |
| `groupby` | array | `["team"]` — one polygon per distinct value |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `row_limit` | `10` | groups (polygons) to draw |
| `max_value` | `null` | global max across axes; if null each axis auto-scales |
| `column_config` | `{}` | per-metric config (e.g., axis-specific max / format) |
| `is_circle` | `false` | render circular axis grid instead of polygonal |
| `show_legend` | `true` | |
| `color_scheme` | `"supersetColors"` | |
| `number_format` | `"SMART_NUMBER"` | |

## Notes
- Best with 3–8 metrics; more axes get crowded
- `groupby` selects which dimension becomes individual polygons
- When metrics have very different scales (e.g., revenue vs satisfaction score), set per-metric `column_config` to normalize, otherwise the larger metric dominates the shape
