# sankey_v2

Flow / quantity between source and target nodes. Useful for funnel-with-cycles, fund flow, page-to-page navigation.

## Required
| Field | Type | Example |
|-------|------|---------|
| `source` | string | `"from_page"` — source node column |
| `target` | string | `"to_page"` — target node column |
| `metric` | singular | `"count"` — flow value (NOT `metrics`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `row_limit` | `5000` | |
| `sort_by_metric` | `true` | sort flows by value |
| `color_scheme` | `"supersetColors"` | |
| `number_format` | `"SMART_NUMBER"` | |

## Notes
- Uses **singular** `metric`
- `source` and `target` are individual column names — not arrays. For multi-step flows the dataset must already be modeled as edge rows (one row per edge)
- Self-loops (`source == target`) are typically rendered but degrade readability — filter them out at the dataset layer if undesired
