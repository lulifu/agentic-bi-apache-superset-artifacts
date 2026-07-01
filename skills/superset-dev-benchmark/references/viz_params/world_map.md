# world_map

Country-level geographic distribution. Color encodes a metric; optional bubbles encode a second metric.

## Required
| Field | Type | Example |
|-------|------|---------|
| `entity` | string | `"country_code"` — ISO 2- or 3-letter country code column |
| `metric` | singular | `"count"` — color metric (NOT `metrics`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `secondary_metric` | `null` | bubble-size metric; needed when `show_bubbles: true` |
| `show_bubbles` | `false` | overlay bubbles in addition to country color |
| `max_bubble_size` | `25` | bubble cap (px) |
| `color_picker` | `null` | RGBA object — bubble color override |
| `linear_color_scheme` | `"superset_seq_1"` | gradient for country fill |
| `projection` | `"Natural Earth"` | map projection |
| `row_limit` | `10000` | |
| `country_fieldtype` | `"cca2"` | `"cca2"` (2-letter), `"cca3"` (3-letter), `"name"` (English country name) |

## Notes
- Uses **singular** `metric`
- The dataset must contain a column with valid ISO codes (or full names if `country_fieldtype: "name"`); rows that don't match are silently dropped
- For region-level (within-country) maps without bubbles, use `country_map` instead
