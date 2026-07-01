# Dashboard Native Filters Reference

> Reference for `json_metadata.native_filter_configuration` — the array that defines a dashboard's global filter bar. Native filters live in `json_metadata`, NOT in `position_json`. To persist changes: GET dashboard → mutate `json_metadata.native_filter_configuration` → JSON-encode the whole `json_metadata` → PUT dashboard (alongside verbatim `position_json` and `dashboard_title`).
>
> Source: `superset-frontend/src/filters/components/*` (plugin definitions) and `superset-frontend/packages/superset-ui-core/src/query/types/Dashboard.ts` (`Filter` / `Divider` types).

## 1. Filter Types (`filterType`)

There are exactly five built-in native-filter plugins. The `filterType` string is the plugin key registered in `superset-frontend/src/visualizations/presets/MainPreset.js`.

| `filterType` | Plugin | UI | Use For | Needs `targets` |
|---|---|---|---|---|
| `filter_select` | Select filter | Single/multi-select dropdown | Dimensions: campaign, country, status | yes (datasetId + column) |
| `filter_range` | Range filter | Numeric range slider | Amount, score, count ranges | yes (datasetId + column, numeric) |
| `filter_time` | Time filter | Time-range picker | Global "Last 7 days" style filter | NO — `targets: [{}]` (a one-element array containing an empty object; `[]` also accepted) |
| `filter_timecolumn` | Time column filter | Dropdown of temporal columns | Pick which column the time filter applies to | yes (datasetId; column unset) |
| `filter_timegrain` | Time grain filter | Dropdown (day/week/month…) | Switch series granularity dashboard-wide | yes (datasetId; column unset) |

In addition to filters, `native_filter_configuration` may contain **dividers** (`type: "DIVIDER"`) used purely for visual section breaks in the filter bar — they have no `filterType`, `targets`, or `controlValues`.

## 2. Filter Object Shape

Every entry in `native_filter_configuration` follows this shape (from `Filter` in `Dashboard.ts`):

```json
{
  "id": "NATIVE_FILTER-<nanoid>",
  "type": "NATIVE_FILTER",
  "filterType": "filter_select",
  "name": "Campaign Name",
  "description": "",
  "targets": [{ "datasetId": 788, "column": { "name": "camp_name_mkt" } }],
  "defaultDataMask": { "filterState": { "value": null }, "extraFormData": {} },
  "controlValues": { /* type-specific, see §3 */ },
  "scope": { "rootPath": ["ROOT_ID"], "excluded": [] },
  "cascadeParentIds": [],
  "sortMetric": null,
  "adhoc_filters": [],
  "time_range": "No filter",
  "granularity_sqla": null,
  "requiredFirst": false,
  "tabsInScope": [],
  "chartsInScope": []
}
```

### Field reference

| Field | Required | Description |
|---|---|---|
| `id` | yes | Unique per dashboard. Convention: `NATIVE_FILTER-<8–12 char nanoid>`. Dividers use `NATIVE_FILTER_DIVIDER-` prefix. Constants live in `FiltersConfigModal/utils.ts`. |
| `type` | yes | `"NATIVE_FILTER"` for filters, `"DIVIDER"` for section breaks. |
| `filterType` | yes (filters) | One of the five plugin keys in §1. |
| `name` | yes | Label shown above the control in the filter bar. |
| `description` | no | Hover tooltip. Trimmed on save. |
| `targets` | yes (most types) | Array with exactly ONE element: `{datasetId, column: {name}}`. `filter_time` omits this. `filter_timecolumn` / `filter_timegrain` use `[{datasetId}]` with no `column`. |
| `defaultDataMask` | yes | Initial value. Always include `filterState` (and `extraFormData: {}`); see §4. |
| `controlValues` | yes | Plugin-specific UI options. Defaults vary by `filterType`; see §3. |
| `scope` | yes | Which charts the filter applies to. See §5. |
| `cascadeParentIds` | yes | Array of filter IDs this filter depends on (cascading filters). `[]` if independent. UI also stores this as `dependencies` while editing — it's serialized as `cascadeParentIds`. |
| `sortMetric` | no | For `filter_select`: name of a saved metric used to sort options. `null` to sort alphabetically. |
| `adhoc_filters` | no | Pre-filters applied before option list is computed (e.g. only show campaigns from a specific country). Same shape as chart adhoc filters. |
| `time_range` | no | For `filter_select` with `adhoc_filters` involving time: limits the option list to a time window. Default `"No filter"`. |
| `granularity_sqla` | no | Time column used by `time_range`. |
| `requiredFirst` | no | Boolean. If `true`, the filter must have a value before charts query — combines with `enableEmptyFilter` and `defaultToFirstItem`. |
| `tabsInScope` / `chartsInScope` | computed | Derived from `scope` — leave empty when authoring; Superset recomputes on render. Do not hand-manage. |

