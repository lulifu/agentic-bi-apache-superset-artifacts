# Prefilled Grading Sheet - BIRD Layer-1 SkillGuided Repair Query Benchmark - 2026-06-14

This sheet is deterministic: every score below comes from SQL Lab execution and result-set comparison against the validated PostgreSQL oracle.

---

## task: bird_financial_01 | system: SkillGuidedAgentRepair

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

## task: bird_financial_02 | system: SkillGuidedAgentRepair

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

## task: bird_financial_03 | system: SkillGuidedAgentRepair

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

## task: bird_financial_04 | system: SkillGuidedAgentRepair

Dataset: financial
NL request: Among the accounts who have approved loan date in 1997, list out the accounts that have the lowest approved amount and choose weekly issuance statement.

Generated SQL:
```sql
SELECT T2.account_id FROM loan AS T1 INNER JOIN account AS T2 ON T1.account_id = T2.account_id WHERE EXTRACT(YEAR FROM CAST(T1.date AS DATE)) = 1997 AND T2.frequency = 'POPLATEK TYDNE' AND T1.amount = (SELECT MIN(T3.amount) FROM loan AS T3 INNER JOIN account AS T4 ON T3.account_id = T4.account_id WHERE EXTRACT(YEAR FROM CAST(T3.date AS DATE)) = 1997 AND T4.frequency = 'POPLATEK TYDNE') ORDER BY T2.account_id;
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

## task: bird_financial_05 | system: SkillGuidedAgentRepair

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

## task: bird_financial_06 | system: SkillGuidedAgentRepair

Dataset: financial
NL request: For the branch which located in the south Bohemia with biggest number of inhabitants, what is the percentage of the male clients?

Generated SQL:
```sql
SELECT CAST(SUM(CASE WHEN T1.gender = 'M' THEN 1 ELSE 0 END) AS DOUBLE PRECISION) * 100 / COUNT(T1.client_id) AS male_percentage FROM client AS T1 INNER JOIN district AS T2 ON T1.district_id = T2.district_id WHERE T2.district_id = (SELECT T3.district_id FROM district AS T3 WHERE T3."A3" = 'south Bohemia' ORDER BY CAST(T3."A4" AS INTEGER) DESC LIMIT 1);
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

## task: bird_formula_1_01 | system: SkillGuidedAgentRepair

Dataset: formula_1
NL request: What is the surname of the driver with the best lap time in race number 19 in the second qualifying period?

Generated SQL:
```sql
SELECT d.surname FROM qualifying q JOIN drivers d ON q."driverId" = d."driverId" WHERE q."raceId" = 19 AND q.q2 IS NOT NULL ORDER BY q.q2 ASC LIMIT 1;
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

## task: bird_formula_1_02 | system: SkillGuidedAgentRepair

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

## task: bird_formula_1_03 | system: SkillGuidedAgentRepair

Dataset: formula_1
NL request: Please list the reference names of the drivers who are eliminated in the first period in race number 20.

Generated SQL:
```sql
SELECT d."driverRef" FROM qualifying q JOIN drivers d ON q."driverId" = d."driverId" WHERE q."raceId" = 20 AND q.q1 IS NOT NULL ORDER BY q.q1 DESC LIMIT 5;
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

## task: bird_formula_1_04 | system: SkillGuidedAgentRepair

Dataset: formula_1
NL request: How many races in the year 2010 are held on grand prixs outside Asia and Europe?

Generated SQL:
```sql
SELECT COUNT(*) AS race_count FROM races r JOIN circuits c ON r."circuitId" = c.circuitid WHERE r.year = 2010 AND c.country NOT IN ('Bahrain', 'China', 'India', 'Japan', 'Korea', 'Malaysia', 'Singapore', 'Turkey', 'UAE', 'Austria', 'Belgium', 'France', 'Germany', 'Hungary', 'Italy', 'Monaco', 'Netherlands', 'Portugal', 'Russia', 'Spain', 'Sweden', 'Switzerland', 'UK');
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

## task: bird_formula_1_05 | system: SkillGuidedAgentRepair

Dataset: formula_1
NL request: For all the drivers who finished the game in race No. 592, who is the oldest?

Generated SQL:
```sql
SELECT d.forename, d.surname FROM results res JOIN drivers d ON res."driverId" = d."driverId" WHERE res."raceId" = 592 AND res.time IS NOT NULL ORDER BY d.dob ASC LIMIT 1;
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

## task: bird_formula_1_06 | system: SkillGuidedAgentRepair

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

## task: bird_card_games_01 | system: SkillGuidedAgentRepair

Dataset: card_games
NL request: Which are the cards that have incredibly powerful foils.

Generated SQL:
```sql
SELECT c.name FROM cards AS c WHERE c.cardkingdomfoilid IS NOT NULL AND c.cardkingdomid IS NOT NULL ORDER BY c.name;
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

## task: bird_card_games_02 | system: SkillGuidedAgentRepair

Dataset: card_games
NL request: List the card names with value that cost more converted mana for the face.

Generated SQL:
```sql
SELECT c.name, c.faceconvertedmanacost FROM cards AS c WHERE c.faceconvertedmanacost = (SELECT MAX(faceconvertedmanacost) FROM cards) ORDER BY c.name;
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

## task: bird_card_games_03 | system: SkillGuidedAgentRepair

Dataset: card_games
NL request: List all the mythic rarity print cards banned in gladiator format.

