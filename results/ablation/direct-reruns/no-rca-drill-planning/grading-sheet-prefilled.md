# Prefilled Grading Sheet - Financial Formal Benchmark - 2026-06-15

This sheet is a scorer-assisted prefill, not the final human-adjudicated result.
Scores marked `[auto]` are based on deterministic checks; `[agent_prefill]` scores are conservative Codex judgments from stored artifacts and should be spot-checked before paper submission.

Score scale: 0 / 1 / 2.

---

## task: self_financial_rca_01 | system: NoRcaDrillPlanningAgent

NL request: Total transaction amount in March 1996 was unusually low compared to neighbouring months. Identify the primary contributors to this drop. Drill down by region, transaction type, and k_symbol category.

Artifact excerpt:
> RCA report: inconclusive. SQL Lab could not be used in this run because the preliminary read-only probe returned HTTP 401 Missing Authorization Header, so I did not execute the drill queries or assert numeric contributors. The intended analysis compares March 1996 against the average of February and April 1996 by region, transaction type, and k_symbol. Based only on the task note, March is not a strong row-count outlier, so a true drop in total amount would most likely come from lower average amount per transaction rather than fewer transactions.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_02 | system: NoRcaDrillPlanningAgent

NL request: The default rate on loans approved in Q3 1996 is materially higher than in Q2 1996. Find the primary driver: is it duration mix, amount distribution, geographic concentration, or client gender mix?

Artifact excerpt:
> RCA report: inconclusive. The required Q2 versus Q3 1996 loan-default drill was not executed because SQL Lab was unavailable. The planned root-cause test computes the default-rate gap first, then compares whether the increase is explained by duration mix, loan-amount bucket, geography, or gender. Without result rows, no primary driver is claimed.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_03 | system: NoRcaDrillPlanningAgent

NL request: Card-withdrawal transaction count for January 1998 was exceptionally high (1,702) versus the 1997 monthly average (180.5). Was this driven by new card issuance during late 1997, by a specific card type, or by a specific subset of districts?

Artifact excerpt:
> RCA report: partial from prompt facts only. January 1998 card-withdrawal count is stated as 1,702 versus a 1997 monthly average of 180.5, about 9.4x higher. SQL execution was unavailable, so I cannot determine whether late-1997 issuance, card type, or district concentration is the actual driver. The planned drill separates card type, district, and Q4-1997 issuance cohort shares within January 1998 card withdrawals.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_04 | system: NoRcaDrillPlanningAgent

NL request: In 1996, district 5 (Kolin) had a noticeably lower average post-transaction balance than its 1995 average. Identify the main contributor. Drill by account-frequency, by client age band, and by transaction k_symbol.

Artifact excerpt:
> RCA report: inconclusive. I could not execute the Kolin 1995 versus 1996 balance drill. The intended analysis measures the average post-transaction balance gap in district 5, then ranks changes by account frequency, owner age band, and k_symbol. No main contributor is asserted without rows.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_05 | system: NoRcaDrillPlanningAgent

NL request: In 1997, accounts with weekly statement issuance (POPLATEK TYDNE) defaulted on loans at a noticeably higher rate than other frequencies. Why? Investigate: are these accounts concentrated in lower-salary districts, do they skew toward lar...

Artifact excerpt:
> RCA report: inconclusive. The 1997 weekly-issuance default-rate claim was not tested against data. The planned RCA compares default rates by frequency and then checks whether weekly accounts differ in district salary quartile, loan amount quartile, or duration bucket. Because these are observational cuts, any driver should be framed as associated rather than causal.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_06 | system: NoRcaDrillPlanningAgent

NL request: Across all districts in 1996, the share of household payments (k_symbol='SIPO') in total transaction count varies substantially. Identify the district with the most extreme deviation from the national average and explain what makes it di...

Artifact excerpt:
> RCA report: inconclusive. I could not execute the district SIPO-share outlier query. The intended result ranks districts by absolute deviation from the national 1996 SIPO transaction-count share, then profiles the top outlier using region, salary A11, and unemployment A12/A13. No district is named without query output.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_07 | system: NoRcaDrillPlanningAgent

NL request: Why did the count of new accounts opened drop substantially in February 1994 vs January 1994? Investigate by district, by frequency choice, and by region. Distinguish a one-time January spike from a February dip.

Artifact excerpt:
> RCA report: inconclusive. SQL was not executed, so I cannot distinguish which districts, frequencies, or regions explain the February 1994 drop in new account openings. The planned analysis treats January as a possible one-time spike rather than assuming February is abnormal, and compares account openings by district, frequency, and region for January versus February.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_08 | system: NoRcaDrillPlanningAgent

NL request: Within finished loans (status A or B), gold-card holders have a different default rate from junior-card holders. Quantify the gap and decompose: how much is explained by client age, how much by loan amount, and how much remains unexplained?

Artifact excerpt:
> RCA report: inconclusive. The gold-versus-junior finished-loan default-rate gap and decomposition were not executed. The intended decomposition compares raw default rates, then reweights by client age band and loan-amount band to estimate how much of the gap is explained by composition. Any remaining gap should be reported as unexplained association, not causal effect.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_09 | system: NoRcaDrillPlanningAgent

NL request: In 1997, total monthly loan-payment outflows (k_symbol='UVER') grew faster in 'east Bohemia' than in any other region. Identify the underlying driver: is it more new loans being approved in that region, larger average loans, or higher-fr...

Artifact excerpt:
> RCA report: inconclusive. I could not execute the east Bohemia UVER-growth decomposition. The planned analysis compares 1996 to 1997 UVER outflow by region, then decomposes regional growth into number of loan-holding accounts or new loans, average loan size, and repayment transaction frequency. No underlying driver is asserted without rows.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2

---

## task: self_financial_rca_10 | system: NoRcaDrillPlanningAgent

NL request: The number of loan applications with status='D' (running, in debt) is concentrated in a small number of districts. Identify the top 3 districts by status-D count and investigate whether they share district-level features (unemployment ra...

Artifact excerpt:
> RCA report: inconclusive. The status-D district concentration query was not executed, so no top-three districts or feature comparison is claimed. The intended RCA ranks districts by count of running-in-debt loans, compares the top three to the bottom three, and reports whether unemployment A13, crime A16, or salary A11 differ descriptively from low-D districts.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, it says so honestly.
  score: 1
  comment: [agent_prefill] RCA text/spec addresses the anomaly but lacks executed evidence.

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate.
  score: 1
  comment: [agent_prefill] Drill-down dimensions are inferred from generated SQL/spec only.

- dimension: top_contributor_correct
  description: The claimed top contributor is supported by the data and not misleading.
  score: 1
  comment: [agent_prefill] Contributor ranking is planned in SQL/spec, but no result rows prove the top contributor.

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score: 0
  comment: [auto] No executed query rows are attached to this baseline artifact.

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score: 1
  comment: [agent_prefill] The artifact is concise, but mostly a plan or hypothesis.

Average score: 0.80 / 2
