# BIRD Financial Virtual Datasets

Last updated: 2026-06-11.

This file records the curated virtual datasets used for BIRD `financial`
Layer-3 benchmark tasks in the development Superset environment.

Policy:

- Use physical datasets when a task can be expressed on one table.
- For persistent chart/dashboard artifacts that need joins, create a virtual
  dataset first and build charts on top of it.
- For one-off analysis/RCA tasks, SQL Lab remains acceptable and does not
  require a virtual dataset unless the SQL will be reused by charts.
- Do not use concurrent chart screenshots for verification; prefer dashboard
  screenshots or serial chart screenshots with retry.

## Runtime Context

| Field | Value |
|---|---|
| Superset database | `examples` |
| Database ID | `1` |
| Schema | `bench_bird_financial` |
| Helper | `skills/superset-dev-benchmark/scripts/dataset_admin.mjs --ensure-virtual` |

## Virtual Dataset Inventory

| Virtual dataset | Superset ID | Purpose | Primary task coverage |
|---|---:|---|---|
| `vd_financial_client_loan_region` | 40 | Client/account/loan/district view with region, salary, loan status, amount, duration, account frequency, and client gender. | Regional risk dashboard; lending quality analysis; frequency/default RCA. |
| `vd_financial_card_transactions` | 41 | Card/account/district/transaction view filtered to card-withdrawal-capable joins, with card type and issuance cohort fields. | Card-program dashboard; card-withdrawal analysis/RCA. |
| `vd_financial_account_transactions_region` | 42 | Account/district/transaction view for regional transaction, household payment, and balance analyses. | Transaction mix dashboard; household-payment dashboard/RCA; regional balance RCA. |
| `vd_financial_card_acquisition_funnel` | 43 | Card issuance plus first card-withdrawal facts, with duplicated funnel-stage rows for cumulative funnel charts. | Card-program acquisition dashboard. |
| `vd_financial_household_payment_account_risk` | 44 | Monthly household-payment account facts with each account's 1996 monthly baseline and risk ratio. | Household-payment risk dashboard. |

## Verification

All three SQL files were first validated through dev Superset SQL Lab with
`SELECT * FROM (<sql>) AS vd LIMIT 1`. After registration, each dataset was
verified through `create_chart.mjs --dataset-info <id>` and a chart-data query:

| Dataset ID | Metadata verification | Chart-data smoke query | Result |
|---:|---|---|---|
| 40 | 26 columns, 3 time columns, description present. | `--metrics count --columns region --row-limit 5` | Returned 5 region rows; largest group `north Moravia` = 942. |
| 41 | 18 columns, 4 time columns, description present. | `--metrics count --columns card_type --row-limit 5` | Returned 3 card-type rows: `classic` 5,577; `junior` 1,648; `gold` 811. |
| 42 | 21 columns, 4 time columns, description present. | `--metrics count --columns trans_type --row-limit 5` | Returned 3 transaction-type rows: `VYDAJ` 634,571; `PRIJEM` 405,083; `VYBER` 16,666. |
| 43 | Registered during the formal dashboard batch. | Formal chart-data verification in `results/financial-formal/skillguided-dashboard-summary.md` | Dashboard 08 chart rowcounts: 20, 2, and 1. |
| 44 | Registered during the formal dashboard batch. | Formal chart-data verification in `results/financial-formal/skillguided-dashboard-summary.md` | Dashboard 09 chart rowcounts: 24, 13, and 8. |

Implementation note: Superset's dataset create API accepts `sql` but not
`description` in the initial `POST /api/v1/dataset/` payload. The helper
therefore creates the dataset first, then applies `description` and
`is_sqllab_view` through `PUT /api/v1/dataset/<id>`. As of the formal
dashboard batch, re-running `--ensure-virtual` also refreshes the virtual SQL
for an existing dataset so benchmark view definitions can be corrected without
changing the stable dataset ID.

## Creation Commands

Run from the repository root with the local token interceptor:

```bash
node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/dataset_admin.mjs \
  --ensure-virtual --database-id 1 --schema bench_bird_financial \
  --table vd_financial_client_loan_region \
  --sql-file tasks/virtual-datasets/financial/client_loan_region.sql \
  --description "BIRD financial benchmark virtual dataset: client/account/loan/district regional lending view."

node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/dataset_admin.mjs \
  --ensure-virtual --database-id 1 --schema bench_bird_financial \
  --table vd_financial_card_transactions \
  --sql-file tasks/virtual-datasets/financial/card_transactions.sql \
  --description "BIRD financial benchmark virtual dataset: card-withdrawal transaction view."

node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/dataset_admin.mjs \
  --ensure-virtual --database-id 1 --schema bench_bird_financial \
  --table vd_financial_account_transactions_region \
  --sql-file tasks/virtual-datasets/financial/account_transactions_region.sql \
  --description "BIRD financial benchmark virtual dataset: account transaction facts with district region."

node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/dataset_admin.mjs \
  --ensure-virtual --database-id 1 --schema bench_bird_financial \
  --table vd_financial_card_acquisition_funnel \
  --sql-file tasks/virtual-datasets/financial/card_acquisition_funnel.sql \
  --description "BIRD financial benchmark virtual dataset: card issuance, first card-withdrawal, and funnel stages."

node --import ./scripts/skill-adapter-codex/superset_token_interceptor.mjs \
  skills/superset-dev-benchmark/scripts/dataset_admin.mjs \
  --ensure-virtual --database-id 1 --schema bench_bird_financial \
  --table vd_financial_household_payment_account_risk \
  --sql-file tasks/virtual-datasets/financial/household_payment_account_risk.sql \
  --description "BIRD financial benchmark virtual dataset: household-payment account monthly volume and 1996 baseline ratio."
```

The commands are idempotent: if the dataset already exists, the helper reuses
the existing ID and refreshes the description metadata.
