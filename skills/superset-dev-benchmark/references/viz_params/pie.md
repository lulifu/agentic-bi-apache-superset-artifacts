# pie

## Required
| Field | Type | Example |
|-------|------|---------|
| `metric` | singular | `"count"` — **NOT** `metrics` array |
| `groupby` | array | `["product_line"]` — dimension for slices |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Values |
|-------|---------|--------|
| `row_limit` | `100` | pie defaults to 100 |
| `sort_by_metric` | `true` | sort slices by value |
| `donut` | `false` | donut mode (hole in center) |
| `innerRadius` | `30` | donut hole size 0-100 (visible when donut=true) |
| `outerRadius` | `70` | outer edge size 10-100 |
| `show_labels` | `true` | |
| `label_type` | `"key"` | `"key"`, `"value"`, `"percent"`, `"key_value"`, `"key_percent"`, `"key_value_percent"` |
| `labels_outside` | `true` | labels outside the pie |
| `show_total` | `false` | show aggregate total |
| `color_scheme` | `"supersetColors"` | |
| `show_legend` | `true` | |
| `legendType` | `"scroll"` | |
| `legendOrientation` | `"top"` | |
| `number_format` | `"SMART_NUMBER"` | |

## Notes
- Uses **singular** `metric`, NOT `metrics` array
- No `x_axis` or `time_grain_sqla` — pie is not time-series
- `roseType` can be set to `"area"` or `"radius"` for nightingale chart
