# sunburst_v2

Multi-level proportion in concentric rings. Like a treemap but radial, with optional drill-down.

## Required
| Field | Type | Example |
|-------|------|---------|
| `columns` | array | `["region", "city"]` — hierarchy, outermost ring first |
| `metric` | singular | `"count"` — area / arc value (NOT `metrics`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `secondary_metric` | `null` | optional metric controlling color depth |
| `row_limit` | `5000` | |
| `color_scheme` | `"supersetColors"` | |
| `show_labels` | `true` | |
| `show_total` | `false` | |

## Notes
- Uses **singular** `metric`
- Uses `columns` for hierarchy, NOT the standard `groupby`
- The outermost ring corresponds to `columns[0]`; each subsequent column is one ring deeper
- If `secondary_metric` is set, segment color encodes that metric while area still encodes `metric`
