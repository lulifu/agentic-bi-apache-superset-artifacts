# Reference: Development Superset API

This reference is for benchmark experiments against the development Superset
deployment only.

| Name | Value |
|------|-------|
| Default web base | `https://superset.example.invalid/superset` |
| Default REST API base | `https://superset.example.invalid/api/v1` |
| Override env | `SUPERSET_BASE_URL` |
| Production guard | `scripts/http.mjs` refuses `superset.toolsfdg.net` |

Authentication is provided outside these scripts. For local Codex benchmark
runs, use `scripts/skill-adapter-codex/superset_token_interceptor.mjs` from the
paper repository and set `SUPERSET_DEV_TOKEN` or `SUPERSET_TOKEN`.

## Core REST Paths

### Dashboards

```text
GET  /api/v1/dashboard/?q=<encoded-query>
GET  /api/v1/dashboard/<id-or-slug>
GET  /api/v1/dashboard/<id-or-slug>/charts
GET  /api/v1/dashboard/<id-or-slug>/datasets
GET  /api/v1/dashboard/<id-or-slug>/tabs
POST /api/v1/dashboard/
PUT  /api/v1/dashboard/<id-or-slug>
```

Create dashboard payload:

```json
{
  "dashboard_title": "nl2bi-bench example",
  "published": false,
  "json_metadata": "{\"refresh_frequency\":0}"
}
```

### Charts

```text
GET  /api/v1/chart/?q=<encoded-query>
GET  /api/v1/chart/<id>
GET  /api/v1/chart/<id>/data/
POST /api/v1/chart/data
POST /api/v1/chart/
PUT  /api/v1/chart/<id>
```

Create chart payload (replace `<dev_dataset_id>` and `<dev_dashboard_id>`
with values resolved at runtime from `--search-dataset` / `query_dashboard.mjs
--search`; literal numbers are not portable across environments):

```json
{
  "slice_name": "nl2bi-bench Sales by Status",
  "datasource_id": <dev_dataset_id>,
  "datasource_type": "table",
  "viz_type": "echarts_timeseries_bar",
  "params": "{\"metrics\":[\"count\"],\"time_range\":\"No filter\"}",
  "dashboards": [<dev_dashboard_id>]
}
```

### Datasets

```text
GET /api/v1/dataset/?q=<encoded-query>
GET /api/v1/dataset/<id>
```

Dataset detail response fields used by the scripts:

| Field | Meaning |
|-------|---------|
| `result.table_name` | Superset dataset table name |
| `result.schema` | Database schema |
| `result.database.id` | Superset database id |
| `result.columns[]` | Column metadata |
| `result.metrics[]` | Saved metrics |
| `result.main_dttm_col` | Main datetime column, if configured |

Column fields:

| Field | Meaning |
|-------|---------|
| `column_name` | SQL column name |
| `type` | Backend SQL type |
| `is_dttm` | Whether Superset treats it as a time column |
| `filterable` | Whether filters can use this column |
| `groupby` | Whether GROUP BY can use this column |

### Chart Data Query

Ad-hoc chart data payload:

```json
{
  "datasource": {"id": <dev_dataset_id>, "type": "table"},
  "queries": [
    {
      "columns": ["status"],
      "metrics": ["count"],
      "filters": [],
      "row_limit": 1000
    }
  ],
  "result_type": "full",
  "result_format": "json"
}
```

For benchmark use, prefer the wrapper scripts:

```bash
node scripts/create_chart.mjs --search-dataset <keyword>
node scripts/create_chart.mjs --dataset-info <dataset_id>
node scripts/query_chart.mjs --dataset-id <dataset_id> --columns <cols> --metrics <metrics> --format
```

## Search Query Encoding

Superset list endpoints use a JSON `q` parameter. Example:

```json
{
  "filters": [{"col": "table_name", "opr": "ct", "value": "financial"}],
  "page": 0,
  "page_size": 25,
  "order_column": "changed_on_delta_humanized",
  "order_direction": "desc"
}
```

Common operators:

| Operator | Meaning |
|----------|---------|
| `eq` | equals |
| `neq` | not equals |
| `ct` | contains |
| `sw` | starts with |
| `gt` | greater than |
| `lt` | less than |
| `in` | membership |

## Error Handling

| HTTP status | Meaning | Action |
|-------------|---------|--------|
| `401 Unauthorized` | Missing/expired credential | Refresh local token and retry once |
| `403 Forbidden` | User or token lacks permission | Stop and report permission issue |
| `404 Not Found` | Resource does not exist | Verify id/slug/dataset name |
| `422 Unprocessable Entity` | Payload validation failed | Inspect returned message and dataset metadata |
| `500` | Backend error | Preserve request context and report |
