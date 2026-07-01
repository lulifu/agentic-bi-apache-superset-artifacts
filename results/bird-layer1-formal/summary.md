# BIRD Layer-1 Formal Query Benchmark Summary

Generated: 2026-06-14T19:08:22.972Z
Tasks: 30

## Aggregate Scores

| System | Total | Executable | Exact match | Missing | SQL errors | Avg / 2 | Exact % |
|---|---:|---:|---:|---:|---:|---:|---:|
| DirectLLM | 30 | 9 | 3 | 0 | 21 | 0.40 | 10.0 |
| SchemaGroundedLLM | 30 | 28 | 19 | 0 | 2 | 1.57 | 63.3 |
| SkillGuidedAgent | 30 | 28 | 17 | 0 | 2 | 1.50 | 56.7 |

## Method

- Scope: 30 BIRD Layer-1 `query` tasks from `tasks/nl2bi-benchmark.csv`.
- Oracle: validated `ground_truth_sql_postgres` for each task.
- Execution: dev Superset SQL Lab against database `examples` (#1), with per-dataset Postgres schemas.
- Scoring: generated SQL receives 2 points for executing and 2 points for result-set equivalence; aggregate `Avg / 2` is averaged across the two dimensions.
- Result equivalence is strict: extra or missing output columns count as mismatches even when the leading value is correct.
- The SkillGuidedAgent query-only batch used schema/skill guidance but did not run a parent-controlled SQL repair loop; these numbers measure first-pass SQL generation.
- Raw per-task JSON outputs remain gitignored; this summary and the prefilled grading sheet are the commit-eligible artifacts.

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
| bird_financial_01 | financial | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON a.district_id = d.district_id WHERE... |
| bird_financial_02 | financial | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"a13\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level"... |
| bird_financial_03 | financial | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON a.district_id = d.district_id WHERE... |
| bird_financial_04 | financial | DirectLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_05 | financial | DirectLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_06 | financial | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON c.district_id = d.district_id WHERE... |
| bird_formula_1_01 | formula_1 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...ECT d.surname FROM qualifying q JOIN driver... |
| bird_formula_1_02 | formula_1 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.circuitid does not exist\nLINE 1: ...ear FROM races r JOIN circuits c ON c.circ... |
| bird_formula_1_03 | formula_1 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...T d.driverRef FROM qualifying q JOIN driver... |
| bird_formula_1_04 | formula_1 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.circuitid does not exist\nLINE 1: ...unt FROM races r JOIN circuits c ON c.circ... |
| bird_formula_1_05 | formula_1 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...ame, d.surname FROM results res JOIN driver... |
| bird_formula_1_06 | formula_1 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.raceid does not exist\nLINE 1: ...etion_percentage FROM results res JOIN races ... |
| bird_card_games_01 | card_games | DirectLLM | mismatch | 2 | 0 | 10000 | Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["Abandon Reason"],["Abandoned Sarcophagus"],["Abomination of Llanowar"],["... |
| bird_card_games_02 | card_games | DirectLLM | mismatch | 2 | 0 | 22 | Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // ... |
| bird_card_games_03 | card_games | DirectLLM | mismatch | 2 | 0 | 5 | Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"],["Oko, Thief of Crowns"],["Oko, Thief of Crown... |
| bird_card_games_04 | card_games | DirectLLM | mismatch | 2 | 0 | 3810 | Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus",... |
| bird_card_games_05 | card_games | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"language\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","l... |
| bird_card_games_06 | card_games | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"language\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","l... |
| bird_european_football_2_01 | european_football_2 | DirectLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_02 | european_football_2 | DirectLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]]. |
| bird_european_football_2_03 | european_football_2 | DirectLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [[3594]]; got sample [[619]]. |
| bird_european_football_2_04 | european_football_2 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS ... |
| bird_european_football_2_05 | european_football_2 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS ... |
| bird_european_football_2_06 | european_football_2 | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS ... |
| bird_student_club_01 | student_club | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error... |
| bird_student_club_02 | student_club | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error... |
| bird_student_club_03 | student_club | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error... |
| bird_student_club_04 | student_club | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column ex.event_id does not exist\nLINE 3: JOIN event AS e ON ex.event_id = e.event_id\n... |
| bird_student_club_05 | student_club | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column ex.event_id does not exist\nLINE 3: JOIN event AS e ON ex.event_id = e.event_id\n... |
| bird_student_club_06 | student_club | DirectLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column b.event_id does not exist\nLINE 4: JOIN event AS e ON b.event_id = e.event_id\n  ... |
| bird_financial_01 | financial | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_02 | financial | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_03 | financial | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_04 | financial | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_05 | financial | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_06 | financial | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_01 | formula_1 | SchemaGroundedLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Fisichella"]]; got sample [["Räikkönen"]]. |
| bird_formula_1_02 | formula_1 | SchemaGroundedLLM | match | 2 | 2 | 14 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_03 | formula_1 | SchemaGroundedLLM | match | 2 | 2 | 5 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_04 | formula_1 | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_05 | formula_1 | SchemaGroundedLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Jean-Pierre","Beltoise"]]; got sample [[306,"beltoise",null,null,"Jean-Pierre","Beltoise","1937-04-26","French","http://en.wikipedia.org/wiki... |
| bird_formula_1_06 | formula_1 | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_card_games_01 | card_games | SchemaGroundedLLM | mismatch | 2 | 0 | 10000 | Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["Abandon Reason"],["Abandoned Sarcophagus"],["Abomination of Llanowar"],["... |
| bird_card_games_02 | card_games | SchemaGroundedLLM | mismatch | 2 | 0 | 22 | Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // ... |
| bird_card_games_03 | card_games | SchemaGroundedLLM | mismatch | 2 | 0 | 2 | Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"]]. |
| bird_card_games_04 | card_games | SchemaGroundedLLM | mismatch | 2 | 0 | 2977 | Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus",... |
| bird_card_games_05 | card_games | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_card_games_06 | card_games | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_01 | european_football_2 | SchemaGroundedLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [[30981]]; got sample [[30981,94]]. |
| bird_european_football_2_02 | european_football_2 | SchemaGroundedLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]]. |
| bird_european_football_2_03 | european_football_2 | SchemaGroundedLLM | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [[3594]]; got sample [[733]]. |
| bird_european_football_2_04 | european_football_2 | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_05 | european_football_2 | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_06 | european_football_2 | SchemaGroundedLLM | match | 2 | 2 | 11 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_01 | student_club | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_02 | student_club | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_03 | student_club | SchemaGroundedLLM | match | 2 | 2 | 17 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_04 | student_club | SchemaGroundedLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...e.event_name = 'October Meeting' AND e.... |
| bird_student_club_05 | student_club | SchemaGroundedLLM | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...ption = 'Post Cards, Posters' AND ex.ex... |
| bird_student_club_06 | student_club | SchemaGroundedLLM | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_01 | financial | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_02 | financial | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_03 | financial | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_04 | financial | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_05 | financial | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_financial_06 | financial | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_01 | formula_1 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Fisichella"]]; got sample [["Räikkönen"]]. |
| bird_formula_1_02 | formula_1 | SkillGuidedAgent | match | 2 | 2 | 14 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_03 | formula_1 | SkillGuidedAgent | match | 2 | 2 | 5 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_04 | formula_1 | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_formula_1_05 | formula_1 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Jean-Pierre","Beltoise"]]; got sample [[306,"beltoise",null,null,"Jean-Pierre","Beltoise","1937-04-26","French","http://en.wikipedia.org/wiki... |
| bird_formula_1_06 | formula_1 | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_card_games_01 | card_games | SkillGuidedAgent | mismatch | 2 | 0 | 10000 | Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["_____"],["\"Ach! Hans, Run!\""],["Abandon Reason"],["Abandoned Outpost"],... |
| bird_card_games_02 | card_games | SkillGuidedAgent | mismatch | 2 | 0 | 22 | Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // ... |
| bird_card_games_03 | card_games | SkillGuidedAgent | mismatch | 2 | 0 | 2 | Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"]]. |
| bird_card_games_04 | card_games | SkillGuidedAgent | mismatch | 2 | 0 | 2977 | Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus",... |
| bird_card_games_05 | card_games | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_card_games_06 | card_games | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_european_football_2_01 | european_football_2 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [[30981]]; got sample [[30981,"Lionel Messi",94]]. |
| bird_european_football_2_02 | european_football_2 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]]. |
| bird_european_football_2_03 | european_football_2 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [[3594]]; got sample [[733]]. |
| bird_european_football_2_04 | european_football_2 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["Spain LIGA BBVA"]]; got sample [["Spain LIGA BBVA",1043]]. |
| bird_european_football_2_05 | european_football_2 | SkillGuidedAgent | mismatch | 2 | 0 | 1 | Result mismatch. Expected sample [["France Ligue 1"]]; got sample [["France Ligue 1",108]]. |
| bird_european_football_2_06 | european_football_2 | SkillGuidedAgent | match | 2 | 2 | 11 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_01 | student_club | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_02 | student_club | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_03 | student_club | SkillGuidedAgent | match | 2 | 2 | 17 | Generated SQL executed and matched the PostgreSQL oracle result set. |
| bird_student_club_04 | student_club | SkillGuidedAgent | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ....event_name = 'October Meeting' AND ev.... |
| bird_student_club_05 | student_club | SkillGuidedAgent | exec_error | 0 | 0 |  | POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...tion = 'Post Cards, Posters' AND exp.ex... |
| bird_student_club_06 | student_club | SkillGuidedAgent | match | 2 | 2 | 1 | Generated SQL executed and matched the PostgreSQL oracle result set. |