## 3. `controlValues` per `filterType`

Defaults are pulled from each plugin's `DEFAULT_FORM_DATA` / `controlPanel.ts`.

### `filter_select`
```json
{
  "multiSelect": true,
  "enableEmptyFilter": false,
  "defaultToFirstItem": false,
  "inverseSelection": false,
  "searchAllOptions": false,
  "sortAscending": true
}
```
- `multiSelect` — allow selecting more than one option
- `enableEmptyFilter` — user MUST pick a value before charts query (combines with `requiredFirst`)
- `defaultToFirstItem` — preselect the first option from the dataset; mutually exclusive with a static `defaultDataMask.filterState.value`
- `inverseSelection` — selected values become an exclusion list
- `searchAllOptions` — by default the dropdown loads up to 1000 distinct values; check this for high-cardinality columns to enable server-side search
- `sortAscending` — option list ordering when `sortMetric` is null

### `filter_range`
```json
{
  "enableEmptyFilter": false
}
```
Range uses no other UI options. The numeric MIN/MAX bounds come from a query (`MIN(col)`, `MAX(col)`) executed on the target column at render time — the user does not configure them.

### `filter_time`
```json
{
  "enableEmptyFilter": false
}
```
The default time-range text lives in `defaultDataMask.filterState.value` (e.g. `"Last 7 days"`, `"No filter"`, or an ISO range), not in `controlValues`.

### `filter_timecolumn`
```json
{
  "enableEmptyFilter": false
}
```
Lets the user pick which temporal column the global time filter targets. Useful when a dashboard has charts on different fact tables that each have their own date/datetime column.

### `filter_timegrain`
```json
{
  "enableEmptyFilter": false
}
```
Lets the user switch granularity (e.g. day → week → month) across all charts that read `time_grain_sqla`.

## 4. `defaultDataMask` — initial filter value

```ts
type DataMask = {
  filterState?: { value?: any; [key: string]: any };
  extraFormData?: ExtraFormData;
  ownState?: JsonObject;
};
```

- `filterState.value` is the visible default. Type depends on `filterType`:
  - `filter_select`: `null` (none) or `["A", "B"]` (multi) or `["A"]` (single)
  - `filter_range`: `null` or `[lower, upper]`
  - `filter_time`: `null` or a Superset time-range string (`"Last 7 days"`, `"No filter"`, `"2026-01-01 : 2026-02-01"`); paired with `extraFormData: {"time_range": "<same string>"}` (NOT a `filters` array — time filters use the dedicated `time_range` key)
  - `filter_timecolumn`: `null` or `"<column_name>"`
  - `filter_timegrain`: `null` or one of `"PT1S"`, `"PT1M"`, `"PT1H"`, `"P1D"`, `"P1W"`, `"P1M"`, `"P3M"`, `"P1Y"`
