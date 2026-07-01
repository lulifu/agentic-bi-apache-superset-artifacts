# NVBench Layer-2 NL2Chart Benchmark Summary

Generated: 2026-06-14T20:53:42.509Z
Tasks: 30

| System | Results | Artifact execution | Mean viz type | Mean metric | Mean dimension | Mean auto score / 2 |
|---|---:|---:|---:|---:|---:|---:|
| DirectLLM | 30/30 | n/a | 1.00 | 0.72 | 0.60 | 1.55 |
| SchemaGroundedLLM | 30/30 | n/a | 1.00 | 0.87 | 0.96 | 1.88 |
| SkillGuidedAgent | 30/30 | 30/30 | 1.00 | 0.56 | 0.85 | 1.76 |

## Interpretation Notes

- DirectLLM and SchemaGroundedLLM rows are scored as chart-spec generation only when their result JSON exists; they do not prove a Superset artifact can be created.
- SkillGuidedAgent includes Superset artifact execution: task-level virtual dataset creation from validated PostgreSQL oracle SQL, chart creation, chart-data query, and serial screenshot verification.
- `auto_score_2pt` is a prefilled heuristic, not the final paper score. Human/agent spot-check should inspect ambiguous chart semantics and screenshots before copying numbers into the manuscript.

## Per-task Status

