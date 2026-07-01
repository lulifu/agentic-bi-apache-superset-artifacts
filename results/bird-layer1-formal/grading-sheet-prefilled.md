# Prefilled Grading Sheet - BIRD Layer-1 Formal Query Benchmark - 2026-06-14

This sheet is deterministic: every score below comes from SQL Lab execution and result-set comparison against the validated PostgreSQL oracle.

---

## task: bird_financial_01 | system: DirectLLM

Dataset: financial
NL request: How many accounts who have region in Prague are eligible for loans?

Generated SQL:
```sql
SELECT COUNT(*) AS account_count FROM account AS a JOIN loan AS l ON a.account_id = l.account_id JOIN district AS d ON a.district_id = d.district_id WHERE d.A3 = 'Prague';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON a.district_id = d.district_id WHERE d.A3 = 'Pr...\n                                                             ^\nHINT:  Perhaps you meant to reference th...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON a.district_id = d.district_id WHERE d.A3 = 'Pr...\n                                                             ^\nHINT:  Perhaps you meant to reference th...

Average score: 0.00 / 2

---

## task: bird_financial_02 | system: DirectLLM

Dataset: financial
NL request: The average unemployment ratio of 1995 and 1996, which one has higher percentage?

Generated SQL:
```sql
SELECT CASE WHEN AVG(A13) > AVG(A12) THEN '1996' ELSE '1995' END AS higher_average_unemployment_year FROM district;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"a13\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1003,"message":"Issue 1003 - There is a syntax error...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"a13\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1003,"message":"Issue 1003 - There is a syntax error...

Average score: 0.00 / 2

---

## task: bird_financial_03 | system: DirectLLM

Dataset: financial
NL request: How many accounts who choose issuance after transaction are staying in East Bohemia region?

Generated SQL:
```sql
SELECT COUNT(*) AS account_count FROM account AS a JOIN district AS d ON a.district_id = d.district_id WHERE d.A3 = 'east Bohemia' AND a.frequency = 'POPLATEK PO OBRATU';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON a.district_id = d.district_id WHERE d.A3 = 'ea...\n                                                             ^\nHINT:  Perhaps you meant to reference th...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON a.district_id = d.district_id WHERE d.A3 = 'ea...\n                                                             ^\nHINT:  Perhaps you meant to reference th...

Average score: 0.00 / 2

---

## task: bird_financial_04 | system: DirectLLM

Dataset: financial
NL request: Among the accounts who have approved loan date in 1997, list out the accounts that have the lowest approved amount and choose weekly issuance statement.

Generated SQL:
```sql
SELECT a.account_id FROM account AS a JOIN loan AS l ON a.account_id = l.account_id WHERE EXTRACT(YEAR FROM CAST(l.date AS DATE)) = 1997 AND a.frequency = 'POPLATEK TYDNE' ORDER BY l.amount ASC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_05 | system: DirectLLM

Dataset: financial
NL request: What is the percentage of loan amount that has been fully paid with no issue.

Generated SQL:
```sql
SELECT 100.0 * SUM(CASE WHEN status = 'A' THEN amount ELSE 0 END) / NULLIF(SUM(amount), 0) AS pct_amount_fully_paid_no_issue FROM loan;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_06 | system: DirectLLM

Dataset: financial
NL request: For the branch which located in the south Bohemia with biggest number of inhabitants, what is the percentage of the male clients?

Generated SQL:
```sql
SELECT 100.0 * SUM(CASE WHEN c.gender = 'M' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) AS pct_male_clients FROM client AS c JOIN district AS d ON c.district_id = d.district_id WHERE d.A3 = 'south Bohemia' AND CAST(d.A4 AS INTEGER) = (SELECT MAX(CAST(A4 AS INTEGER)) FROM district WHERE A3 = 'south Bohemia');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON c.district_id = d.district_id WHERE d.A3 = 'so...\n                                                             ^\nHINT:  Perhaps you meant to reference th...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.a3 does not exist\nLINE 1: ...trict AS d ON c.district_id = d.district_id WHERE d.A3 = 'so...\n                                                             ^\nHINT:  Perhaps you meant to reference th...

Average score: 0.00 / 2

---

## task: bird_formula_1_01 | system: DirectLLM

Dataset: formula_1
NL request: What is the surname of the driver with the best lap time in race number 19 in the second qualifying period?

Generated SQL:
```sql
SELECT d.surname FROM qualifying q JOIN drivers d ON d.driverId = q.driverId WHERE q.raceId = 19 AND q.q2 IS NOT NULL AND q.q2 <> '' ORDER BY q.q2 ASC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...ECT d.surname FROM qualifying q JOIN drivers d ON d.driverId...\n                                                             ^\nHINT:  Perhaps you meant to refere...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...ECT d.surname FROM qualifying q JOIN drivers d ON d.driverId...\n                                                             ^\nHINT:  Perhaps you meant to refere...

Average score: 0.00 / 2

---

## task: bird_formula_1_02 | system: DirectLLM

Dataset: formula_1
NL request: Please list the year during which the race is held on circuits in Shanghai.

Generated SQL:
```sql
SELECT DISTINCT r.year FROM races r JOIN circuits c ON c.circuitId = r.circuitId WHERE c.location = 'Shanghai' ORDER BY r.year;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.circuitid does not exist\nLINE 1: ...ear FROM races r JOIN circuits c ON c.circuitId = r.circuitI...\n                                                             ^\nHINT:  Perhaps you meant to refer...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.circuitid does not exist\nLINE 1: ...ear FROM races r JOIN circuits c ON c.circuitId = r.circuitI...\n                                                             ^\nHINT:  Perhaps you meant to refer...

Average score: 0.00 / 2

---

## task: bird_formula_1_03 | system: DirectLLM

Dataset: formula_1
NL request: Please list the reference names of the drivers who are eliminated in the first period in race number 20.

