# treemap_v2

Hierarchical proportion display via nested rectangles. Each rectangle's area represents the metric value.

## Required
| Field | Type | Example |
|-------|------|---------|
| `metric` | singular | `"count"` — area metric (NOT `metrics`) |
| `groupby` | array | `["region", "city"]` — outer level first, inner levels follow |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `row_limit` | `1000` | |
| `number_format` | `"SMART_NUMBER"` | D3 format for value display |
| `labelType` | `"key"` | `"key"`, `"value"`, `"key_value"` |
| `dateFormat` | `"smart_date"` | for temporal columns |
| `color_scheme` | `"supersetColors"` | |
| `show_labels` | `true` | |
| `show_upper_labels` | `true` | show parent group labels |

## Notes
- Uses **singular** `metric`
- The order of `groupby` is the hierarchy: index 0 is the outermost level, last is the innermost
- For a flat treemap (no hierarchy), pass a single column in `groupby`
