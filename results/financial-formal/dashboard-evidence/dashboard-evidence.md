# Financial Dashboard Screenshot Evidence

Generated: 2026-06-14T19:43:22.247Z

Scope: 10 `SkillGuidedAgent` BIRD `financial` NL2Dashboard tasks. Dashboard screenshots were collected serially (`concurrency=1`) through the dev Superset screenshot API.

Screenshot PNGs are local generated evidence and intentionally gitignored. Use the paths below for visual spot-checking; internal Superset URLs are omitted.

## Manifest

| Task | Dashboard | Charts | Datasets | Screenshot | Size | Dimensions |
|---|---:|---:|---:|---|---:|---|
| self_financial_dashboard_01 | 85 | 4 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_01_dashboard_85.png | 56863 | 1600x1024 |
| self_financial_dashboard_02 | 86 | 2 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_02_dashboard_86.png | 53759 | 1600x896 |
| self_financial_dashboard_03 | 89 | 3 | 2 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_03_dashboard_89.png | 75005 | 1600x832 |
| self_financial_dashboard_04 | 87 | 3 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_04_dashboard_87.png | 56308 | 1600x832 |
| self_financial_dashboard_05 | 90 | 4 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_05_dashboard_90.png | 60958 | 1600x832 |
| self_financial_dashboard_06 | 92 | 6 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_06_dashboard_92.png | 53208 | 1600x736 |
| self_financial_dashboard_07 | 88 | 3 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_07_dashboard_88.png | 59459 | 1600x832 |
| self_financial_dashboard_08 | 93 | 3 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_08_dashboard_93.png | 58241 | 1600x832 |
| self_financial_dashboard_09 | 94 | 3 | 1 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_09_dashboard_94.png | 70611 | 1600x832 |
| self_financial_dashboard_10 | 91 | 4 | 2 | results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_10_dashboard_91.png | 92560 | 1600x1264 |

## Per-Dashboard Evidence

### self_financial_dashboard_01 — dashboard #85

NL request: Build a monthly executive overview dashboard for the lending portfolio in 1996. Include a KPI tile for total approved loan amount, a time-series chart of monthly approved loan count, a stacked bar showing loan status mix (finished OK / finished default / running OK / running in debt) by month, and a bar of average loan amount by duration bucket.

Expected viz families: kpi, line, stacked_bar, bar

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_01_dashboard_85.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 371 | big_number_total | 37 | 1 | ok |
| 372 | echarts_timeseries_line | 37 | 12 | ok |
| 373 | echarts_timeseries_bar | 37 | 12 | ok |
| 374 | echarts_timeseries_bar | 37 | 5 | ok |

### self_financial_dashboard_02 — dashboard #86

NL request: Build a regional risk dashboard. For each of the eight Czech regions, show: number of clients, count of active loans (status C or D), default rate (B over A+B for finished loans), and average client salary at the region's branch. Use a regional choropleth-style table plus a horizontal bar of default rate.

Expected viz families: table, bar

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_02_dashboard_86.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 375 | table | 40 | 8 | ok |
| 376 | echarts_timeseries_bar | 40 | 8 | ok |

### self_financial_dashboard_03 — dashboard #89

NL request: Create a credit-card product overview dashboard. Show issuance volume by month (line, by card type), issued-card mix by type (pie), and the count of card-withdrawal transactions per month for 1997 (line) so we can see whether issuance leads transaction volume.

Expected viz families: line, pie, line

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_03_dashboard_89.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 391 | echarts_timeseries_line | 33 | 59 | ok |
| 392 | pie | 33 | 3 | ok |
| 393 | echarts_timeseries_line | 41 | 12 | ok |

### self_financial_dashboard_04 — dashboard #87

NL request: Build a transaction-mix dashboard for account holders. Show: total transaction amount by transaction type (PRIJEM=credit / VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), share of transactions by k_symbol purpose code (pie), and monthly trend of average balance after transaction (line).

Expected viz families: stacked_bar, pie, line

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_04_dashboard_87.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 379 | echarts_timeseries_bar | 42 | 24 | ok |
| 380 | pie | 42 | 9 | ok |
| 381 | echarts_timeseries_line | 42 | 24 | ok |