Generated SQL:
```sql
SELECT d.driverRef FROM qualifying q JOIN drivers d ON d.driverId = q.driverId WHERE q.raceId = 20 AND q.q1 IS NOT NULL AND q.q1 <> '' ORDER BY q.q1 DESC LIMIT 5;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...T d.driverRef FROM qualifying q JOIN drivers d ON d.driverId...\n                                                             ^\nHINT:  Perhaps you meant to refere...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...T d.driverRef FROM qualifying q JOIN drivers d ON d.driverId...\n                                                             ^\nHINT:  Perhaps you meant to refere...

Average score: 0.00 / 2

---

## task: bird_formula_1_04 | system: DirectLLM

Dataset: formula_1
NL request: How many races in the year 2010 are held on grand prixs outside Asia and Europe?

Generated SQL:
```sql
SELECT COUNT(*) AS race_count FROM races r JOIN circuits c ON c.circuitId = r.circuitId WHERE r.year = 2010 AND c.country IN ('Australia', 'Brazil', 'Canada', 'USA', 'Mexico', 'Argentina', 'South Africa', 'Morocco');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.circuitid does not exist\nLINE 1: ...unt FROM races r JOIN circuits c ON c.circuitId = r.circuitI...\n                                                             ^\nHINT:  Perhaps you meant to refer...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.circuitid does not exist\nLINE 1: ...unt FROM races r JOIN circuits c ON c.circuitId = r.circuitI...\n                                                             ^\nHINT:  Perhaps you meant to refer...

Average score: 0.00 / 2

---

## task: bird_formula_1_05 | system: DirectLLM

Dataset: formula_1
NL request: For all the drivers who finished the game in race No. 592, who is the oldest?

Generated SQL:
```sql
SELECT d.forename, d.surname FROM results res JOIN drivers d ON d.driverId = res.driverId WHERE res.raceId = 592 AND res.time IS NOT NULL AND res.time <> '' ORDER BY d.dob ASC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...ame, d.surname FROM results res JOIN drivers d ON d.driverId...\n                                                             ^\nHINT:  Perhaps you meant to refere...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column d.driverid does not exist\nLINE 1: ...ame, d.surname FROM results res JOIN drivers d ON d.driverId...\n                                                             ^\nHINT:  Perhaps you meant to refere...

Average score: 0.00 / 2

---

## task: bird_formula_1_06 | system: DirectLLM

Dataset: formula_1
NL request: Please calculate the race completion percentage of Japanese drivers from 2007 to 2009.

Generated SQL:
```sql
SELECT COUNT(CASE WHEN res.time IS NOT NULL AND res.time <> '' THEN res.driverId END) * 100.0 / COUNT(res.driverId) AS completion_percentage FROM results res JOIN races r ON r.raceId = res.raceId JOIN drivers d ON d.driverId = res.driverId WHERE d.nationality = 'Japanese' AND r.year BETWEEN 2007 AND 2009;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.raceid does not exist\nLINE 1: ...etion_percentage FROM results res JOIN races r ON r.raceId =...\n                                                             ^\nHINT:  Perhaps you meant to referenc...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column r.raceid does not exist\nLINE 1: ...etion_percentage FROM results res JOIN races r ON r.raceId =...\n                                                             ^\nHINT:  Perhaps you meant to referenc...

Average score: 0.00 / 2

---

## task: bird_card_games_01 | system: DirectLLM

Dataset: card_games
NL request: Which are the cards that have incredibly powerful foils.

Generated SQL:
```sql
SELECT name FROM cards WHERE cardKingdomFoilId IS NOT NULL AND cardKingdomId IS NOT NULL;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["Abandon Reason"],["Abandoned Sarcophagus"],["Abomination of Llanowar"],["Abrade"],["Abrade"],["Abrade"],["Absolver Thrull"],["Absorb Vis"]].

Average score: 1.00 / 2

---

## task: bird_card_games_02 | system: DirectLLM

Dataset: card_games
NL request: List the card names with value that cost more converted mana for the face.

Generated SQL:
```sql
SELECT name, faceConvertedManaCost FROM cards WHERE faceConvertedManaCost = (SELECT MAX(faceConvertedManaCost) FROM cards);
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Elbrus, th...

Average score: 1.00 / 2

---

## task: bird_card_games_03 | system: DirectLLM

Dataset: card_games
NL request: List all the mythic rarity print cards banned in gladiator format.

Generated SQL:
```sql
SELECT c.name FROM cards AS c JOIN legalities AS l ON c.uuid = l.uuid WHERE c.rarity = 'mythic' AND l.status = 'Banned' AND l.format = 'gladiator';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"],["Oko, Thief of Crowns"],["Oko, Thief of Crowns"],["Oko, Thief of Crowns"]].

Average score: 1.00 / 2

---

## task: bird_card_games_04 | system: DirectLLM

Dataset: card_games
NL request: For artifact type of cards that do not have multiple faces on the same card, state its legalities status for vintage play format.

Generated SQL:
```sql
SELECT c.name, l.status FROM cards AS c JOIN legalities AS l ON c.uuid = l.uuid WHERE c.types = 'Artifact' AND c.side IS NULL AND l.format = 'vintage';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abzan Banner","Legal"],["Accorder's Shield","Legal"],["Accorder's Shield","...

Average score: 1.00 / 2

---

## task: bird_card_games_05 | system: DirectLLM

Dataset: card_games
NL request: Calculate the percentage of the cards availabe in Chinese Simplified.

Generated SQL:
```sql
SELECT SUM(CASE WHEN language = 'Chinese Simplified' THEN 1 ELSE 0 END) * 100.0 / COUNT(id) AS percentage FROM cards;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"language\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1003,"message":"Issue 1003 - There is a syntax ...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"language\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1003,"message":"Issue 1003 - There is a syntax ...

Average score: 0.00 / 2

---

## task: bird_card_games_06 | system: DirectLLM

Dataset: card_games
NL request: What is the percentage of cards whose language is French among the Story Spotlight cards?

Generated SQL:
```sql
SELECT COUNT(CASE WHEN language = 'French' AND isStorySpotlight = 1 THEN id END) * 100.0 / COUNT(CASE WHEN isStorySpotlight = 1 THEN id END) AS percentage FROM cards;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"language\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1003,"message":"Issue 1003 - There is a syntax ...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"We can't seem to resolve the column \"language\" at line 1.","error_type":"COLUMN_DOES_NOT_EXIST_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1003,"message":"Issue 1003 - There is a syntax ...

Average score: 0.00 / 2

---

## task: bird_european_football_2_01 | system: DirectLLM

Dataset: european_football_2
NL request: Which player has the highest overall rating? Indicate the player's api id.