Generated SQL:
```sql
SELECT DISTINCT c.name FROM cards AS c JOIN legalities AS l ON l.uuid = c.uuid WHERE c.rarity = 'mythic' AND l.status = 'Banned' AND l.format = 'gladiator' ORDER BY c.name;
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

## task: bird_card_games_04 | system: SkillGuidedAgentRepair

Dataset: card_games
NL request: For artifact type of cards that do not have multiple faces on the same card, state its legalities status for vintage play format.

Generated SQL:
```sql
SELECT c.name, l.status FROM cards AS c JOIN legalities AS l ON l.uuid = c.uuid WHERE c.type = 'Artifact' AND c.side IS NULL AND l.format = 'vintage' ORDER BY c.name, l.status;
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

## task: bird_card_games_05 | system: SkillGuidedAgentRepair

Dataset: card_games
NL request: Calculate the percentage of the cards availabe in Chinese Simplified.

Generated SQL:
```sql
SELECT 100.0 * COUNT(*) FILTER (WHERE fd.language = 'Chinese Simplified') / NULLIF(COUNT(*), 0) AS percentage_chinese_simplified FROM cards AS c JOIN foreign_data AS fd ON fd.uuid = c.uuid;
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

## task: bird_card_games_06 | system: SkillGuidedAgentRepair

Dataset: card_games
NL request: What is the percentage of cards whose language is French among the Story Spotlight cards?

Generated SQL:
```sql
SELECT 100.0 * COUNT(*) FILTER (WHERE fd.language = 'French') / NULLIF(COUNT(*), 0) AS percentage_french_story_spotlight FROM cards AS c JOIN foreign_data AS fd ON fd.uuid = c.uuid WHERE c.isstoryspotlight = 1;
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

## task: bird_european_football_2_01 | system: SkillGuidedAgentRepair

Dataset: european_football_2
NL request: Which player has the highest overall rating? Indicate the player's api id.

Generated SQL:
```sql
SELECT DISTINCT pa.player_api_id FROM player_attributes AS pa WHERE pa.overall_rating = (SELECT MAX(overall_rating) FROM player_attributes) ORDER BY pa.player_api_id;
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

## task: bird_european_football_2_02 | system: SkillGuidedAgentRepair

Dataset: european_football_2
NL request: What is the height of the tallest player? Indicate his name.

Generated SQL:
```sql
SELECT player_name, height FROM player WHERE height = (SELECT MAX(height) FROM player) ORDER BY player_name;
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

## task: bird_european_football_2_03 | system: SkillGuidedAgentRepair

Dataset: european_football_2
NL request: Among the players with an overall rating between 60 to 65, how many players whose going to be in all of your attack moves instead of defensing?

Generated SQL:
```sql
SELECT COUNT(DISTINCT player_api_id) AS player_count FROM player_attributes WHERE overall_rating >= 60 AND overall_rating < 65 AND defensive_work_rate = 'low';
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

## task: bird_european_football_2_04 | system: SkillGuidedAgentRepair

Dataset: european_football_2
NL request: Give the name of the league had the most goals in the 2016 season?

Generated SQL:
```sql
SELECT l.name AS league_name FROM "Match" AS m JOIN league AS l ON l.id = m.league_id WHERE m.season = '2015/2016' GROUP BY l.id, l.name ORDER BY SUM(m.home_team_goal + m.away_team_goal) DESC LIMIT 1;
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

## task: bird_european_football_2_05 | system: SkillGuidedAgentRepair

Dataset: european_football_2
NL request: Give the name of the league had the most matches end as draw in the 2016 season?

Generated SQL:
```sql
SELECT l.name AS league_name FROM "Match" AS m JOIN league AS l ON l.id = m.league_id WHERE m.season = '2015/2016' AND m.home_team_goal = m.away_team_goal GROUP BY l.id, l.name ORDER BY COUNT(*) DESC LIMIT 1;
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

## task: bird_european_football_2_06 | system: SkillGuidedAgentRepair

Dataset: european_football_2
NL request: List the name of leagues in which the average goals by the home team is higher than the away team in the 2009/2010 season.

Generated SQL:
```sql
SELECT l.name AS league_name FROM "Match" AS m JOIN league AS l ON l.id = m.league_id WHERE m.season = '2009/2010' GROUP BY l.id, l.name HAVING SUM(m.home_team_goal)::numeric / COUNT(DISTINCT m.id) > SUM(m.away_team_goal)::numeric / COUNT(DISTINCT m.id) ORDER BY l.name;
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

## task: bird_student_club_01 | system: SkillGuidedAgentRepair

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

## task: bird_student_club_02 | system: SkillGuidedAgentRepair

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

## task: bird_student_club_03 | system: SkillGuidedAgentRepair

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

## task: bird_student_club_04 | system: SkillGuidedAgentRepair

Dataset: student_club
NL request: Was each expense in October Meeting on October 8, 2019 approved?

Generated SQL:
```sql
SELECT exp.approved FROM event AS ev JOIN budget AS bud ON bud.link_to_event = ev.event_id JOIN expense AS exp ON exp.link_to_budget = bud.budget_id WHERE ev.event_name = 'October Meeting' AND CAST(ev.event_date AS DATE) = DATE '2019-10-08' ORDER BY exp.expense_id;
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

## task: bird_student_club_05 | system: SkillGuidedAgentRepair

Dataset: student_club
NL request: What is the status of the event which bought "Post Cards, Posters" on 2019/8/20?

Generated SQL:
```sql
SELECT DISTINCT bud.event_status FROM expense AS exp JOIN budget AS bud ON exp.link_to_budget = bud.budget_id WHERE exp.expense_description = 'Post Cards, Posters' AND CAST(exp.expense_date AS DATE) = DATE '2019-08-20';
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

## task: bird_student_club_06 | system: SkillGuidedAgentRepair

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
