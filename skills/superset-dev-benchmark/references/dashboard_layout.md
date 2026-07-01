# Dashboard Layout Reference

> Reference for `position_json` structure used by `PUT /api/v1/dashboard/<id>`. Most edits go through `create_dashboard.mjs --create` / `--add-charts`, but some operations (tab reorder, tab rename, KPI grid changes, native filters) require manually editing `position_json` and PUT-ing the dashboard.

## 1. Component Tree

`position_json` is a flat dict where each key is a component ID and the value is the component definition. Children are referenced by ID and rendered in array order.

```
ROOT_ID
└── GRID_ID
    ├── TABS (optional — only when tabs exist)
    │   ├── TAB "Tab A"
    │   │   ├── ROW
    │   │   │   ├── CHART [w=6 h=50]
    │   │   │   └── CHART [w=6 h=50]
    │   │   └── ROW
    │   │       └── CHART [w=12 h=50]
    │   └── TAB "Tab B"
    │       └── ...
    └── ROW (attached directly to GRID when no tabs)
        └── CHART [w=12 h=50]
```

**Hard rules:**
- `ROOT_ID` and `GRID_ID` are fixed string keys — do not rename them
- Width uses a 12-column grid (`w=12` = full width, `w=6` = half, `w=4` = third)
- Height is in grid units (`h=30` short, `h=50` standard, `h=75–100` tall)
- Components built by `create_dashboard.mjs` carry a `parents` array (e.g. `["ROOT_ID","GRID_ID"]`) for upward navigation. Manually written components should include `parents` consistent with the actual location, otherwise some Superset UI features (filter scope, drill-down breadcrumbs) misbehave.

## 2. Component Types

### ROOT
```json
{"id": "ROOT_ID", "type": "ROOT", "children": ["GRID_ID"]}
```
Always present. Do not modify.

### GRID
```json
{"id": "GRID_ID", "type": "GRID", "children": ["TABS-xxx"], "parents": ["ROOT_ID"]}
```
Global container. With tabs: `children` holds one TABS component. Without tabs: `children` holds ROW components directly.

### TABS
```json
{
  "id": "TABS-BtExgm2F",
  "type": "TABS",
  "children": ["TAB-001", "TAB-002", "TAB-003"],
  "parents": ["ROOT_ID", "GRID_ID"]
}
```
- A dashboard typically has only one TABS component
- Reorder tabs by reordering `children`

### TAB
```json
{
  "id": "TAB-rule-effect",
  "type": "TAB",
  "children": ["ROW-xxx", "ROW-yyy"],
  "meta": {"text": "Rule Effect", "defaultText": "Tab A"},
  "parents": ["ROOT_ID", "GRID_ID", "TABS-BtExgm2F"]
}
```
- `meta.text` is the displayed tab title; `meta.defaultText` is a fallback used by Superset UI

### ROW
```json
{
  "id": "ROW-abc123",
  "type": "ROW",
  "children": ["CHART-xxx", "CHART-yyy"],
  "meta": {"background": "BACKGROUND_TRANSPARENT"},
  "parents": ["ROOT_ID", "GRID_ID"]
}
```
- Multiple CHARTs in one ROW render side-by-side (sum of widths ≤ 12)
- `meta.background`: `"BACKGROUND_TRANSPARENT"` (default in `create_dashboard.mjs`) or a color string. The earlier value `"TRANSPARENT"` also works in some Superset versions.

### CHART
```json
{
  "id": "CHART-abc123",
  "type": "CHART",
  "children": [],
  "meta": {
    "chartId": 2052,
    "width": 6,
    "height": 50,
    "sliceName": "ATO Face Attack Appeal Rule Effect",
    "sliceNameOverride": ""
  },
  "parents": ["ROOT_ID", "GRID_ID", "ROW-abc123"]
}
```
- `meta.chartId` links to the actual chart row in the DB
- `meta.width` + sibling widths in the same ROW must equal 12 (or less, leaving whitespace)
- `meta.sliceNameOverride` overrides the displayed title without renaming the underlying chart

### COLUMN (less common)
```json
{
  "id": "COLUMN-abc",
  "type": "COLUMN",
  "children": ["ROW-xxx", "ROW-yyy"],
  "meta": {"width": 6, "background": "BACKGROUND_TRANSPARENT"}
}
```
Vertically stacks multiple ROWs inside the slot of a parent ROW. Used when you need a `[KPI big number on the left | trend chart on the right]` layout where one side is itself a stack of small charts.

### HEADER
```json
{
  "id": "HEADER-abc",
  "type": "HEADER",
  "meta": {"text": "ATO Dashboard", "headerSize": "MEDIUM"}
}
```
- `headerSize`: `"SMALL"`, `"MEDIUM"`, `"LARGE"`, `"XL"`
- Usually placed as the first row under GRID as a dashboard title

### MARKDOWN
```json
{
  "id": "MARKDOWN-abc",
  "type": "MARKDOWN",
  "meta": {"code": "## Note\nWrite Markdown here", "width": 12, "height": 20}
}
```
For descriptive text, links, or embedded images.

### DIVIDER (rare)
```json
{"id": "DIVIDER-abc", "type": "DIVIDER", "meta": {}}
```
Horizontal separator line.

## 3. Common Layout Patterns

