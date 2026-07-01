# Superset Dev Benchmark Skill

Repo-local Superset skill copy for NL2BI benchmark experiments on the
development Superset deployment.

Default target:

```text
https://superset.example.invalid
```

Safety behavior:

- `scripts/http.mjs` defaults to the development host.
- `scripts/http.mjs` refuses the production host.
- External dashboard import, ticketing, and data warehouse provisioning workflows
  are intentionally absent.

Typical local invocation:

```bash
node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/create_chart.mjs \
  --search-dataset <dataset_name>
```

Set `SUPERSET_DEV_TOKEN` or `SUPERSET_TOKEN` for the local interceptor. Token
values must never be printed or written to files.

## Contents

```text
superset-dev-benchmark/
├── SKILL.md
├── README.md
├── scripts/
│   ├── http.mjs
│   ├── query_chart.mjs
│   ├── query_dashboard.mjs
│   ├── create_chart.mjs
│   ├── create_dashboard.mjs
│   ├── verify_chart.mjs
│   ├── verify_dashboard.mjs
│   ├── fetch_dashboard.mjs
│   ├── analyze_chart.mjs
│   ├── dashboard_analysis.py
│   ├── stats_analysis.py
│   ├── monitor_setup.mjs
│   ├── monitor_check.mjs
│   ├── annotation.mjs
│   └── screenshot.mjs
└── references/
    ├── superset-reference.md
    ├── dashboard_analysis_reference.md
    ├── dashboard_verify_workflow.md
    ├── dashboard_layout.md
    ├── dashboard_filters.md
    ├── monitor_reference.md
    ├── viz_types.md
    └── viz_params/
```