Generated SQL:
```sql
SELECT DISTINCT player_api_id FROM Player_Attributes WHERE overall_rating = (SELECT MAX(overall_rating) FROM Player_Attributes);
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_european_football_2_02 | system: DirectLLM

Dataset: european_football_2
NL request: What is the height of the tallest player? Indicate his name.

Generated SQL:
```sql
SELECT player_name, height FROM Player WHERE height = (SELECT MAX(height) FROM Player);
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_03 | system: DirectLLM

Dataset: european_football_2
NL request: Among the players with an overall rating between 60 to 65, how many players whose going to be in all of your attack moves instead of defensing?

Generated SQL:
```sql
SELECT COUNT(DISTINCT player_api_id) AS player_count FROM Player_Attributes WHERE overall_rating >= 60 AND overall_rating < 65 AND defensive_work_rate = 'low';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[3594]]; got sample [[619]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_04 | system: DirectLLM

Dataset: european_football_2
NL request: Give the name of the league had the most goals in the 2016 season?

Generated SQL:
```sql
SELECT l.name FROM Match AS m JOIN League AS l ON m.league_id = l.id WHERE m.season = '2015/2016' GROUP BY l.id, l.name ORDER BY SUM(m.home_team_goal + m.away_team_goal) DESC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS l ON m.league_i...\n                           ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"eng...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS l ON m.league_i...\n                           ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"eng...

Average score: 0.00 / 2

---

## task: bird_european_football_2_05 | system: DirectLLM

Dataset: european_football_2
NL request: Give the name of the league had the most matches end as draw in the 2016 season?

Generated SQL:
```sql
SELECT l.name FROM Match AS m JOIN League AS l ON m.league_id = l.id WHERE m.season = '2015/2016' GROUP BY l.id, l.name ORDER BY SUM((m.home_team_goal = m.away_team_goal)::int) DESC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS l ON m.league_i...\n                           ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"eng...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS l ON m.league_i...\n                           ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"eng...

Average score: 0.00 / 2

---

## task: bird_european_football_2_06 | system: DirectLLM

Dataset: european_football_2
NL request: List the name of leagues in which the average goals by the home team is higher than the away team in the 2009/2010 season.

Generated SQL:
```sql
SELECT l.name FROM Match AS m JOIN League AS l ON m.league_id = l.id WHERE m.season = '2009/2010' GROUP BY l.id, l.name HAVING SUM(m.home_team_goal)::numeric / COUNT(DISTINCT m.id) > SUM(m.away_team_goal)::numeric / COUNT(DISTINCT m.id);
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS l ON m.league_i...\n                           ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"eng...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"match\" does not exist\nLINE 1: SELECT l.name FROM Match AS m JOIN League AS l ON m.league_i...\n                           ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"eng...

Average score: 0.00 / 2

---

## task: bird_student_club_01 | system: DirectLLM

Dataset: student_club
NL request: What's Angela Sanders's major?

Generated SQL:
```sql
SELECT m.major_name
FROM student AS s
JOIN major AS m ON s.major_id = m.major_id
WHERE s.first_name = 'Angela' AND s.last_name = 'Sanders';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1002,"messag...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1002,"messag...

Average score: 0.00 / 2

---

## task: bird_student_club_02 | system: DirectLLM

Dataset: student_club
NL request: How many students in the Student_Club are from the College of Engineering?

Generated SQL:
```sql
SELECT COUNT(*)
FROM student AS s
JOIN major AS m ON s.major_id = m.major_id
WHERE m.college = 'College of Engineering';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1002,"messag...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1002,"messag...

Average score: 0.00 / 2

---

## task: bird_student_club_03 | system: DirectLLM

Dataset: student_club
NL request: Please list the phone numbers of the students from the Student_Club that has attended the event "Women's Soccer".

Generated SQL:
```sql
SELECT DISTINCT s.phone
FROM student AS s
JOIN attendance AS a ON s.student_id = a.student_id
JOIN event AS e ON a.event_id = e.event_id
WHERE e.event_name = 'Women''s Soccer';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1002,"messag...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: relation \"student\" does not exist\nLINE 2: FROM student AS s\n             ^\n","error_type":"GENERIC_DB_ENGINE_ERROR","level":"error","extra":{"engine_name":"PostgreSQL","issue_codes":[{"code":1002,"messag...

Average score: 0.00 / 2

---

## task: bird_student_club_04 | system: DirectLLM

Dataset: student_club
NL request: Was each expense in October Meeting on October 8, 2019 approved?

Generated SQL:
```sql
SELECT ex.expense_id, ex.approved
FROM expense AS ex
JOIN event AS e ON ex.event_id = e.event_id
WHERE e.event_name = 'October Meeting'
  AND e.event_date = DATE '2019-10-08';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column ex.event_id does not exist\nLINE 3: JOIN event AS e ON ex.event_id = e.event_id\n                           ^\nHINT:  Perhaps you meant to reference the column \"e.event_id\".\n","error_type":"GENERIC_...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column ex.event_id does not exist\nLINE 3: JOIN event AS e ON ex.event_id = e.event_id\n                           ^\nHINT:  Perhaps you meant to reference the column \"e.event_id\".\n","error_type":"GENERIC_...

Average score: 0.00 / 2

---

## task: bird_student_club_05 | system: DirectLLM

Dataset: student_club
NL request: What is the status of the event which bought "Post Cards, Posters" on 2019/8/20?

Generated SQL:
```sql
SELECT e.event_status
FROM expense AS ex
JOIN event AS e ON ex.event_id = e.event_id
WHERE ex.description = 'Post Cards, Posters'
  AND ex.expense_date = DATE '2019-08-20';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column ex.event_id does not exist\nLINE 3: JOIN event AS e ON ex.event_id = e.event_id\n                           ^\nHINT:  Perhaps you meant to reference the column \"e.event_id\".\n","error_type":"GENERIC_...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column ex.event_id does not exist\nLINE 3: JOIN event AS e ON ex.event_id = e.event_id\n                           ^\nHINT:  Perhaps you meant to reference the column \"e.event_id\".\n","error_type":"GENERIC_...

Average score: 0.00 / 2

---

## task: bird_student_club_06 | system: DirectLLM

Dataset: student_club
NL request: How many times was the budget in Advertisement for "Yearly Kickoff" meeting more than "October Meeting"?

Generated SQL:
```sql
SELECT SUM(CASE WHEN e.event_name = 'Yearly Kickoff' THEN b.amount ELSE 0 END)::numeric
       / NULLIF(SUM(CASE WHEN e.event_name = 'October Meeting' THEN b.amount ELSE 0 END), 0) AS times_more
