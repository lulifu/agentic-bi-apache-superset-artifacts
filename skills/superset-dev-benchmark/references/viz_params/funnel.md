# funnel

## Required
| Field | Type | Example |
|-------|------|---------|
| `metric` | singular | `"count"` — **NOT** `metrics` array |
| `groupby` | array | `["status"]` — stages of the funnel |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Values |
|-------|---------|--------|
| `row_limit` | `10` | funnel defaults to 10 |
| `sort_by_metric` | `true` | sort stages by value |
| `percent_calculation_type` | `"first_step"` | `"first_step"`, `"previous_step"`, `"total"` — see naming conflict below |
| `label_type` | `"key"` | label shape: `"key"`, `"value"`, `"percent"`, `"key_value"`, `"key_percent"`, `"key_value_percent"`, `"percent_of_first"`, `"percent_of_previous"` — see naming conflict below |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |
| `legendOrientation` | `"top"` | |
| `legendMargin` | `50` | |
| `number_format` | `"SMART_NUMBER"` | |
| `show_labels` | `true` | |
| `show_tooltip_labels` | `true` | |

## Notes
- Uses **singular** `metric`, NOT `metrics` array
- No `x_axis` or `time_grain_sqla` — funnel is not time-series
- `groupby` defines the funnel stages (e.g., `["visit", "signup", "purchase"]`)
- `percent_calculation_type` controls how conversion % is calculated:
  - `"first_step"` — % of the first (largest) step
  - `"previous_step"` — % of the previous step
  - `"total"` — % of total sum

### Field-name conflict: `percent_calculation_type` vs `label_type`

Two different naming patterns appear in the wild for the same conversion-% concept on funnel charts:

| Source | Field | Values |
|--------|-------|--------|
| Earlier docs / older Superset builds | `percent_calculation_type` | `"first_step"` / `"previous_step"` / `"total"` |
| CHART_TYPES_EN.md (scanned from 535 production charts) | `label_type` | `"percent_of_first"` / `"percent_of_previous"` |

This is unverified — both names may exist in different Superset versions, or the second may simply be the label format setting (not the calculation mode). **Before relying on either, copy the params from an existing funnel chart on this platform** (e.g. via `query_chart.mjs --chart-id <id>`) to confirm the exact field name in use.
