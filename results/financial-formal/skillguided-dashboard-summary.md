# Financial Formal Benchmark - SkillGuided Dashboard Batch

Generated: 2026-06-10T17:43:37.914Z

Scope: BIRD `financial` Layer-3 dashboard tasks executed through the dev Superset chart/dashboard APIs. Chart creation and chart-data verification are serial. A later serial screenshot pass is recorded in `results/financial-formal/dashboard-evidence/`.

## Virtual Datasets Ensured

| Dataset | ID | Created | Updated |
|---|---:|---:|---:|
| vd_financial_card_acquisition_funnel | 43 | false | true |
| vd_financial_household_payment_account_risk | 44 | false | true |

## Dashboard Results

| Task | Success | Dashboard | Charts | Chart-data rowcounts |
|---|---:|---:|---:|---|
| self_financial_dashboard_01 | true | 85 | 4 | 371:1, 372:12, 373:12, 374:5 |
| self_financial_dashboard_02 | true | 86 | 2 | 375:8, 376:8 |
| self_financial_dashboard_03 | true | 89 | 3 | 391:59, 392:3, 393:12 |
| self_financial_dashboard_04 | true | 87 | 3 | 379:24, 380:9, 381:24 |
| self_financial_dashboard_05 | true | 90 | 4 | 394:1000, 395:2, 396:52, 397:10 |
| self_financial_dashboard_06 | true | 92 | 6 | 403:4, 404:4, 405:4, 406:4, 407:4, 408:4 |
| self_financial_dashboard_07 | true | 88 | 3 | 385:6, 386:20, 387:1 |
| self_financial_dashboard_08 | true | 93 | 3 | 409:20, 410:2, 411:1 |
| self_financial_dashboard_09 | true | 94 | 3 | 412:24, 413:13, 414:8 |
| self_financial_dashboard_10 | true | 91 | 4 | 399:60, 400:3, 401:1, 402:300 |

## Notes

- Date columns are treated as native `DATE` fields in the current dev Superset datasets; new dashboard SQL filters use direct date predicates.
- Dashboard screenshots were later collected serially for all 10 dashboards; see `results/financial-formal/dashboard-evidence/dashboard-evidence.md`.