FROM budget AS b
JOIN event AS e ON b.event_id = e.event_id
WHERE b.category = 'Advertisement'
  AND e.event_name IN ('Yearly Kickoff', 'October Meeting');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column b.event_id does not exist\nLINE 4: JOIN event AS e ON b.event_id = e.event_id\n                           ^\nHINT:  Perhaps you meant to reference the column \"e.event_id\".\n","error_type":"GENERIC_DB...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: column b.event_id does not exist\nLINE 4: JOIN event AS e ON b.event_id = e.event_id\n                           ^\nHINT:  Perhaps you meant to reference the column \"e.event_id\".\n","error_type":"GENERIC_DB...

Average score: 0.00 / 2

---

## task: bird_financial_01 | system: SchemaGroundedLLM

Dataset: financial
NL request: How many accounts who have region in Prague are eligible for loans?

Generated SQL:
```sql
SELECT COUNT(T1.account_id) AS account_count FROM account AS T1 INNER JOIN loan AS T2 ON T1.account_id = T2.account_id INNER JOIN district AS T3 ON T1.district_id = T3.district_id WHERE T3."A3" = 'Prague';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_02 | system: SchemaGroundedLLM

Dataset: financial
NL request: The average unemployment ratio of 1995 and 1996, which one has higher percentage?

Generated SQL:
```sql
SELECT CASE WHEN AVG("A13") > AVG("A12") THEN '1996' ELSE '1995' END AS higher_unemployment_year FROM district;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_03 | system: SchemaGroundedLLM

Dataset: financial
NL request: How many accounts who choose issuance after transaction are staying in East Bohemia region?

Generated SQL:
```sql
SELECT COUNT(T2.account_id) AS account_count FROM district AS T1 INNER JOIN account AS T2 ON T1.district_id = T2.district_id WHERE T1."A3" = 'east Bohemia' AND T2.frequency = 'POPLATEK PO OBRATU';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_04 | system: SchemaGroundedLLM

Dataset: financial
NL request: Among the accounts who have approved loan date in 1997, list out the accounts that have the lowest approved amount and choose weekly issuance statement.

Generated SQL:
```sql
SELECT T2.account_id FROM loan AS T1 INNER JOIN account AS T2 ON T1.account_id = T2.account_id WHERE EXTRACT(YEAR FROM T1.date) = 1997 AND T2.frequency = 'POPLATEK TYDNE' ORDER BY T1.amount LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_05 | system: SchemaGroundedLLM

Dataset: financial
NL request: What is the percentage of loan amount that has been fully paid with no issue.

Generated SQL:
```sql
SELECT (CAST(SUM(CASE WHEN status = 'A' THEN amount ELSE 0 END) AS DOUBLE PRECISION) * 100.0) / NULLIF(SUM(amount), 0) AS fully_paid_no_issue_amount_pct FROM loan;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_06 | system: SchemaGroundedLLM

Dataset: financial
NL request: For the branch which located in the south Bohemia with biggest number of inhabitants, what is the percentage of the male clients?

Generated SQL:
```sql
WITH target_district AS (SELECT district_id FROM district WHERE "A3" = 'south Bohemia' ORDER BY CAST("A4" AS INTEGER) DESC LIMIT 1) SELECT CAST(SUM(CASE WHEN c.gender = 'M' THEN 1 ELSE 0 END) AS DOUBLE PRECISION) * 100.0 / NULLIF(COUNT(c.client_id), 0) AS male_client_pct FROM client AS c INNER JOIN target_district AS d ON c.district_id = d.district_id;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_01 | system: SchemaGroundedLLM

Dataset: formula_1
NL request: What is the surname of the driver with the best lap time in race number 19 in the second qualifying period?

Generated SQL:
```sql
SELECT d.surname FROM qualifying q JOIN drivers d ON q."driverId" = d."driverId" WHERE q."raceId" = 19 AND q.q2 = (SELECT MIN(q2) FROM qualifying WHERE "raceId" = 19 AND q2 IS NOT NULL AND q2 <> '\N');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Fisichella"]]; got sample [["Räikkönen"]].

Average score: 1.00 / 2

---

## task: bird_formula_1_02 | system: SchemaGroundedLLM

Dataset: formula_1
NL request: Please list the year during which the race is held on circuits in Shanghai.

Generated SQL:
```sql
SELECT DISTINCT r.year FROM races r JOIN circuits c ON r."circuitId" = c.circuitid WHERE c.location = 'Shanghai' ORDER BY r.year;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_03 | system: SchemaGroundedLLM

Dataset: formula_1
NL request: Please list the reference names of the drivers who are eliminated in the first period in race number 20.

Generated SQL:
```sql
SELECT d."driverRef" FROM qualifying q JOIN drivers d ON q."driverId" = d."driverId" WHERE q."raceId" = 20 AND q.q1 IS NOT NULL AND q.q1 <> '\N' ORDER BY q.q1 DESC LIMIT 5;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_04 | system: SchemaGroundedLLM

Dataset: formula_1
NL request: How many races in the year 2010 are held on grand prixs outside Asia and Europe?

Generated SQL:
```sql
SELECT COUNT(*) AS race_count FROM races r JOIN circuits c ON r."circuitId" = c.circuitid WHERE r.year = 2010 AND c.country NOT IN ('Bahrain','China','Japan','Korea','Malaysia','Singapore','Turkey','UAE','UK','Spain','Monaco','Belgium','Italy','Germany','Hungary','Europe');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_05 | system: SchemaGroundedLLM

Dataset: formula_1
NL request: For all the drivers who finished the game in race No. 592, who is the oldest?

