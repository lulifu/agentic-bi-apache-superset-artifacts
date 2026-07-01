# word_cloud

Word frequency visualization where word size encodes the metric.

## Required
| Field | Type | Example |
|-------|------|---------|
| `series` | string | `"keyword"` — column whose values become words |
| `metric` | singular | `"count"` — word size metric (NOT `metrics`) |
| `adhoc_filters` | array | `[]` |

## Key Optional
| Field | Default | Notes |
|-------|---------|-------|
| `size_from` | `10` | minimum font size (px) |
| `size_to` | `70` | maximum font size (px) |
| `rotation` | `"square"` | `"square"`, `"flat"`, `"random"` |
| `color_scheme` | `"supersetColors"` | |
| `row_limit` | `100` | top-N words to render |

## Notes
- Uses **singular** `metric`
- `series` is the column to pull words from — each distinct value becomes one word
- Font size scales linearly between `size_from` and `size_to` based on the metric
- For very long-tail data, lower `row_limit` to avoid an unreadable cloud