| Task | System | Status | Artifact | Viz | Metric | Dimension | Auto / 2 | Notes |
|---|---|---|---:|---:|---:|---:|---:|---|
| nvbench_dog_kennels_01 | DirectLLM | ok | n/a | 1.00 | 0.00 | 0.00 | 0.67 | spec-only; no Superset artifact execution; metric partial matched=- expected=name; dimension partial matched=- expected=name |
| nvbench_dog_kennels_01 | SchemaGroundedLLM | ok | n/a | 1.00 | 0.00 | 1.00 | 1.33 | spec-only; no Superset artifact execution; metric partial matched=- expected=name |
| nvbench_dog_kennels_01 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 1.00 | 1.60 | chart #416; rows=3; metric partial matched=- expected=name |
| nvbench_dog_kennels_02 | DirectLLM | ok | n/a | 1.00 | 0.33 | 0.33 | 1.11 | spec-only; no Superset artifact execution; metric partial matched=of expected=date/of/treatment; dimension partial matched=treatment expected=date/of/treatment |
| nvbench_dog_kennels_02 | SchemaGroundedLLM | ok | n/a | 1.00 | 0.00 | 1.00 | 1.33 | spec-only; no Superset artifact execution; metric partial matched=- expected=date/of/treatment |
| nvbench_dog_kennels_02 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 1.00 | 1.60 | chart #417; rows=4; metric partial matched=- expected=date/of/treatment |
| nvbench_dog_kennels_03 | DirectLLM | ok | n/a | 1.00 | 0.00 | 0.00 | 0.67 | spec-only; no Superset artifact execution; metric partial matched=- expected=name; dimension partial matched=- expected=name |
| nvbench_dog_kennels_03 | SchemaGroundedLLM | ok | n/a | 1.00 | 0.00 | 1.00 | 1.33 | spec-only; no Superset artifact execution; metric partial matched=- expected=name |
| nvbench_dog_kennels_03 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 1.00 | 1.60 | chart #418; rows=3; metric partial matched=- expected=name |
| nvbench_dog_kennels_04 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.00 | 1.33 | spec-only; no Superset artifact execution; dimension partial matched=- expected=age |
| nvbench_dog_kennels_04 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_dog_kennels_04 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #419; rows=3 |
| nvbench_dog_kennels_05 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.50 | 1.67 | spec-only; no Superset artifact execution; dimension partial matched=name expected=age/name |
| nvbench_dog_kennels_05 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_dog_kennels_05 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #420; rows=3 |
| nvbench_dog_kennels_06 | DirectLLM | ok | n/a | 1.00 | 0.33 | 0.33 | 1.11 | spec-only; no Superset artifact execution; metric partial matched=of expected=date/of/treatment; dimension partial matched=treatment expected=date/of/treatment |
| nvbench_dog_kennels_06 | SchemaGroundedLLM | ok | n/a | 1.00 | 0.00 | 1.00 | 1.33 | spec-only; no Superset artifact execution; metric partial matched=- expected=date/of/treatment |
| nvbench_dog_kennels_06 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 1.00 | 1.60 | chart #421; rows=4; metric partial matched=- expected=date/of/treatment |
| nvbench_employee_hire_evaluation_01 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.00 | 1.33 | spec-only; no Superset artifact execution; dimension partial matched=- expected=name |
| nvbench_employee_hire_evaluation_01 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_01 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #422; rows=6 |
| nvbench_employee_hire_evaluation_02 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_02 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_02 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 0.50 | 1.80 | chart #423; rows=7; dimension partial matched=start expected=start/from |
| nvbench_employee_hire_evaluation_03 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_03 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_03 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #424; rows=2 |
| nvbench_employee_hire_evaluation_04 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.00 | 1.33 | spec-only; no Superset artifact execution; dimension partial matched=- expected=shop/id |
| nvbench_employee_hire_evaluation_04 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_04 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #425; rows=6 |
| nvbench_employee_hire_evaluation_05 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_05 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_employee_hire_evaluation_05 | SkillGuidedAgent | ok | 1 | 1.00 | 0.50 | 0.83 | 1.73 | chart #426; rows=6; metric partial matched=start expected=start/from; dimension partial matched=start/weekday/is/full/time expected=start/from/weekday/is/full/time |
| nvbench_employee_hire_evaluation_06 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.83 | 1.89 | spec-only; no Superset artifact execution; dimension partial matched=start/from/is/full/time expected=start/from/year/is/full/time |
| nvbench_employee_hire_evaluation_06 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 0.83 | 1.89 | spec-only; no Superset artifact execution; dimension partial matched=start/from/is/full/time expected=start/from/year/is/full/time |
| nvbench_employee_hire_evaluation_06 | SkillGuidedAgent | ok | 1 | 1.00 | 0.50 | 0.83 | 1.73 | chart #427; rows=7; metric partial matched=start expected=start/from; dimension partial matched=start/year/is/full/time expected=start/from/year/is/full/time |
| nvbench_cre_Docs_and_Epenses_01 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_cre_Docs_and_Epenses_01 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_cre_Docs_and_Epenses_01 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #428; rows=3 |
| nvbench_cre_Docs_and_Epenses_02 | DirectLLM | ok | n/a | 1.00 | 0.50 | 1.00 | 1.67 | spec-only; no Superset artifact execution; metric partial matched=document expected=document/date |
| nvbench_cre_Docs_and_Epenses_02 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 0.75 | 1.83 | spec-only; no Superset artifact execution; dimension partial matched=document/date/year expected=document/date/year/interval |
| nvbench_cre_Docs_and_Epenses_02 | SkillGuidedAgent | ok | 1 | 1.00 | 0.50 | 0.50 | 1.60 | chart #429; rows=8; metric partial matched=document expected=document/date; dimension partial matched=document/year expected=document/date/year/interval |
| nvbench_cre_Docs_and_Epenses_03 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_cre_Docs_and_Epenses_03 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_cre_Docs_and_Epenses_03 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #430; rows=3 |
| nvbench_cre_Docs_and_Epenses_04 | DirectLLM | ok | n/a | 1.00 | 0.50 | 0.00 | 1.00 | spec-only; no Superset artifact execution; metric partial matched=account expected=account/details; dimension partial matched=- expected=statement/id |
| nvbench_cre_Docs_and_Epenses_04 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_cre_Docs_and_Epenses_04 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #446; rows=2 |
| nvbench_cre_Docs_and_Epenses_05 | DirectLLM | ok | n/a | 1.00 | 0.50 | 0.83 | 1.56 | spec-only; no Superset artifact execution; metric partial matched=document expected=document/date; dimension partial matched=document/date/weekday/document/type expected=document/date/weekday/document/type/name |
| nvbench_cre_Docs_and_Epenses_05 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_cre_Docs_and_Epenses_05 | SkillGuidedAgent | ok | 1 | 1.00 | 0.50 | 0.83 | 1.73 | chart #432; rows=6; metric partial matched=document expected=document/date; dimension partial matched=document/weekday/document/type/name expected=document/date/weekday/document/type/name |
| nvbench_cre_Docs_and_Epenses_06 | DirectLLM | ok | n/a | 1.00 | 0.50 | 0.86 | 1.57 | spec-only; no Superset artifact execution; metric partial matched=document expected=document/date; dimension partial matched=document/date/year/interval/document/type expected=document/date/year/interval/document/type/name |
| nvbench_cre_Docs_and_Epenses_06 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 0.86 | 1.90 | spec-only; no Superset artifact execution; dimension partial matched=document/date/year/document/type/name expected=document/date/year/interval/document/type/name |
| nvbench_cre_Docs_and_Epenses_06 | SkillGuidedAgent | ok | 1 | 1.00 | 0.50 | 0.71 | 1.69 | chart #433; rows=8; metric partial matched=document expected=document/date; dimension partial matched=document/year/document/type/name expected=document/date/year/interval/document/type/name |
| nvbench_behavior_monitoring_01 | DirectLLM | ok | n/a | 1.00 | 0.67 | 0.25 | 1.28 | spec-only; no Superset artifact execution; metric partial matched=date/of expected=date/of/notes; dimension partial matched=date expected=date/of/notes/year |
| nvbench_behavior_monitoring_01 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 0.75 | 1.83 | spec-only; no Superset artifact execution; dimension partial matched=date/of/notes expected=date/of/notes/year |
| nvbench_behavior_monitoring_01 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 0.25 | 1.30 | chart #434; rows=2; metric partial matched=- expected=date/of/notes; dimension partial matched=year expected=date/of/notes/year |
| nvbench_behavior_monitoring_02 | DirectLLM | ok | n/a | 1.00 | 0.67 | 0.20 | 1.24 | spec-only; no Superset artifact execution; metric partial matched=date/of expected=date/of/notes; dimension partial matched=date expected=date/of/notes/year/interval |
| nvbench_behavior_monitoring_02 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 0.60 | 1.73 | spec-only; no Superset artifact execution; dimension partial matched=date/of/notes expected=date/of/notes/year/interval |
| nvbench_behavior_monitoring_02 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 0.20 | 1.28 | chart #435; rows=8; metric partial matched=- expected=date/of/notes; dimension partial matched=year expected=date/of/notes/year/interval |
| nvbench_behavior_monitoring_03 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_behavior_monitoring_03 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_behavior_monitoring_03 | SkillGuidedAgent | ok | 1 | 1.00 | 0.00 | 1.00 | 1.60 | chart #436; rows=2; metric partial matched=- expected=other/details |
| nvbench_behavior_monitoring_04 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.00 | 1.33 | spec-only; no Superset artifact execution; dimension partial matched=- expected=student/id |
| nvbench_behavior_monitoring_04 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_behavior_monitoring_04 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #437; rows=14 |
| nvbench_behavior_monitoring_05 | DirectLLM | ok | n/a | 1.00 | 1.00 | 0.83 | 1.89 | spec-only; no Superset artifact execution; dimension partial matched=date/address/to/other/details expected=date/address/to/month/other/details |
| nvbench_behavior_monitoring_05 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_behavior_monitoring_05 | SkillGuidedAgent | ok | 1 | 1.00 | 0.67 | 0.83 | 1.80 | chart #438; rows=2; metric partial matched=address/to expected=date/address/to; dimension partial matched=address/to/month/other/details expected=date/address/to/month/other/details |
| nvbench_behavior_monitoring_06 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_behavior_monitoring_06 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_behavior_monitoring_06 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #439; rows=14 |
| nvbench_customers_and_invoices_01 | DirectLLM | ok | n/a | 1.00 | 0.33 | 1.00 | 1.56 | spec-only; no Superset artifact execution; metric partial matched=account expected=other/account/details |
| nvbench_customers_and_invoices_01 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_01 | SkillGuidedAgent | ok | 1 | 1.00 | 0.33 | 1.00 | 1.73 | chart #440; rows=2; metric partial matched=account expected=other/account/details |
| nvbench_customers_and_invoices_02 | DirectLLM | ok | n/a | 1.00 | 0.67 | 0.50 | 1.44 | spec-only; no Superset artifact execution; metric partial matched=account/opened expected=date/account/opened; dimension partial matched=account/year expected=date/account/opened/year |
| nvbench_customers_and_invoices_02 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_02 | SkillGuidedAgent | ok | 1 | 1.00 | 0.33 | 0.50 | 1.53 | chart #441; rows=9; metric partial matched=account expected=date/account/opened; dimension partial matched=account/year expected=date/account/opened/year |
| nvbench_customers_and_invoices_03 | DirectLLM | ok | n/a | 1.00 | 0.33 | 1.00 | 1.56 | spec-only; no Superset artifact execution; metric partial matched=account expected=other/account/details |
| nvbench_customers_and_invoices_03 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_03 | SkillGuidedAgent | ok | 1 | 1.00 | 0.33 | 1.00 | 1.73 | chart #442; rows=2; metric partial matched=account expected=other/account/details |
| nvbench_customers_and_invoices_04 | DirectLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_04 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_04 | SkillGuidedAgent | ok | 1 | 1.00 | 1.00 | 1.00 | 2.00 | chart #443; rows=2 |
| nvbench_customers_and_invoices_05 | DirectLLM | ok | n/a | 1.00 | 0.67 | 0.71 | 1.59 | spec-only; no Superset artifact execution; metric partial matched=account/opened expected=date/account/opened; dimension partial matched=account/weekday/other/account/details expected=date/account/opened/weekday/other/account/details |
| nvbench_customers_and_invoices_05 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_05 | SkillGuidedAgent | ok | 1 | 1.00 | 0.33 | 0.71 | 1.62 | chart #444; rows=6; metric partial matched=account expected=date/account/opened; dimension partial matched=account/weekday/other/account/details expected=date/account/opened/weekday/other/account/details |
| nvbench_customers_and_invoices_06 | DirectLLM | ok | n/a | 1.00 | 0.67 | 0.71 | 1.59 | spec-only; no Superset artifact execution; metric partial matched=account/opened expected=date/account/opened; dimension partial matched=account/year/other/account/details expected=date/account/opened/year/other/account/details |
| nvbench_customers_and_invoices_06 | SchemaGroundedLLM | ok | n/a | 1.00 | 1.00 | 1.00 | 2.00 | spec-only; no Superset artifact execution |
| nvbench_customers_and_invoices_06 | SkillGuidedAgent | ok | 1 | 1.00 | 0.33 | 0.71 | 1.62 | chart #445; rows=9; metric partial matched=account expected=date/account/opened; dimension partial matched=account/year/other/account/details expected=date/account/opened/year/other/account/details |