Generated SQL:
```sql
SELECT d.* FROM results res JOIN drivers d ON res."driverId" = d."driverId" WHERE res."raceId" = 592 AND res.time IS NOT NULL ORDER BY d.dob ASC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Jean-Pierre","Beltoise"]]; got sample [[306,"beltoise",null,null,"Jean-Pierre","Beltoise","1937-04-26","French","http://en.wikipedia.org/wiki/Jean-Pierre_Beltoise"]].

Average score: 1.00 / 2

---

## task: bird_formula_1_06 | system: SchemaGroundedLLM

Dataset: formula_1
NL request: Please calculate the race completion percentage of Japanese drivers from 2007 to 2009.

Generated SQL:
```sql
SELECT 100.0 * SUM(CASE WHEN res.time IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) AS completion_percentage FROM results res JOIN drivers d ON res."driverId" = d."driverId" JOIN races r ON res."raceId" = r."raceId" WHERE d.nationality = 'Japanese' AND r.year BETWEEN 2007 AND 2009;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_card_games_01 | system: SchemaGroundedLLM

Dataset: card_games
NL request: Which are the cards that have incredibly powerful foils.

Generated SQL:
```sql
SELECT name FROM cards WHERE cardkingdomfoilid IS NOT NULL AND cardkingdomid IS NOT NULL;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["Abandon Reason"],["Abandoned Sarcophagus"],["Abomination of Llanowar"],["Abrade"],["Abrade"],["Abrade"],["Absolver Thrull"],["Absorb Vis"]].

Average score: 1.00 / 2

---

## task: bird_card_games_02 | system: SchemaGroundedLLM

Dataset: card_games
NL request: List the card names with value that cost more converted mana for the face.

Generated SQL:
```sql
SELECT name, faceconvertedmanacost FROM cards WHERE faceconvertedmanacost = (SELECT MAX(faceconvertedmanacost) FROM cards);
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Elbrus, th...

Average score: 1.00 / 2

---

## task: bird_card_games_03 | system: SchemaGroundedLLM

Dataset: card_games
NL request: List all the mythic rarity print cards banned in gladiator format.

Generated SQL:
```sql
SELECT DISTINCT c.name FROM cards c JOIN legalities l ON c.uuid = l.uuid WHERE c.rarity = 'mythic' AND l.status = 'Banned' AND l.format = 'gladiator';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"]].

Average score: 1.00 / 2

---

## task: bird_card_games_04 | system: SchemaGroundedLLM

Dataset: card_games
NL request: For artifact type of cards that do not have multiple faces on the same card, state its legalities status for vintage play format.

Generated SQL:
```sql
SELECT c.name, l.status FROM cards c JOIN legalities l ON c.uuid = l.uuid WHERE c.type = 'Artifact' AND c.side IS NULL AND l.format = 'vintage';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abzan Banner","Legal"],["Acidic Dagger","Legal"],["Acorn Catapult","Legal"]...

Average score: 1.00 / 2

---

## task: bird_card_games_05 | system: SchemaGroundedLLM

Dataset: card_games
NL request: Calculate the percentage of the cards availabe in Chinese Simplified.

Generated SQL:
```sql
SELECT 100.0 * COUNT(*) FILTER (WHERE fd.language = 'Chinese Simplified') / NULLIF(COUNT(*), 0) AS percentage FROM cards c JOIN foreign_data fd ON c.uuid = fd.uuid;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_card_games_06 | system: SchemaGroundedLLM

Dataset: card_games
NL request: What is the percentage of cards whose language is French among the Story Spotlight cards?

Generated SQL:
```sql
SELECT 100.0 * COUNT(*) FILTER (WHERE fd.language = 'French') / NULLIF(COUNT(*), 0) AS percentage FROM cards c JOIN foreign_data fd ON c.uuid = fd.uuid WHERE c.isstoryspotlight = 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_european_football_2_01 | system: SchemaGroundedLLM

Dataset: european_football_2
NL request: Which player has the highest overall rating? Indicate the player's api id.

Generated SQL:
```sql
SELECT player_api_id, overall_rating FROM player_attributes ORDER BY overall_rating DESC NULLS LAST LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[30981]]; got sample [[30981,94]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_02 | system: SchemaGroundedLLM

Dataset: european_football_2
NL request: What is the height of the tallest player? Indicate his name.

Generated SQL:
```sql
SELECT player_name, height FROM player ORDER BY height DESC NULLS LAST LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_03 | system: SchemaGroundedLLM

Dataset: european_football_2
NL request: Among the players with an overall rating between 60 to 65, how many players whose going to be in all of your attack moves instead of defensing?

Generated SQL:
```sql
SELECT COUNT(DISTINCT player_api_id) AS player_count FROM player_attributes WHERE overall_rating BETWEEN 60 AND 65 AND defensive_work_rate = 'low';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[3594]]; got sample [[733]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_04 | system: SchemaGroundedLLM

Dataset: european_football_2
NL request: Give the name of the league had the most goals in the 2016 season?

Generated SQL:
```sql
SELECT l.name FROM league AS l JOIN "Match" AS m ON m.league_id = l.id WHERE m.season = '2015/2016' GROUP BY l.id, l.name ORDER BY SUM(m.home_team_goal + m.away_team_goal) DESC NULLS LAST LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_european_football_2_05 | system: SchemaGroundedLLM

Dataset: european_football_2
NL request: Give the name of the league had the most matches end as draw in the 2016 season?

Generated SQL:
```sql
SELECT l.name FROM league AS l JOIN "Match" AS m ON m.league_id = l.id WHERE m.season = '2015/2016' AND m.home_team_goal = m.away_team_goal GROUP BY l.id, l.name ORDER BY COUNT(*) DESC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_european_football_2_06 | system: SchemaGroundedLLM

Dataset: european_football_2
NL request: List the name of leagues in which the average goals by the home team is higher than the away team in the 2009/2010 season.

Generated SQL:
```sql
SELECT l.name FROM league AS l JOIN "Match" AS m ON m.league_id = l.id WHERE m.season = '2009/2010' GROUP BY l.id, l.name HAVING SUM(m.home_team_goal)::numeric / COUNT(DISTINCT m.id) > SUM(m.away_team_goal)::numeric / COUNT(DISTINCT m.id);
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_01 | system: SchemaGroundedLLM

Dataset: student_club
NL request: What's Angela Sanders's major?

Generated SQL:
```sql
SELECT mj.major_name FROM member AS m JOIN major AS mj ON m.link_to_major = mj.major_id WHERE m.first_name = 'Angela' AND m.last_name = 'Sanders';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_02 | system: SchemaGroundedLLM

Dataset: student_club
NL request: How many students in the Student_Club are from the College of Engineering?

Generated SQL:
```sql
SELECT COUNT(*) AS student_count FROM member AS m JOIN major AS mj ON m.link_to_major = mj.major_id WHERE mj.college = 'College of Engineering';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_03 | system: SchemaGroundedLLM