### Single full-width chart per row (most common)
```
ROW → [CHART w=12 h=50]
ROW → [CHART w=12 h=50]
```
Default output of `create_dashboard.mjs --create` / `--add-charts`.

### Two charts side-by-side (1:1)
```
ROW → [CHART w=6 h=50, CHART w=6 h=50]
```
Good for pie/donut comparisons.

### KPI bar + detail row
```
ROW → [CHART w=4 h=30, CHART w=4 h=30, CHART w=4 h=30]   ← three KPI big numbers
ROW → [CHART w=12 h=50]                                  ← trend chart
```

### Tabbed pages
```
TABS → [TAB "Overview", TAB "Detail", TAB "Trend"]
```
Each tab scrolls independently. Filters can be scoped per-tab via `scope` (see §5).

## 4. Common Edits via PUT

### Reorder tabs
1. GET dashboard, parse `position_json`
2. Reorder `pos["TABS-xxx"].children`
3. PUT dashboard

```js
pos["TABS-BtExgm2F"].children = ["TAB-rule-effect", "TAB-aCOkU9aNLl", "TAB-fnfp", "TAB-XbvoneIG"];
```

### Rename a tab
Modify `pos["TAB-xxx"].meta.text`, then PUT.

### Add a chart manually (without `--add-charts`)
Prefer `create_dashboard.mjs --add-charts` when possible — it handles ID generation and `parents` arrays. For one-off custom layouts:

```js
const rowId = `ROW-${Math.random().toString(36).slice(2, 10)}`;
const chartCompId = `CHART-${Math.random().toString(36).slice(2, 10)}`;

pos[rowId] = {
  id: rowId, type: "ROW",
  children: [chartCompId],
  parents: ["ROOT_ID", "GRID_ID"],
  meta: { background: "BACKGROUND_TRANSPARENT" }
};
pos[chartCompId] = {
  id: chartCompId, type: "CHART", children: [],
  parents: ["ROOT_ID", "GRID_ID", rowId],
  meta: { chartId: 2052, width: 12, height: 50, sliceName: "My Chart", sliceNameOverride: "" }
};

pos["GRID_ID"].children.push(rowId);   // or pos["TAB-rule-effect"].children.push(rowId)
```

### Full PUT request shape
```js
import { request, API_BASE } from './http.mjs';

const r = await request('GET', `${API_BASE}/api/v1/dashboard/191`);
const d = r.result;
const pos = JSON.parse(d.position_json);

pos["TABS-BtExgm2F"].children = ["TAB-rule-effect", "TAB-aCOkU9aNLl"];

await request('PUT', `${API_BASE}/api/v1/dashboard/191`, {
  position_json: JSON.stringify(pos),
  json_metadata: d.json_metadata,
  dashboard_title: d.dashboard_title,
});
```

PUT must include `dashboard_title` and `json_metadata` (verbatim if unchanged) — sending only `position_json` will reject with 400 in some Superset versions.

## 5. Native Filters (Global Filters)

Native filters live in `json_metadata.native_filter_configuration` (an array of filter objects), NOT in `position_json`. The two are siblings inside the dashboard payload — most edits that touch the layout (e.g. adding a new tab a filter is scoped to) also require updating filter `scope.rootPath`.

For everything filter-related — all five `filterType`s, the full `Filter` shape, `controlValues` defaults, `defaultDataMask` value formats, scope rules, cascading filters, examples, and the GET → modify → PUT workflow — read **`dashboard_filters.md`**. Do not hand-edit `json_metadata.native_filter_configuration` without checking that file.

Quick reminder for layout edits: `scope.rootPath` references **layout component IDs** from `position_json` (`ROOT_ID`, `TAB-xxx`), and `scope.excluded` references **chart row IDs** (the integers in `meta.chartId`), not chart component IDs (`CHART-abc123`).

## 6. Recommended height / width

| Chart Type | Recommended `height` | Recommended `width` |
|---|---|---|
| Timeseries trend (full row) | 50 | 12 |
| Pie / donut (paired) | 50 | 6 |
| KPI big number | 20–30 | 4–12 |
| Data table | 50–75 | 12 |
| Pivot table | 50–75 | 12 |
| Two trend charts side-by-side | 50 | 6 |
| Large detail chart | 75–100 | 12 |

## 7. ID Naming Convention

Component IDs must be unique within a dashboard. `create_dashboard.mjs` uses random short slugs. When writing IDs by hand, prefer the same shape:

```
TABS-{slug}      e.g. TABS-BtExgm2F
TAB-{slug}       e.g. TAB-rule-effect
ROW-{slug}       e.g. ROW-re64cfc0
CHART-{slug}     e.g. CHART-c0
HEADER-{slug}    e.g. HEADER-main
```

Generate uniquely with:
```js
const id = `ROW-${Math.random().toString(36).slice(2, 10)}`;
```

## 8. Pitfalls

- **`parents` array drift** — when copy-pasting a CHART/ROW from one tab to another, update its `parents` to point to the new chain. Stale `parents` cause filter-scope and breadcrumb glitches.
- **Width sum > 12** — Superset will silently wrap or truncate; nothing errors out.
- **Tab `children` referring to deleted ROW IDs** — leftover phantom IDs render as empty space. Always remove stale IDs from parent `children` after deleting a component.
- **Editing `position_json` without re-sending `json_metadata`** — some endpoints return 400. Always GET → modify → PUT all three of `position_json`, `json_metadata`, `dashboard_title` together.
