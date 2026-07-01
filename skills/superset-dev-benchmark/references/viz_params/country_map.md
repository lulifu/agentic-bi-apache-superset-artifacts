# country_map

Region-level (within-country) choropleth map. Colors administrative regions; no bubble support.

## Required
| Field | Type | Example |
|-------|------|---------|
| `entity` | string | `"region_code"` — region code column matching the chosen country's regions |
| `metric` | singular | `"count"` — color metric (NOT `metrics`) |
| `select_country` | string | `"china"` — country slug (e.g., `"china"`, `"usa"`, `"france"`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `linear_color_scheme` | `"superset_seq_1"` | |
| `number_format` | `"SMART_NUMBER"` | |
| `row_limit` | `10000` | |

## Notes
- Uses **singular** `metric`
- `select_country` picks the GeoJSON map asset bundled with Superset; the values in `entity` must match that asset's region IDs (e.g., Chinese province codes vs. names — verify with an existing `country_map` chart on the same country)
- For multi-country world view, use `world_map` instead