Dataset: student_club
NL request: Please list the phone numbers of the students from the Student_Club that has attended the event "Women's Soccer".

Generated SQL:
```sql
SELECT DISTINCT m.phone FROM member AS m JOIN attendance AS a ON m.member_id = a.link_to_member JOIN event AS e ON a.link_to_event = e.event_id WHERE e.event_name = 'Women''s Soccer';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_04 | system: SchemaGroundedLLM

Dataset: student_club
NL request: Was each expense in October Meeting on October 8, 2019 approved?

Generated SQL:
```sql
SELECT ex.expense_id, ex.expense_description, ex.expense_date, ex.approved FROM event AS e JOIN budget AS b ON e.event_id = b.link_to_event JOIN expense AS ex ON b.budget_id = ex.link_to_budget WHERE e.event_name = 'October Meeting' AND e.event_date = DATE '2019-10-08';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...e.event_name = 'October Meeting' AND e.event_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...e.event_name = 'October Meeting' AND e.event_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

Average score: 0.00 / 2

---

## task: bird_student_club_05 | system: SchemaGroundedLLM

Dataset: student_club
NL request: What is the status of the event which bought "Post Cards, Posters" on 2019/8/20?

Generated SQL:
```sql
SELECT DISTINCT b.event_status FROM expense AS ex JOIN budget AS b ON ex.link_to_budget = b.budget_id WHERE ex.expense_description = 'Post Cards, Posters' AND ex.expense_date = DATE '2019-08-20';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...ption = 'Post Cards, Posters' AND ex.expense_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...ption = 'Post Cards, Posters' AND ex.expense_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

Average score: 0.00 / 2

---

## task: bird_student_club_06 | system: SchemaGroundedLLM

Dataset: student_club
NL request: How many times was the budget in Advertisement for "Yearly Kickoff" meeting more than "October Meeting"?

Generated SQL:
```sql
SELECT SUM(CASE WHEN e.event_name = 'Yearly Kickoff' THEN b.amount ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN e.event_name = 'October Meeting' THEN b.amount ELSE 0 END), 0) AS times_more FROM budget AS b JOIN event AS e ON b.link_to_event = e.event_id WHERE b.category = 'Advertisement' AND e.event_name IN ('Yearly Kickoff', 'October Meeting');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_01 | system: SkillGuidedAgent

Dataset: financial
NL request: How many accounts who have region in Prague are eligible for loans?

Generated SQL:
```sql
SELECT COUNT(T1.account_id) FROM account AS T1 INNER JOIN loan AS T2 ON T1.account_id = T2.account_id INNER JOIN district AS T3 ON T1.district_id = T3.district_id WHERE T3."A3" = 'Prague';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_02 | system: SkillGuidedAgent

Dataset: financial
NL request: The average unemployment ratio of 1995 and 1996, which one has higher percentage?

Generated SQL:
```sql
SELECT DISTINCT CASE WHEN AVG("A13") > AVG("A12") THEN '1996' ELSE '1995' END FROM district;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_03 | system: SkillGuidedAgent

Dataset: financial
NL request: How many accounts who choose issuance after transaction are staying in East Bohemia region?

Generated SQL:
```sql
SELECT COUNT(T2.account_id) FROM district AS T1 INNER JOIN account AS T2 ON T1.district_id = T2.district_id WHERE T1."A3" = 'east Bohemia' AND T2.frequency = 'POPLATEK PO OBRATU';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_04 | system: SkillGuidedAgent

Dataset: financial
NL request: Among the accounts who have approved loan date in 1997, list out the accounts that have the lowest approved amount and choose weekly issuance statement.

Generated SQL:
```sql
SELECT T2.account_id FROM loan AS T1 INNER JOIN account AS T2 ON T1.account_id = T2.account_id WHERE EXTRACT(YEAR FROM CAST(T1.date AS DATE)) = 1997 AND T2.frequency = 'POPLATEK TYDNE' ORDER BY T1.amount LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_05 | system: SkillGuidedAgent

Dataset: financial
NL request: What is the percentage of loan amount that has been fully paid with no issue.

Generated SQL:
```sql
SELECT (CAST(SUM(CASE WHEN status = 'A' THEN amount ELSE 0 END) AS DOUBLE PRECISION) * 100) / SUM(amount) FROM loan;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_financial_06 | system: SkillGuidedAgent

Dataset: financial
NL request: For the branch which located in the south Bohemia with biggest number of inhabitants, what is the percentage of the male clients?

Generated SQL:
```sql
SELECT CAST(SUM(CASE WHEN T1.gender = 'M' THEN 1 ELSE 0 END) AS DOUBLE PRECISION) * 100 / COUNT(T1.client_id) FROM client AS T1 INNER JOIN district AS T2 ON T1.district_id = T2.district_id WHERE T2."A3" = 'south Bohemia' GROUP BY T2."A4" ORDER BY CAST(T2."A4" AS INTEGER) DESC LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_01 | system: SkillGuidedAgent

Dataset: formula_1
NL request: What is the surname of the driver with the best lap time in race number 19 in the second qualifying period?

Generated SQL:
```sql
SELECT d.surname
FROM qualifying q
JOIN drivers d ON q."driverId" = d."driverId"
WHERE q."raceId" = 19
  AND q.q2 IS NOT NULL
ORDER BY q.q2 ASC
LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Fisichella"]]; got sample [["Räikkönen"]].

Average score: 1.00 / 2

---

## task: bird_formula_1_02 | system: SkillGuidedAgent

Dataset: formula_1
NL request: Please list the year during which the race is held on circuits in Shanghai.

Generated SQL:
```sql
SELECT DISTINCT r.year
FROM races r
JOIN circuits c ON r."circuitId" = c.circuitid
WHERE c.location = 'Shanghai'
ORDER BY r.year;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_03 | system: SkillGuidedAgent

Dataset: formula_1
NL request: Please list the reference names of the drivers who are eliminated in the first period in race number 20.

