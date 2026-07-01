# table

Two modes: **raw** (show rows) or **aggregate** (groupby + metrics).

## Raw Mode (`query_mode: "raw"`)

### Required
| Field | Type | Example |
|-------|------|---------|
| `query_mode` | string | `"raw"` |
| `all_columns` | array | `["order_date", "product", "amount"]` |
| `adhoc_filters` | array | `[]` |

### Optional
| Field | Default | Notes |
|-------|---------|-------|
| `order_by_cols` | `[]` | ordering columns |
| `row_limit` | `1000` | |

## Aggregate Mode (`query_mode: "aggregate"`)

### Required
| Field | Type | Example |
|-------|------|---------|
| `query_mode` | string | `"aggregate"` |
| `metrics` | array | `["count"]` — at least one of metrics/groupby |
| `groupby` | array | `["region"]` — at least one of metrics/groupby |
| `adhoc_filters` | array | `[]` |

### Optional
| Field | Default | Notes |
|-------|---------|-------|
| `percent_metrics` | `[]` | show as percentage |
| `order_desc` | `true` | |
| `row_limit` | `1000` | |
| `show_totals` | `false` | summary row |
| `timeseries_limit_metric` | `null` | sort metric |

## Shared Optional
| Field | Default | Notes |
|-------|---------|-------|
| `time_grain_sqla` | `"P1D"` | when groupby includes temporal column |
| `server_pagination` | `false` | server-side pagination |
| `server_page_length` | `10` | rows per page (server) |
| `page_length` | `null` | client page length: `0`=all, `10`, `20`, `50`, `100`, `200` |
| `include_search` | `false` | client search box |
| `show_cell_bars` | `true` | background bar in cells |
| `color_pn` | `true` | colorize positive/negative |
| `table_timestamp_format` | `"smart_date"` | |
| `allow_render_html` | `true` | render HTML in cells |
| `conditional_formatting` | `[]` | custom formatting rules |

## Notes
- If `query_mode` is absent, inferred from fields: `all_columns` present → raw, otherwise → aggregate
- `metrics` is plural (array)
