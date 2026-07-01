# Superset Viz Type Reference

> Field details and minimal templates live in `viz_params/<viz_type>.md`. This file is the selection guide and one-line description per type.

## Selection Guide

When the user doesn't specify a chart type, pick based on the data scenario:

| Scenario | Recommended viz_type |
|----------|---------------------|
| Distribution / proportion of categories | `pie` |
| Trend over time (single metric) | `echarts_timeseries_line` |
| Trend + grouped comparison (stacked) | `echarts_timeseries_bar` (`stack: "Stack"`) |
| Two metrics of different scales over time | `mixed_timeseries` (dual Y-axis) |
| Time-series scatter / event points over time | `echarts_timeseries_scatter` |
| Single KPI number | `big_number_total` |
| KPI + sparkline trend | `big_number` |
| Ranking / top-N comparison | `echarts_timeseries_bar` |
| Conversion funnel | `funnel` |
| Detail data / row listing | `table` (raw mode) |
| Multi-dimensional cross-tabulation | `pivot_table_v2` |
| Hierarchical proportion | `treemap_v2` or `sunburst_v2` |
| 2-D density (X column × Y column) | `heatmap_v2` |
| Flow / quantity between nodes | `sankey_v2` |
| Country-level geographic distribution | `world_map` (bubble + color) / `country_map` (region color) |
| Single metric vs target / completion rate | `gauge_chart` |
| Cumulative increase/decrease across stages | `waterfall` |
| Numeric distribution (histogram) | `histogram_v2` |
| Statistical distribution (box, quartiles) | `box_plot` |
| Text word frequency | `word_cloud` |
| Multi-dimensional capability comparison | `radar` |
| 3-dimensional scatter (X, Y, size) | `bubble_v2` |
| Node-edge network relationship | `graph_chart` |
| Geospatial big-data points / hex / heatmap | `deck_*` (Deck.gl series) |
| Compact multi-series time band | `horizon` |
| Hierarchical tree layout | `tree_chart` |
| Parallel-axis high-dimensional comparison | `para` |

## Common Cross-Type Conventions

### `metric` (singular) vs `metrics` (array)

| Singular `metric` | Plural `metrics` |
|---|---|
| `pie`, `funnel`, `big_number`, `big_number_total`, `word_cloud`, `gauge_chart`, `treemap_v2`, `sunburst_v2`, `heatmap_v2`, `sankey_v2`, `world_map`, `country_map` | `echarts_timeseries_*`, `echarts_area`, `mixed_timeseries` (`metrics` + `metrics_b`), `table` (aggregate), `pivot_table_v2`, `radar`, `histogram_v2`, `box_plot` |

Wrong plurality is one of the most common 400-error causes — always check the per-type `viz_params/<type>.md` before sending.

### `adhoc_filters` structure
```jsonc
// Simple WHERE filter
{"clause":"WHERE","subject":"rule_name","operator":"IN","operatorId":"IN","comparator":["a","b"],"expressionType":"SIMPLE"}

// Time range filter (chart often won't load data without one)
{"clause":"WHERE","subject":"dt","operator":"TEMPORAL_RANGE","comparator":"No filter","expressionType":"SIMPLE"}

// Custom SQL filter
{"clause":"WHERE","sqlExpression":"dt >= '2025-01-01'","expressionType":"SQL"}
```

### `metrics` element structure
```jsonc
// SIMPLE aggregation
{"aggregate":"SUM","column":{"column_name":"hit_cnt"},"expressionType":"SIMPLE","label":"hit_cnt"}

// Custom SQL
{"expressionType":"SQL","label":"accuracy","sqlExpression":"SUM(not_pass_cnt)*1.0/NULLIF(SUM(hit_cnt),0)","hasCustomLabel":true}
```

### D3 number format quick reference
| Format string | Output | Use case |
|---|---|---|
| `"SMART_NUMBER"` | Auto unit (K/M) | General counts |
| `",.0f"` | `1,234,567` | Integer with thousands separator |
| `",.2f"` | `1,234.56` | 2 decimal places |
| `".2%"` | `12.34%` | Percentage, 2 decimals |
| `".1%"` | `12.3%` | Percentage, 1 decimal |
| `".0%"` | `12%` | Percentage, no decimals |

For percentage Y-axis use `".2%"` etc — NOT `"PERCENT"` or `"%"`.

### `time_grain_sqla` values

ISO-8601 duration strings: `"P1D"` (day), `"P1W"` (week), `"P1M"` (month), `"P1Y"` (year), `"PT1H"` (hour). Superset's internal week representation in some chart params is `"1969-12-29T00:00:00Z/P1W"` — keep it as-is.