- `extraFormData` is normally recomputed by the plugin's `buildQuery` from `filterState`; safe to leave as `{}` when authoring a standard filter.
- **Advanced override**: writing `extraFormData.filters` explicitly **replaces** the SQL clause the plugin would have generated. Useful for turning a `filter_select` dropdown into a non-`IN` predicate. Example — using a `filter_select` of dates to drive a `>=` lower bound:
  ```json
  "defaultDataMask": {
    "filterState": { "value": ["2026-04-04"] },
    "extraFormData": {
      "filters": [{ "col": "first_kyc_approve_date", "op": ">=", "val": "2026-04-04" }]
    }
  }
  ```
  When users pick a different date, **only `filterState.value` updates by itself** — the `extraFormData.filters` stays as the saved default unless the dashboard ships custom code to keep them in sync. Use this pattern only for fixed default predicates, not for live user-driven filtering.
- For an "unset by default" filter, use `{"filterState": {"value": null}, "extraFormData": {}}`.

## 5. `scope` — which charts the filter applies to

```ts
{ rootPath: string[]; excluded: number[] }
```

| Pattern | `rootPath` | `excluded` | Effect |
|---|---|---|---|
| Apply to entire dashboard | `["ROOT_ID"]` | `[]` | Default. Filters every chart on every tab. |
| Apply to one tab | `["TAB-rule-effect"]` | `[]` | Only charts inside `TAB-rule-effect`. |
| Apply to multiple tabs | `["TAB-overview", "TAB-trend"]` | `[]` | Charts in either listed tab. |
| Apply to dashboard except some charts | `["ROOT_ID"]` | `[2052, 2103]` | All charts except chartIds 2052 and 2103. |