Generated SQL:
```sql
SELECT d."driverRef"
FROM qualifying q
JOIN drivers d ON q."driverId" = d."driverId"
WHERE q."raceId" = 20
ORDER BY q.q1 DESC
LIMIT 5;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_04 | system: SkillGuidedAgent

Dataset: formula_1
NL request: How many races in the year 2010 are held on grand prixs outside Asia and Europe?

Generated SQL:
```sql
SELECT COUNT(*) AS race_count
FROM races r
JOIN circuits c ON r."circuitId" = c.circuitid
WHERE r.year = 2010
  AND c.country NOT IN (
    'Bahrain', 'China', 'India', 'Japan', 'Korea', 'Malaysia', 'Singapore', 'Turkey', 'UAE',
    'Austria', 'Belgium', 'France', 'Germany', 'Hungary', 'Italy', 'Monaco', 'Netherlands',
    'Portugal', 'Russia', 'Spain', 'Sweden', 'Switzerland', 'UK'
  );
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_formula_1_05 | system: SkillGuidedAgent

Dataset: formula_1
NL request: For all the drivers who finished the game in race No. 592, who is the oldest?

Generated SQL:
```sql
SELECT d.*
FROM results res
JOIN drivers d ON res."driverId" = d."driverId"
WHERE res."raceId" = 592
  AND res.time IS NOT NULL
ORDER BY d.dob ASC
LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Jean-Pierre","Beltoise"]]; got sample [[306,"beltoise",null,null,"Jean-Pierre","Beltoise","1937-04-26","French","http://en.wikipedia.org/wiki/Jean-Pierre_Beltoise"]].

Average score: 1.00 / 2

---

## task: bird_formula_1_06 | system: SkillGuidedAgent

Dataset: formula_1
NL request: Please calculate the race completion percentage of Japanese drivers from 2007 to 2009.

Generated SQL:
```sql
SELECT 100.0 * SUM(CASE WHEN res.time IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) AS completion_percentage
FROM results res
JOIN drivers d ON res."driverId" = d."driverId"
JOIN races r ON res."raceId" = r."raceId"
WHERE d.nationality = 'Japanese'
  AND r.year BETWEEN 2007 AND 2009;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_card_games_01 | system: SkillGuidedAgent

Dataset: card_games
NL request: Which are the cards that have incredibly powerful foils.

Generated SQL:
```sql
SELECT c.name
FROM cards AS c
WHERE c.cardkingdomfoilid IS NOT NULL
  AND c.cardkingdomid IS NOT NULL
ORDER BY c.name;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[10],[1000],[1001],[1002],[1003],[1004],[1005],[1006]]; got sample [["_____"],["\"Ach! Hans, Run!\""],["Abandon Reason"],["Abandoned Outpost"],["Abandoned Sarcophagus"],["Abattoir Ghoul"],["Abbey Griffin"],["Abbot of Keral Keep"]].

Average score: 1.00 / 2

---

## task: bird_card_games_02 | system: SkillGuidedAgent

Dataset: card_games
NL request: List the card names with value that cost more converted mana for the face.

Generated SQL:
```sql
SELECT c.name, c.faceconvertedmanacost
FROM cards AS c
WHERE c.faceconvertedmanacost = (
  SELECT MAX(faceconvertedmanacost)
  FROM cards
)
ORDER BY c.name;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Ancestor's Chosen"]]; got sample [["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Beanstalk Giant // Fertile Footsteps",7],["Elbrus, th...

Average score: 1.00 / 2

---

## task: bird_card_games_03 | system: SkillGuidedAgent

Dataset: card_games
NL request: List all the mythic rarity print cards banned in gladiator format.

Generated SQL:
```sql
SELECT DISTINCT c.name
FROM cards AS c
JOIN legalities AS l
  ON l.uuid = c.uuid
WHERE c.rarity = 'mythic'
  AND l.status = 'Banned'
  AND l.format = 'gladiator'
ORDER BY c.name;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[17983],[18058],[29523],[38736],[38737]]; got sample [["Nexus of Fate"],["Oko, Thief of Crowns"]].

Average score: 1.00 / 2

---

## task: bird_card_games_04 | system: SkillGuidedAgent

Dataset: card_games
NL request: For artifact type of cards that do not have multiple faces on the same card, state its legalities status for vintage play format.

Generated SQL:
```sql
SELECT c.name, l.status
FROM cards AS c
JOIN legalities AS l
  ON l.uuid = c.uuid
WHERE c.type = 'Artifact'
  AND c.side IS NULL
  AND l.format = 'vintage'
ORDER BY c.name, l.status;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Banned"],["Legal"],["Restricted"]]; got sample [["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abandoned Sarcophagus","Legal"],["Abzan Banner","Legal"],["Acidic Dagger","Legal"],["Acorn Catapult","Legal"]...

Average score: 1.00 / 2

---

## task: bird_card_games_05 | system: SkillGuidedAgent

Dataset: card_games
NL request: Calculate the percentage of the cards availabe in Chinese Simplified.

Generated SQL:
```sql
SELECT 100.0 * COUNT(*) FILTER (WHERE fd.language = 'Chinese Simplified') / NULLIF(COUNT(*), 0) AS percentage_chinese_simplified
FROM cards AS c
JOIN foreign_data AS fd
  ON fd.uuid = c.uuid;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_card_games_06 | system: SkillGuidedAgent

Dataset: card_games
NL request: What is the percentage of cards whose language is French among the Story Spotlight cards?

Generated SQL:
```sql
SELECT 100.0 * COUNT(*) FILTER (WHERE fd.language = 'French') / NULLIF(COUNT(*), 0) AS percentage_french_story_spotlight
FROM cards AS c
JOIN foreign_data AS fd
  ON fd.uuid = c.uuid
WHERE c.isstoryspotlight = 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_european_football_2_01 | system: SkillGuidedAgent

Dataset: european_football_2
NL request: Which player has the highest overall rating? Indicate the player's api id.

Generated SQL:
```sql
SELECT DISTINCT pa.player_api_id, p.player_name, pa.overall_rating
FROM player_attributes AS pa
JOIN player AS p ON p.player_api_id = pa.player_api_id
WHERE pa.overall_rating = (SELECT MAX(overall_rating) FROM player_attributes)
ORDER BY pa.player_api_id;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[30981]]; got sample [[30981,"Lionel Messi",94]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_02 | system: SkillGuidedAgent

Dataset: european_football_2
NL request: What is the height of the tallest player? Indicate his name.

Generated SQL:
```sql
SELECT player_name, height
FROM player
WHERE height = (SELECT MAX(height) FROM player)
ORDER BY player_name;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Kristof van Hout"]]; got sample [["Kristof van Hout",208]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_03 | system: SkillGuidedAgent