### PUT cache-bust on chart update

When updating chart params via PUT, always include:
```json
{ "query_context": "", "query_context_generation": false }
```
Otherwise the frontend cache won't clear and the UI keeps showing stale data.

## Chart Types

### `echarts_timeseries_line` — Line Chart
- **Purpose**: Show metric trends over time
- **Best for**: Continuous data, trend analysis, period-over-period comparison
- **X-axis**: Time column (`x_axis`)
- **Y-axis**: One or more metrics
- **Grouping**: `groupby` splits into multiple lines by dimension
- **Key params**: `show_value`, `markerEnabled`, `connectNulls`, `logAxis`, `y_axis_bounds`, `zoomable`

### `echarts_timeseries_bar` — Bar Chart
- **Purpose**: Compare values across categories or time periods
- **Best for**: Grouped comparison, stacked breakdown, ranking
- **Grouping**: `groupby` splits into different colored bars
- **Key params**: `stack: "Stack"` (stacking — must be string, NOT boolean), `contributionMode: "row"` (100% stacked / percentage view), `show_value`, `order_desc`, `orientation: "horizontal"`

### `echarts_area` — Area Chart
- **Purpose**: Trend visualization emphasizing cumulative volume or proportion
- **Differs from line**: Filled area below the line; `area: true` is auto-set; `stack: "Stack"` shows each part's share, `contributionMode: "row"` for 100% stacked

### `pie` — Pie / Donut Chart
- **Purpose**: Show proportion distribution of a single metric across categories
- **Note**: Uses **singular** `metric`, not `metrics`
- **Grouping**: `groupby` determines the slices
- **Key params**: `donut`, `innerRadius`, `outerRadius`, `label_type` (`"key_percent"` etc.), `show_total`, `roseType`

### `big_number_total` — Big Number / KPI
- **Purpose**: Highlight a single key metric value, no time axis
- **Note**: Uses **singular** `metric`
- **Key params**: `header_font_size`, `subheader`, `subheader_font_size`, `y_axis_format`

### `big_number` — KPI + Trendline
- **Purpose**: KPI plus a sparkline trendline
- **Differs from big_number_total**: Has `x_axis` time column and trend
- **Key params**: `compare_lag`, `compare_suffix` (e.g., `"WoW"`), `show_trend_line`

### `mixed_timeseries` — Dual-Axis Mixed Timeseries
- **Purpose**: Two metric sets with different scales on the same chart
- **Structure**: Query A (`metrics`, `groupby`) + Query B (`metrics_b`, `groupby_b`)
- **Common combo**: A = stacked bar (`seriesType: "bar"`, `stack: true`, `yAxisIndex: 0`), B = line (`seriesTypeB: "line"`, `yAxisIndexB: 1`)
- **Defaults are both line** — set `seriesType`/`seriesTypeB` explicitly when you want bar+line

### `table` — Data Table
- **Two modes**:
  - **Aggregate** (`query_mode: "aggregate"`): `metrics` + `groupby`
  - **Raw** (`query_mode: "raw"`): `all_columns`, no metrics
- **Key params**: `page_length`, `server_pagination`, `include_search`, `show_totals`, `show_cell_bars`, `conditional_formatting`

### `pivot_table_v2` — Pivot Table
- **Purpose**: Multi-dimensional cross-tabulation
- **Grouping**: `groupbyRows` (rows) + `groupbyColumns` (cols), NOT the standard `groupby`
- **Key params**: `valueFormat`, `aggregateFunction` (Sum/Count/Average/...), `transposePivot`, `metricsLayout` (COLUMNS/ROWS), `rowTotals`/`colTotals`

### `funnel` — Funnel Chart
- **Purpose**: Step-by-step conversion drop-off
- **Note**: Uses **singular** `metric`
- **Grouping**: `groupby` defines funnel stages
- **Field-name conflict** on conversion-% display: `percent_calculation_type` vs `label_type: "percent_of_first"/"percent_of_previous"` — see `viz_params/funnel.md` for details and verification steps

### `treemap_v2` — Treemap
- **Purpose**: Hierarchical data as proportional rectangles
- **Grouping**: `groupby` supports multiple levels (outer first)
- **Key params**: `metric` (area metric), `number_format`, `labelType: "key_value"`

### `sunburst_v2` — Sunburst
- **Purpose**: Multi-level proportion in concentric rings
- **Key params**: `columns` (hierarchy, outer first), `metric` (area), `secondary_metric` (color depth)

