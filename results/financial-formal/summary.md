# Financial Formal Benchmark Summary

Generated: 2026-06-10T17:48:17.902Z
Tasks: 36

| System | Class | Total | Success | Missing | Errors | Dry-run | Needs review |
|---|---:|---:|---:|---:|---:|---:|---:|
| DirectLLM | query | 6 | 6 | 0 | 0 | 0 | 6 |
| DirectLLM | dashboard | 10 | 10 | 0 | 0 | 0 | 10 |
| DirectLLM | analysis | 10 | 10 | 0 | 0 | 0 | 10 |
| DirectLLM | rca | 10 | 10 | 0 | 0 | 0 | 10 |
| SchemaGroundedLLM | query | 6 | 6 | 0 | 0 | 0 | 6 |
| SchemaGroundedLLM | dashboard | 10 | 10 | 0 | 0 | 0 | 10 |
| SchemaGroundedLLM | analysis | 10 | 10 | 0 | 0 | 0 | 10 |
| SchemaGroundedLLM | rca | 10 | 10 | 0 | 0 | 0 | 10 |
| SkillGuidedAgent | query | 6 | 6 | 0 | 0 | 0 | 6 |
| SkillGuidedAgent | dashboard | 10 | 10 | 0 | 0 | 0 | 10 |
| SkillGuidedAgent | analysis | 10 | 10 | 0 | 0 | 0 | 10 |
| SkillGuidedAgent | rca | 10 | 10 | 0 | 0 | 0 | 10 |

## Notes

- Dry-run rows validate runner plumbing but are not quality-scored.
- Query rows marked `needs_sql_execution` produced SQL only; rows marked `executed_result_set_needs_review` already ran and need result-equivalence review.
- Dashboard, analysis, and RCA entries are emitted to `grading-sheet.md` for human scoring.

## Per-result Status

| Task | System | Status | Reason |
|---|---|---|---|
| bird_financial_01 | DirectLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_02 | DirectLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_03 | DirectLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_04 | DirectLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_05 | DirectLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_06 | DirectLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| self_financial_dashboard_01 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_02 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_03 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_04 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_05 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_06 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_07 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_08 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_09 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_10 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_01 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_02 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_03 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_04 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_05 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_06 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_07 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_08 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_09 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_10 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_01 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_02 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_03 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_04 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_05 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_06 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_07 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_08 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_09 | DirectLLM | needs_human_grading | manual rubric required |
| self_financial_rca_10 | DirectLLM | needs_human_grading | manual rubric required |
| bird_financial_01 | SchemaGroundedLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_02 | SchemaGroundedLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_03 | SchemaGroundedLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_04 | SchemaGroundedLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_05 | SchemaGroundedLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| bird_financial_06 | SchemaGroundedLLM | needs_sql_execution | SQL produced; result-set execution not implemented for this environment |
| self_financial_dashboard_01 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_02 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_03 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_04 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_05 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_06 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_07 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_08 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_09 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_dashboard_10 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_01 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_02 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_03 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_04 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_05 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_06 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_07 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_08 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_09 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_analysis_10 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_01 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_02 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_03 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_04 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_05 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_06 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_07 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_08 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_09 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| self_financial_rca_10 | SchemaGroundedLLM | needs_human_grading | manual rubric required |
| bird_financial_01 | SkillGuidedAgent | executed_result_set_needs_review | SQL executed; compare result set against ground truth |
| bird_financial_02 | SkillGuidedAgent | executed_result_set_needs_review | SQL executed; compare result set against ground truth |
| bird_financial_03 | SkillGuidedAgent | executed_result_set_needs_review | SQL executed; compare result set against ground truth |
| bird_financial_04 | SkillGuidedAgent | executed_result_set_needs_review | SQL executed; compare result set against ground truth |
| bird_financial_05 | SkillGuidedAgent | executed_result_set_needs_review | SQL executed; compare result set against ground truth |
| bird_financial_06 | SkillGuidedAgent | executed_result_set_needs_review | SQL executed; compare result set against ground truth |
| self_financial_dashboard_01 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_02 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_03 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_04 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_05 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_06 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_07 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_08 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_09 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_dashboard_10 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_01 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_02 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_03 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_04 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_05 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_06 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_07 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_08 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_09 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_analysis_10 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_01 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_02 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_03 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_04 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_05 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_06 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_07 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_08 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_09 | SkillGuidedAgent | needs_human_grading | manual rubric required |
| self_financial_rca_10 | SkillGuidedAgent | needs_human_grading | manual rubric required |