### self_financial_dashboard_05 — dashboard #90

NL request: Create a client-demographics dashboard. Show a histogram of client age (in years; ages computed against 1998-12-31 as the reference date), a gender breakdown bar, an age-vs-loan-size scatter for clients who hold loans, and a table of the top 10 districts by client count.

Expected viz families: histogram, bar, scatter, table

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_05_dashboard_90.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 394 | histogram_v2 | 40 | 1000 | ok |
| 395 | echarts_timeseries_bar | 40 | 2 | ok |
| 396 | echarts_timeseries_scatter | 40 | 52 | ok |
| 397 | table | 40 | 10 | ok |

### self_financial_dashboard_06 — dashboard #92

NL request: Build a quarterly transaction-volume dashboard for each of the five largest districts (by inhabitants A4). Show one line chart per district plus a combined bar comparing total quarterly transaction amount across the five districts in 1997, in a 2x3 grid layout.

Expected viz families: line, bar

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_06_dashboard_92.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 403 | echarts_timeseries_line | 42 | 4 | ok |
| 404 | echarts_timeseries_line | 42 | 4 | ok |
| 405 | echarts_timeseries_line | 42 | 4 | ok |
| 406 | echarts_timeseries_line | 42 | 4 | ok |
| 407 | echarts_timeseries_line | 42 | 4 | ok |
| 408 | echarts_timeseries_bar | 42 | 4 | ok |

### self_financial_dashboard_07 — dashboard #88

NL request: Build a loan-portfolio aging dashboard for 1998. Slice loans by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), and by approval cohort year. Include: stacked bar of loan count by status x cohort, table of average loan amount by duration bucket and status, and a KPI for total approved amount for 1998.

Expected viz families: stacked_bar, table, kpi

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_07_dashboard_88.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 385 | echarts_timeseries_bar | 40 | 6 | ok |
| 386 | pivot_table_v2 | 40 | 20 | ok |
| 387 | big_number_total | 40 | 1 | ok |

### self_financial_dashboard_08 — dashboard #93

NL request: Build a card-program acquisition dashboard. Show quarterly issuance trend by card type (gold / classic / junior, 1994-1998), a funnel chart from card issuance to first card-withdrawal transaction (counts of clients reaching each stage), and a KPI tile for the average days from card issuance to first card transaction.

Expected viz families: line, funnel, kpi

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_08_dashboard_93.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 409 | echarts_timeseries_line | 43 | 20 | ok |
| 410 | funnel | 43 | 2 | ok |
| 411 | big_number_total | 43 | 1 | ok |

### self_financial_dashboard_09 — dashboard #94

NL request: Create a household-payment risk dashboard. Show monthly total household-payment outflow (k_symbol='SIPO') for 1997-1998 (line), accounts whose household payments exceed twice their 1996 monthly average (table of account_id with the ratio), and a regional bar of total household-payment volume by region.

Expected viz families: line, table, bar

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_09_dashboard_94.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 412 | echarts_timeseries_line | 44 | 24 | errors |
| 413 | table | 44 | 13 | ok |
| 414 | echarts_timeseries_bar | 44 | 8 | ok |

### self_financial_dashboard_10 — dashboard #91

NL request: Build a 'new-account growth and quality' dashboard for Branch Manager review. Charts: monthly new-account openings (line, 1993-1998), share of new accounts by frequency preference (POPLATEK MESICNE / TYDNE / PO OBRATU), and a heatmap of new-account count by district x quarter for 1996. Add a KPI tile for total active accounts as of 1998-12-31.

Expected viz families: line, pie, heatmap, kpi

Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_10_dashboard_91.png

| Chart | Viz | Dataset | Rowcount | Validation |
|---:|---|---:|---:|---|
| 399 | echarts_timeseries_line | 40 | 60 | ok |
| 400 | pie | 40 | 3 | ok |
| 401 | big_number_total | 42 | 1 | ok |
| 402 | heatmap_v2 | 40 | 300 | ok |