### `heatmap_v2` — Heatmap
- **Purpose**: Two-dimensional density via color intensity
- **Key params**: `all_columns_x`, `all_columns_y`, `metric`, `linear_color_scheme`, `xscale_interval`/`yscale_interval`, `normalize_across` (`"x"`/`"y"`/`"heatmap"`)

### `sankey_v2` — Sankey Diagram
- **Purpose**: Flow/quantity between nodes
- **Key params**: `source`, `target`, `metric` (flow value), `sort_by_metric`, `color_scheme`

### `histogram_v2` — Histogram
- **Purpose**: Numeric distribution frequency
- **Key params**: `all_columns` (numeric column, single), `bins` (default 10), `groupby` (multi-series), `normalize`, `cumulative`, `x_axis_format`, `y_axis_format`

### `box_plot` — Box Plot
- **Purpose**: Statistical distribution (median, quartiles, outliers)
- **Key params**: `columns` (numeric), `groupby`, `whiskerOptions` (`"Min/max (no outliers)"`/`"Tukey"`), `x_ticks_layout`

### `gauge_chart` — Gauge
- **Purpose**: Single value position within a range (e.g. completion rate)
- **Key params**: `metric`, `min_val`/`max_val`, `start_angle`/`end_angle`, `show_pointer`, `value_formatter`, `intervals` (color thresholds)

### `waterfall` — Waterfall
- **Purpose**: Cumulative increase/decrease across stages
- **Key params**: `x_axis` (stage column), `metric` (change value), `show_total`, `increase_color`/`decrease_color`

### `radar` — Radar Chart
- **Purpose**: Multi-dimensional comparison
- **Key params**: `metrics` (3–8 dimensions), `groupby` (polygons), `max_value`, `fill: true`, `column_config`

### `word_cloud` — Word Cloud
- **Purpose**: Text frequency
- **Note**: Uses **singular** `metric`
- **Key params**: `series` (word column), `size_from`/`size_to`, `rotation`, `color_scheme`

### `world_map` — World Map (bubble + color)
- **Key params**: `entity` (ISO 2/3-letter country code column), `metric` (color metric), `max_bubble_size`, `color_picker`, `show_bubbles`, `projection: "Natural Earth"`

### `country_map` — Region Choropleth
- Like `world_map` but admin-region color only, no bubble
- **Key params**: `entity` (region code), `metric`, `linear_color_scheme`

### `bubble_v2` — Bubble Chart
- **Purpose**: X/Y + bubble size = 3-D data
- **Key params**: `x`, `y`, `size`, `series` (color/grouping), `max_bubble_size`, `x_axis_format`/`y_axis_format`

### `graph_chart` — Network Chart
- **Purpose**: Node-edge network
- **Key params**: `source`, `target`, `metric` (edge weight), `category` (node group), `layout: "force"/"circular"`, `edgeLength`/`repulsion`

### `tree_chart` — Tree Chart
- **Key params**: `id`, `parent`, `name`, `metric`, `orient: "LR"/"TB"`, `layout: "orthogonal"/"radial"`

### `horizon` — Horizon Chart
- **Purpose**: Compact multi-series timeseries via color bands
- **Key params**: `metrics`, `groupby`, `horizonColorScale: "series"/"overall"`, `divisionCount`

### `para` — Parallel Coordinates
- **Purpose**: Compare multiple continuous dimensions on parallel axes
- **Key params**: `metrics` (multiple numeric), `groupby`, `show_datazoom`

### `echarts_timeseries_scatter` — Scatter Timeseries
- Same params as `echarts_timeseries_line` plus `markerEnabled: true`, `markerSize`

### `deck_*` — Deck.gl Geospatial Series

| viz_type | Purpose |
|---|---|
| `deck_scatter` | Lat/lon scatter points |
| `deck_screengrid` | Density grid heatmap |
| `deck_hex` | Hexagonal grid aggregation |
| `deck_grid` | Square grid aggregation |
| `deck_polygon` | Polygon area coloring |
| `deck_arc` | Arc flow direction |
| `deck_path` | Path / trajectory |

- Common params: `longitude`/`latitude` (coordinate columns), `point_radius_fixed_value`, `viewport`. Typically requires a Mapbox token.

### Misc low-frequency types
- `chord` — chord diagram for matrix relationships
- `mapbox` — custom Mapbox layers
- `annotation_renderer` — annotation layer renderer (managed via `annotation.mjs`, not normally created directly)