Dataset: european_football_2
NL request: Among the players with an overall rating between 60 to 65, how many players whose going to be in all of your attack moves instead of defensing?

Generated SQL:
```sql
SELECT COUNT(DISTINCT player_api_id) AS player_count
FROM player_attributes
WHERE overall_rating BETWEEN 60 AND 65
  AND defensive_work_rate = 'low';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [[3594]]; got sample [[733]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_04 | system: SkillGuidedAgent

Dataset: european_football_2
NL request: Give the name of the league had the most goals in the 2016 season?

Generated SQL:
```sql
SELECT l.name AS league_name, SUM(m.home_team_goal + m.away_team_goal) AS total_goals
FROM "Match" AS m
JOIN league AS l ON l.id = m.league_id
WHERE m.season = '2015/2016'
GROUP BY l.id, l.name
ORDER BY total_goals DESC
LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["Spain LIGA BBVA"]]; got sample [["Spain LIGA BBVA",1043]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_05 | system: SkillGuidedAgent

Dataset: european_football_2
NL request: Give the name of the league had the most matches end as draw in the 2016 season?

Generated SQL:
```sql
SELECT l.name AS league_name, COUNT(*) AS draw_matches
FROM "Match" AS m
JOIN league AS l ON l.id = m.league_id
WHERE m.season = '2015/2016'
  AND m.home_team_goal = m.away_team_goal
GROUP BY l.id, l.name
ORDER BY draw_matches DESC
LIMIT 1;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: Result mismatch. Expected sample [["France Ligue 1"]]; got sample [["France Ligue 1",108]].

Average score: 1.00 / 2

---

## task: bird_european_football_2_06 | system: SkillGuidedAgent

Dataset: european_football_2
NL request: List the name of leagues in which the average goals by the home team is higher than the away team in the 2009/2010 season.

Generated SQL:
```sql
SELECT l.name AS league_name
FROM "Match" AS m
JOIN league AS l ON l.id = m.league_id
WHERE m.season = '2009/2010'
GROUP BY l.id, l.name
HAVING SUM(m.home_team_goal)::numeric / COUNT(DISTINCT m.id) > SUM(m.away_team_goal)::numeric / COUNT(DISTINCT m.id)
ORDER BY l.name;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_01 | system: SkillGuidedAgent

Dataset: student_club
NL request: What's Angela Sanders's major?

Generated SQL:
```sql
SELECT maj.major_name FROM member AS mem JOIN major AS maj ON mem.link_to_major = maj.major_id WHERE mem.first_name = 'Angela' AND mem.last_name = 'Sanders';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_02 | system: SkillGuidedAgent

Dataset: student_club
NL request: How many students in the Student_Club are from the College of Engineering?

Generated SQL:
```sql
SELECT COUNT(DISTINCT mem.member_id) AS student_count FROM member AS mem JOIN major AS maj ON mem.link_to_major = maj.major_id WHERE maj.college = 'College of Engineering';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_03 | system: SkillGuidedAgent

Dataset: student_club
NL request: Please list the phone numbers of the students from the Student_Club that has attended the event "Women's Soccer".

Generated SQL:
```sql
SELECT DISTINCT mem.phone FROM member AS mem JOIN attendance AS att ON att.link_to_member = mem.member_id JOIN event AS ev ON att.link_to_event = ev.event_id WHERE ev.event_name = 'Women''s Soccer' AND mem.phone IS NOT NULL;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2

---

## task: bird_student_club_04 | system: SkillGuidedAgent

Dataset: student_club
NL request: Was each expense in October Meeting on October 8, 2019 approved?

Generated SQL:
```sql
SELECT exp.expense_id, exp.expense_description, exp.approved FROM event AS ev JOIN budget AS bud ON bud.link_to_event = ev.event_id JOIN expense AS exp ON exp.link_to_budget = bud.budget_id WHERE ev.event_name = 'October Meeting' AND ev.event_date = DATE '2019-10-08' ORDER BY exp.expense_id;
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ....event_name = 'October Meeting' AND ev.event_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ....event_name = 'October Meeting' AND ev.event_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

Average score: 0.00 / 2

---

## task: bird_student_club_05 | system: SkillGuidedAgent

Dataset: student_club
NL request: What is the status of the event which bought "Post Cards, Posters" on 2019/8/20?

Generated SQL:
```sql
SELECT DISTINCT bud.event_status FROM expense AS exp JOIN budget AS bud ON exp.link_to_budget = bud.budget_id WHERE exp.expense_description = 'Post Cards, Posters' AND exp.expense_date = DATE '2019-08-20';
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...tion = 'Post Cards, Posters' AND exp.expense_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 0
  comment: POST /api/v1/sqllab/execute/ failed (HTTP 500): {"errors":[{"message":"postgresql error: operator does not exist: text = date\nLINE 1: ...tion = 'Post Cards, Posters' AND exp.expense_date = DATE '20...\n                                                             ^\nHINT:  No operator matches the...

Average score: 0.00 / 2

---

## task: bird_student_club_06 | system: SkillGuidedAgent

Dataset: student_club
NL request: How many times was the budget in Advertisement for "Yearly Kickoff" meeting more than "October Meeting"?

Generated SQL:
```sql
SELECT SUM(CASE WHEN ev.event_name = 'Yearly Kickoff' THEN bud.amount ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN ev.event_name = 'October Meeting' THEN bud.amount ELSE 0 END)::numeric, 0) AS budget_ratio FROM budget AS bud JOIN event AS ev ON bud.link_to_event = ev.event_id WHERE bud.category = 'Advertisement' AND ev.event_name IN ('Yearly Kickoff', 'October Meeting');
```

- dimension: sql_executes
  description: Generated SQL executes in dev Superset SQL Lab.
  score: 2
  comment: SQL executed.

- dimension: result_set_equivalence
  description: Generated SQL result matches the PostgreSQL ground truth result set.
  score: 2
  comment: Generated SQL executed and matched the PostgreSQL oracle result set.

Average score: 2.00 / 2
