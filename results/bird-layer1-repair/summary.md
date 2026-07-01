# BIRD Layer-1 SkillGuided Repair Query Benchmark Summary

Generated: 2026-06-14T19:31:23.977Z
Tasks: 30

## Aggregate Scores

| System | Total | Executable | Exact match | Missing | SQL errors | Avg / 2 | Exact % |
|---|---:|---:|---:|---:|---:|---:|---:|
| SkillGuidedAgentRepair | 30 | 30 | 23 | 0 | 0 | 1.77 | 76.7 |

## Method

- Scope: 30 BIRD Layer-1 `query` tasks from `tasks/nl2bi-benchmark.csv`.
- Oracle: validated `ground_truth_sql_postgres` for each task.
- Execution: dev Superset SQL Lab against database `examples` (#1), with per-dataset Postgres schemas.
- Scoring: generated SQL receives 2 points for executing and 2 points for result-set equivalence; aggregate `Avg / 2` is averaged across the two dimensions.
- Result equivalence is strict: extra or missing output columns count as mismatches even when the leading value is correct.
- Repair protocol: no-context sub-agents started from first-pass SkillGuidedAgent SQL, called SQL Lab themselves, and could use SQL errors / result shape feedback but not oracle SQL or oracle rows.
- The oracle was used only after final repaired SQL was frozen, by this offline scorer.
- Follow-up audit: the 6 `financial` tasks were re-run through the same oracle-blind self-test/repair protocol after the initial repair summary. The financial sub-agent kept 4 first-pass SQL queries and made 2 conservative repairs (`bird_financial_04`, `bird_financial_06`); all 6 still scored exact matches.
- Raw per-task JSON outputs remain gitignored; this summary and the prefilled grading sheet are the commit-eligible artifacts.

## Comparison to SkillGuided First Pass

| Arm | Executable | Exact match | SQL errors | Exact % |
|---|---:|---:|---:|---:|
| SkillGuidedAgent first pass | 28/30 | 17/30 | 2 | 56.7 |
| SkillGuidedAgentRepair | 30/30 | 23/30 | 0 | 76.7 |

The repair loop recovered all first-pass execution errors and added 6 exact matches under the same strict result-set equivalence scorer. The largest remaining failure cluster is semantic mismatch where SQL executed cleanly but chose a different output field or predicate than the offline oracle, which SQL Lab execution feedback alone cannot always reveal.

## Oracle Row Counts

| Task | Dataset | Oracle rows |
|---|---|---:|
| bird_financial_01 | financial | 1 |
| bird_financial_02 | financial | 1 |
| bird_financial_03 | financial | 1 |
| bird_financial_04 | financial | 1 |
| bird_financial_05 | financial | 1 |
| bird_financial_06 | financial | 1 |
| bird_formula_1_01 | formula_1 | 1 |
| bird_formula_1_02 | formula_1 | 14 |
| bird_formula_1_03 | formula_1 | 5 |
| bird_formula_1_04 | formula_1 | 1 |
| bird_formula_1_05 | formula_1 | 1 |
| bird_formula_1_06 | formula_1 | 1 |
| bird_card_games_01 | card_games | 10000 |
| bird_card_games_02 | card_games | 1 |
| bird_card_games_03 | card_games | 5 |
| bird_card_games_04 | card_games | 3 |
| bird_card_games_05 | card_games | 1 |
| bird_card_games_06 | card_games | 1 |
| bird_european_football_2_01 | european_football_2 | 1 |
| bird_european_football_2_02 | european_football_2 | 1 |
| bird_european_football_2_03 | european_football_2 | 1 |
| bird_european_football_2_04 | european_football_2 | 1 |
| bird_european_football_2_05 | european_football_2 | 1 |
| bird_european_football_2_06 | european_football_2 | 11 |
| bird_student_club_01 | student_club | 1 |
| bird_student_club_02 | student_club | 1 |
| bird_student_club_03 | student_club | 17 |
| bird_student_club_04 | student_club | 3 |
| bird_student_club_05 | student_club | 1 |
| bird_student_club_06 | student_club | 1 |

## Per-Task Results

| Task | Dataset | System | Status | SQL exec | Equivalence | Actual rows | Comment |
|---|---|---|---|---:|---:|---:|---|
| bird_financial_01 | financial | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_02 | financial | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_03 | financial | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_04 | financial | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_05 | financial | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_06 | financial | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_01 | formula_1 | SkillGuidedAgentRepair | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Fisichella"]]; got sample [["Räikkönen"]]. |
| bird_formula_1_02 | formula_1 | SkillGuidedAgentRepair | match | 2 | 2 | 14 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_03 | formula_1 | SkillGuidedAgentRepair | match | 2 | 2 | 5 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_04 | formula_1 | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_05 | formula_1 | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_06 | formula_1 | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_card_games_01 | card_games | SkillGuidedAgentRepair | mismatch | 2 | 0 | 10000 | Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["_____"],["\"Ach! Hans, Run!\""],["Abandon Reason"],["Abandoned Outpost"],... |
| bird_card_games_02 | card_games | SkillGuidedAgentRepair | mismatch | 2 | 0 | 22 | Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // ... |
| bird_card_games_03 | card_games | SkillGuidedAgentRepair | mismatch | 2 | 0 | 2 | Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"]]. |
| bird_card_games_04 | card_games | SkillGuidedAgentRepair | mismatch | 2 | 0 | 2977 | Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus",... |
| bird_card_games_05 | card_games | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_card_games_06 | card_games | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_01 | european_football_2 | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_02 | european_football_2 | SkillGuidedAgentRepair | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]]. |
| bird_european_football_2_03 | european_football_2 | SkillGuidedAgentRepair | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [[3594]]; got sample [[619]]. |
| bird_european_football_2_04 | european_football_2 | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_05 | european_football_2 | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_06 | european_football_2 | SkillGuidedAgentRepair | match | 2 | 2 | 11 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_01 | student_club | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_02 | student_club | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_03 | student_club | SkillGuidedAgentRepair | match | 2 | 2 | 17 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_04 | student_club | SkillGuidedAgentRepair | match | 2 | 2 | 3 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_05 | student_club | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_06 | student_club | SkillGuidedAgentRepair | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