`excluded` holds **chart IDs (numbers)**, not component IDs. `rootPath` holds **component IDs** from `position_json` (the layout tree's TABS / TAB / ROOT_ID, not chart components). `tabsInScope` / `chartsInScope` are server-derived from `scope` + `position_json` — leave empty when writing.

## 6. Cascading Filters (`cascadeParentIds`)

A filter can depend on another filter's value — useful when "City" options should narrow down based on the selected "Country".

```json
{
  "id": "NATIVE_FILTER-city",
  "filterType": "filter_select",
  "name": "City",
  "targets": [{ "datasetId": 42, "column": { "name": "city" } }],
  "cascadeParentIds": ["NATIVE_FILTER-country"],
  ...
}
```

- The dependency is an `id`, not a name. The parent must already exist in `native_filter_configuration`.
- The form layer calls this `dependencies`; it's serialized as `cascadeParentIds` (see `transformFilter` in `FiltersConfigModal/utils.ts`).
- Cycles are rejected — `hasCircularDependency` walks the chain and refuses to save if the same id appears twice.

## 7. Examples

### Multi-select filter scoped to one tab
```json
{
  "id": "NATIVE_FILTER-abc12345",
  "type": "NATIVE_FILTER",
  "filterType": "filter_select",
  "name": "Region",
  "description": "Filter by sales region",
  "targets": [{ "datasetId": 42, "column": { "name": "region" } }],
  "defaultDataMask": { "filterState": { "value": null }, "extraFormData": {} },
  "controlValues": {
    "multiSelect": true,
    "enableEmptyFilter": false,
    "defaultToFirstItem": false,
    "inverseSelection": false,
    "searchAllOptions": false,
    "sortAscending": true
  },
  "scope": { "rootPath": ["TAB-overview"], "excluded": [] },
  "cascadeParentIds": [],
  "sortMetric": null
}
```

### Numeric range filter
```json
{
  "id": "NATIVE_FILTER-amt00001",
  "type": "NATIVE_FILTER",
  "filterType": "filter_range",
  "name": "Order Amount",
  "targets": [{ "datasetId": 42, "column": { "name": "amount" } }],
  "defaultDataMask": { "filterState": { "value": null }, "extraFormData": {} },
  "controlValues": { "enableEmptyFilter": false },
  "scope": { "rootPath": ["ROOT_ID"], "excluded": [] },
  "cascadeParentIds": []
}
```

### Global time filter with a 7-day default
```json
{
  "id": "NATIVE_FILTER-time0001",
  "type": "NATIVE_FILTER",
  "filterType": "filter_time",
  "name": "Time Range",
  "targets": [{}],
  "defaultDataMask": {
    "filterState": { "value": "Last 7 days" },
    "extraFormData": { "time_range": "Last 7 days" }
  },
  "controlValues": {},
  "scope": { "rootPath": ["ROOT_ID"], "excluded": [] },
  "cascadeParentIds": []
}
```

### Fixed absolute time window (the right way to "lock" a time range)
**Don't** put `"time_range": "2026-06-07T22:56 : 2026-06-07T23:56"` (or any absolute ISO range) into a chart's params — the window expires the moment `now()` leaves it, and screenshots / refreshes start failing or returning empty data.

Instead, keep every chart's `time_range` relative (`"Last week"`, `"No filter"`, etc.) and pin the dashboard-level `filter_time` Native Filter to the absolute window via `defaultDataMask`. The filter overrides each chart's relative range at query time, and the override travels with the dashboard config — no chart-level edit needed if the window changes later:
```json
{
  "id": "NATIVE_FILTER-fixed-window",
  "type": "NATIVE_FILTER",
  "filterType": "filter_time",
  "name": "Incident Window",
  "targets": [{}],
  "defaultDataMask": {
    "filterState": { "value": "2026-06-07T22:56:00 : 2026-06-07T23:56:00" },
    "extraFormData": { "time_range": "2026-06-07T22:56:00 : 2026-06-07T23:56:00" }
  },
  "controlValues": {},
  "scope": { "rootPath": ["ROOT_ID"], "excluded": [] },
  "cascadeParentIds": []
}
```
Both `filterState.value` and `extraFormData.time_range` must carry the **same** ISO string. Scope it to just the charts that should respect the window via `scope.excluded` if some charts on the dashboard need to stay live.

### Dashboard-wide filter excluding a few charts
A `user_id` lookup filter that applies to a single detail table on a dashboard with many summary charts — `rootPath: ["ROOT_ID"]` includes everything, `excluded` lifts every aggregation chart out so only the detail table is filtered:
```json
{
  "id": "NATIVE_FILTER-userid",
  "type": "NATIVE_FILTER",
  "filterType": "filter_select",
  "name": "User ID Lookup",
  "targets": [{ "datasetId": 805, "column": { "name": "user_id" } }],
  "defaultDataMask": { "filterState": {}, "extraFormData": {} },
  "controlValues": {
    "multiSelect": true,
    "searchAllOptions": true,
    "enableEmptyFilter": false,
    "defaultToFirstItem": false,
    "inverseSelection": false
  },
  "scope": {
    "rootPath": ["ROOT_ID"],
    "excluded": [2127, 2128, 2129, 2130, 2131, 2132, 2133, 2135]
  },
  "cascadeParentIds": []
}
```
With high-cardinality columns like `user_id`, set `searchAllOptions: true` so options are searched server-side instead of preloading up to 1000 values.

### Cascading select (Country → City)
```json
[
  {
    "id": "NATIVE_FILTER-country",
    "type": "NATIVE_FILTER",
    "filterType": "filter_select",
    "name": "Country",
    "targets": [{ "datasetId": 42, "column": { "name": "country" } }],
    "defaultDataMask": { "filterState": { "value": null }, "extraFormData": {} },
    "controlValues": { "multiSelect": false, "enableEmptyFilter": false, "defaultToFirstItem": false, "inverseSelection": false, "searchAllOptions": false, "sortAscending": true },
    "scope": { "rootPath": ["ROOT_ID"], "excluded": [] },
    "cascadeParentIds": []
  },
  {
    "id": "NATIVE_FILTER-city",
    "type": "NATIVE_FILTER",
    "filterType": "filter_select",
    "name": "City",
    "targets": [{ "datasetId": 42, "column": { "name": "city" } }],
    "defaultDataMask": { "filterState": { "value": null }, "extraFormData": {} },
    "controlValues": { "multiSelect": true, "enableEmptyFilter": false, "defaultToFirstItem": false, "inverseSelection": false, "searchAllOptions": false, "sortAscending": true },
    "scope": { "rootPath": ["ROOT_ID"], "excluded": [] },
    "cascadeParentIds": ["NATIVE_FILTER-country"]
  }
]
```

### Section divider
```json
{
  "id": "NATIVE_FILTER_DIVIDER-sec1",
  "type": "DIVIDER",
  "title": "Sales filters",
  "description": ""
}
```

## 8. GET → modify → PUT workflow

Native filters live inside `json_metadata` (a JSON-encoded string). Always GET, parse, mutate, re-stringify, PUT all three of `position_json`, `json_metadata`, `dashboard_title`.

```js
import { request, API_BASE } from './http.mjs';
import { nanoid } from 'nanoid'; // or any short-id helper

const r = await request('GET', `${API_BASE}/api/v1/dashboard/191`);
const d = r.result;
const meta = JSON.parse(d.json_metadata || '{}');
meta.native_filter_configuration = meta.native_filter_configuration || [];

// Add a new region filter
meta.native_filter_configuration.push({
  id: `NATIVE_FILTER-${nanoid(8)}`,
  type: 'NATIVE_FILTER',
  filterType: 'filter_select',
  name: 'Region',
  description: '',
  targets: [{ datasetId: 42, column: { name: 'region' } }],
  defaultDataMask: { filterState: { value: null }, extraFormData: {} },
  controlValues: {
    multiSelect: true, enableEmptyFilter: false, defaultToFirstItem: false,
    inverseSelection: false, searchAllOptions: false, sortAscending: true,
  },
  scope: { rootPath: ['ROOT_ID'], excluded: [] },
  cascadeParentIds: [],
  sortMetric: null,
});

await request('PUT', `${API_BASE}/api/v1/dashboard/191`, {
  position_json: d.position_json,                 // verbatim
  json_metadata: JSON.stringify(meta),            // re-encoded
  dashboard_title: d.dashboard_title,             // verbatim
});
```

To **modify** an existing filter, find by `id` or `name` in the array, mutate fields in place, then PUT. To **delete**, splice the entry out — also remove its id from any other filter's `cascadeParentIds`.

## 9. Pitfalls

- **`json_metadata` is a string** in the API payload, not an object. Forgetting to `JSON.stringify` after mutation results in a 400.
- **Sending only `json_metadata` on PUT** — some Superset versions reject unless `position_json` and `dashboard_title` are also present. Always send all three.
- **`targets` shape varies by type** — `filter_time` takes `[]`; `filter_timecolumn` / `filter_timegrain` take `[{datasetId}]` with no `column`; the rest take `[{datasetId, column: {name}}]`. Wrong shape silently breaks the filter.
- **`scope.excluded` uses chart IDs, not chart component IDs** — it's the integer chart row id (`meta.chartId`), not `"CHART-abc123"`.
- **Stale `cascadeParentIds`** — when deleting a filter, sweep all remaining filters and remove its id from their `cascadeParentIds`, otherwise dependent filters will not load on the dashboard.
- **`defaultToFirstItem` + a static `defaultDataMask.filterState.value`** — these conflict. Pick one; the form layer enforces this with `resetConfig`.
- **Duplicate `id` values** — the dashboard renders, but only one of the duplicates appears in the bar. Always use a fresh nanoid.
- **`tabsInScope` / `chartsInScope` written by hand** — these are recomputed from `scope` + `position_json`. Hand-written values are overwritten on the next save and may cause filter-bar flicker; leave them empty.
