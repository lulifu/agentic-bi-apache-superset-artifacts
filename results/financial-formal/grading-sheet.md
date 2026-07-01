# Grading Sheet - Financial Formal Benchmark Summary - 2026-06-10

Score scale: 0 / 1 / 2 (see `tasks/benchmark-scoring-rubric.md`).
- 0: failed, invalid, empty, unsupported by data, or wrong artifact.
- 1: partially correct; main intent visible but important fields missing/wrong.
- 2: correct and useful; satisfied the request and supported by evidence.

Total tasks: 30. Total grading entries: 90.

Fill in the `score:` line on each rubric dimension. Do not change parser-critical lines.

---

## task: self_financial_dashboard_01 | system: DirectLLM

NL request: Build a monthly executive overview dashboard for the lending portfolio in 1996. Include a KPI tile for total approved loan amount, a time-series chart of monthly approved loan count, a stacked bar ...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_01.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_01 | system: SchemaGroundedLLM

NL request: Build a monthly executive overview dashboard for the lending portfolio in 1996. Include a KPI tile for total approved loan amount, a time-series chart of monthly approved loan count, a stacked bar ...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_01.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_01 | system: SkillGuidedAgent

NL request: Build a monthly executive overview dashboard for the lending portfolio in 1996. Include a KPI tile for total approved loan amount, a time-series chart of monthly approved loan count, a stacked bar ...

Artifact link: Superset dashboard #85 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_02 | system: DirectLLM

NL request: Build a regional risk dashboard. For each of the eight Czech regions, show: number of clients, count of active loans (status C or D), default rate (B over A+B for finished loans), and average clien...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_02.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_02 | system: SchemaGroundedLLM

NL request: Build a regional risk dashboard. For each of the eight Czech regions, show: number of clients, count of active loans (status C or D), default rate (B over A+B for finished loans), and average clien...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_02.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_02 | system: SkillGuidedAgent

NL request: Build a regional risk dashboard. For each of the eight Czech regions, show: number of clients, count of active loans (status C or D), default rate (B over A+B for finished loans), and average clien...

Artifact link: Superset dashboard #86 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_03 | system: DirectLLM

NL request: Create a credit-card product overview dashboard. Show issuance volume by month (line, by card type), issued-card mix by type (pie), and the count of card-withdrawal transactions per month for 1997 ...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_03.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_03 | system: SchemaGroundedLLM

NL request: Create a credit-card product overview dashboard. Show issuance volume by month (line, by card type), issued-card mix by type (pie), and the count of card-withdrawal transactions per month for 1997 ...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_03.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_03 | system: SkillGuidedAgent

NL request: Create a credit-card product overview dashboard. Show issuance volume by month (line, by card type), issued-card mix by type (pie), and the count of card-withdrawal transactions per month for 1997 ...

Artifact link: Superset dashboard #89 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_04 | system: DirectLLM

NL request: Build a transaction-mix dashboard for account holders. Show: total transaction amount by transaction type (PRIJEM=credit / VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), share of transact...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_04.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_04 | system: SchemaGroundedLLM

NL request: Build a transaction-mix dashboard for account holders. Show: total transaction amount by transaction type (PRIJEM=credit / VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), share of transact...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_04.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_04 | system: SkillGuidedAgent

NL request: Build a transaction-mix dashboard for account holders. Show: total transaction amount by transaction type (PRIJEM=credit / VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), share of transact...

Artifact link: Superset dashboard #87 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_05 | system: DirectLLM

NL request: Create a client-demographics dashboard. Show a histogram of client age (in years; ages computed against 1998-12-31 as the reference date), a gender breakdown bar, an age-vs-loan-size scatter for cl...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_05.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_05 | system: SchemaGroundedLLM

NL request: Create a client-demographics dashboard. Show a histogram of client age (in years; ages computed against 1998-12-31 as the reference date), a gender breakdown bar, an age-vs-loan-size scatter for cl...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_05.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_05 | system: SkillGuidedAgent

NL request: Create a client-demographics dashboard. Show a histogram of client age (in years; ages computed against 1998-12-31 as the reference date), a gender breakdown bar, an age-vs-loan-size scatter for cl...

Artifact link: Superset dashboard #90 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_06 | system: DirectLLM

NL request: Build a quarterly transaction-volume dashboard for each of the five largest districts (by inhabitants A4). Show one line chart per district plus a combined bar comparing total quarterly transaction...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_06.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_06 | system: SchemaGroundedLLM

NL request: Build a quarterly transaction-volume dashboard for each of the five largest districts (by inhabitants A4). Show one line chart per district plus a combined bar comparing total quarterly transaction...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_06.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_06 | system: SkillGuidedAgent

NL request: Build a quarterly transaction-volume dashboard for each of the five largest districts (by inhabitants A4). Show one line chart per district plus a combined bar comparing total quarterly transaction...

Artifact link: Superset dashboard #92 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_07 | system: DirectLLM

NL request: Build a loan-portfolio aging dashboard for 1998. Slice loans by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), and by approval cohort year. Include: stacked bar of loan count by status...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_07.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_07 | system: SchemaGroundedLLM

NL request: Build a loan-portfolio aging dashboard for 1998. Slice loans by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), and by approval cohort year. Include: stacked bar of loan count by status...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_07.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_07 | system: SkillGuidedAgent

NL request: Build a loan-portfolio aging dashboard for 1998. Slice loans by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), and by approval cohort year. Include: stacked bar of loan count by status...

Artifact link: Superset dashboard #88 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_08 | system: DirectLLM

NL request: Build a card-program acquisition dashboard. Show quarterly issuance trend by card type (gold / classic / junior, 1994-1998), a funnel chart from card issuance to first card-withdrawal transaction (...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_08.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_08 | system: SchemaGroundedLLM

NL request: Build a card-program acquisition dashboard. Show quarterly issuance trend by card type (gold / classic / junior, 1994-1998), a funnel chart from card issuance to first card-withdrawal transaction (...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_08.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_08 | system: SkillGuidedAgent

NL request: Build a card-program acquisition dashboard. Show quarterly issuance trend by card type (gold / classic / junior, 1994-1998), a funnel chart from card issuance to first card-withdrawal transaction (...

Artifact link: Superset dashboard #93 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_09 | system: DirectLLM

NL request: Create a household-payment risk dashboard. Show monthly total household-payment outflow (k_symbol='SIPO') for 1997-1998 (line), accounts whose household payments exceed twice their 1996 monthly ave...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_09.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_09 | system: SchemaGroundedLLM

NL request: Create a household-payment risk dashboard. Show monthly total household-payment outflow (k_symbol='SIPO') for 1997-1998 (line), accounts whose household payments exceed twice their 1996 monthly ave...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_09.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_09 | system: SkillGuidedAgent

NL request: Create a household-payment risk dashboard. Show monthly total household-payment outflow (k_symbol='SIPO') for 1997-1998 (line), accounts whose household payments exceed twice their 1996 monthly ave...

Artifact link: Superset dashboard #94 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_10 | system: DirectLLM

NL request: Build a 'new-account growth and quality' dashboard for Branch Manager review. Charts: monthly new-account openings (line, 1993-1998), share of new accounts by frequency preference (POPLATEK MESICNE...

Artifact link: results/financial-formal/DirectLLM/self_financial_dashboard_10.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_10 | system: SchemaGroundedLLM

NL request: Build a 'new-account growth and quality' dashboard for Branch Manager review. Charts: monthly new-account openings (line, 1993-1998), share of new accounts by frequency preference (POPLATEK MESICNE...

Artifact link: results/financial-formal/SchemaGroundedLLM/self_financial_dashboard_10.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_dashboard_10 | system: SkillGuidedAgent

NL request: Build a 'new-account growth and quality' dashboard for Branch Manager review. Charts: monthly new-account openings (line, 1993-1998), share of new accounts by frequency preference (POPLATEK MESICNE...

Artifact link: Superset dashboard #91 (internal URL omitted)

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score:
  comment:

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score:
  comment:

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score:
  comment:

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends -> line, mix -> pie/stacked, comparison -> bar).
  score:
  comment:

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score:
  comment:

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_01 | system: DirectLLM

NL request: Analyse the year-over-year change in total transaction amount from 1996 to 1997. Was the change driven mostly by transaction-count increase or by average-amount-per-transaction increase? Quantify e...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL computes 1996 and 1997 transaction totals, counts, and averages, then decomposes the total change into count_effect and average_amount_effect. Interpret the result as count-driven when ABS(count_effect) is larger than ABS(avg_amount_effect), otherwise average-size-driven.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_01 | system: SchemaGroundedLLM

NL request: Analyse the year-over-year change in total transaction amount from 1996 to 1997. Was the change driven mostly by transaction-count increase or by average-amount-per-transaction increase? Quantify e...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_01 | system: SkillGuidedAgent

NL request: Analyse the year-over-year change in total transaction amount from 1996 to 1997. Was the change driven mostly by transaction-count increase or by average-amount-per-transaction increase? Quantify e...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_01.
> yoy_decomposition: [{"cnt_1996":196779,"total_1996":1163864249,"avg_1996":5914.575483156231,"cnt_1997":284409,"total_1997":1688347890,"avg_1997":5936.3377741210725,"total_change":524483641,"count_contribution":518294249.58898056,"avg_amount_contribution":6189391.411019469,"count_contribution_share":0.9881990763349291}]

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_02 | system: DirectLLM

NL request: Find the months in 1997 where total card-withdrawal (VYBER KARTOU) volume was at least 30% above the 1997 monthly average, and characterise what is unusual about those months (which districts contr...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL flags 1997 months where card-withdrawal amount is at least 1.30 times the 1997 monthly average, then attributes flagged volume by district and card type. The unusual months are the flagged_month rows; the largest SUM(amount) contributors indicate the dominant districts and card types.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_02 | system: SchemaGroundedLLM

NL request: Find the months in 1997 where total card-withdrawal (VYBER KARTOU) volume was at least 30% above the 1997 monthly average, and characterise what is unusual about those months (which districts contr...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_02 | system: SkillGuidedAgent

NL request: Find the months in 1997 where total card-withdrawal (VYBER KARTOU) volume was at least 30% above the 1997 monthly average, and characterise what is unusual about those months (which districts contr...

Artifact (analysis report text):
> Executed 2 data-backed Superset SQL Lab query/queries for self_financial_analysis_02.
> card_withdrawal_months_1997: [{"month":"1997-01-01","total_amount":1704600,"tx_count":804,"avg_amount":410858.3333333333,"ratio_to_avg":4.14887532198852},{"month":"1997-12-01","total_amount":914500,"tx_count":405,"avg_amount":410858.3333333333,"ratio_to_avg":2.225828042918281}]
> flagged_month_attribution: [{"month":"1997-01-01","district_name":"Hl.m. Praha","card_type":"classic","tx_count":42,"total_amount":79800},{"month":"1997-12-01","district_name":"Hl.m. Praha","card_type":"classic","tx_count":31,"total_amount":66600},{"month":"1997-01-01","district_name":"Olomouc","card_type":"classic","tx_count":25,"total_amount":55700},{"month":"1997-01-01","district_name":"Hl.m. Praha","card_type":"junior","tx_c...

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_03 | system: DirectLLM

NL request: Compare the five Czech regions on lending-portfolio quality in 1997: which region has the highest default rate (status='B' share among finished loans) and what client demographic differences (gende...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL compares finished-loan default rates by region for loans approved by the end of 1997, alongside male-client share and average district salary. Treat any demographic relationship as correlation only, not causal evidence.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_03 | system: SchemaGroundedLLM

NL request: Compare the five Czech regions on lending-portfolio quality in 1997: which region has the highest default rate (status='B' share among finished loans) and what client demographic differences (gende...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_03 | system: SkillGuidedAgent

NL request: Compare the five Czech regions on lending-portfolio quality in 1997: which region has the highest default rate (status='B' share among finished loans) and what client demographic differences (gende...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_03.
> regional_loan_quality_1997: [{"region":"west Bohemia","finished_loans":22,"defaulted_finished_loans":5,"default_rate":0.22727272727272727,"avg_salary":9061.666666666666,"male_share":0.4},{"region":"south Bohemia","finished_loans":23,"defaulted_finished_loans":5,"default_rate":0.21739130434782608,"avg_salary":8824.38,"male_share":0.48},{"region":"central Bohemia","finished_loans":31,"defaulted_finished_loans":5,"default_rate":0.16129032258064516,"avg_salary":9304.493506493507,"male_share":0.42857142857142855},{"region":"north Moravia","finished_loans":41,"defaulted_finished_loans":6,"default_rate":0.14634146341463414,"avg_salary":9589.29357798165,"male_share":0.4954128440366973},{"region":"south Moravia...

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_04 | system: DirectLLM

NL request: Examine seasonality in transaction volume. Across all years 1994-1998, which calendar month consistently has the highest transaction count and which the lowest? Quantify the gap and comment on whet...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL counts transactions by calendar month and year from 1994 through 1998, then averages each month-of-year and computes a coefficient of variation. Highest and lowest average_count identify the seasonal peak and trough; lower cv means the seasonal pattern is more stable across years.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_04 | system: SchemaGroundedLLM

NL request: Examine seasonality in transaction volume. Across all years 1994-1998, which calendar month consistently has the highest transaction count and which the lowest? Quantify the gap and comment on whet...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_04 | system: SkillGuidedAgent

NL request: Examine seasonality in transaction volume. Across all years 1994-1998, which calendar month consistently has the highest transaction count and which the lowest? Quantify the gap and comment on whet...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_04.
> seasonality_1994_1998: [{"month_no":1,"avg_count":24407.4,"min_count":9139,"max_count":42940,"cv":0.4984122585240542},{"month_no":12,"avg_count":19370.2,"min_count":9795,"max_count":28269,"cv":0.3455865932024116},{"month_no":11,"avg_count":17493.6,"min_count":8275,"max_count":25341,"cv":0.38295988594238256},{"month_no":10,"avg_count":17370,"min_count":8197,"max_count":25689,"cv":0.39261262085328463},{"month_no":6,"avg_count":17279.2,"min_count":7916,"max_count":27833,"cv":0.43635475889596526}]

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_05 | system: DirectLLM

NL request: Among loans approved in 1996, which 12-month duration band (short=12, medium=24-36, long=48-60) has the worst default performance (highest B share among finished)? Quantify and characterise the typ...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL buckets 1996 finished loans into short, medium, and long duration bands, then computes default rate, average amount, and average payments. The worst band is the row with the highest default_rate; its typical loan profile is described by avg_amount and avg_payment.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_05 | system: SchemaGroundedLLM

NL request: Among loans approved in 1996, which 12-month duration band (short=12, medium=24-36, long=48-60) has the worst default performance (highest B share among finished)? Quantify and characterise the typ...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_05 | system: SkillGuidedAgent

NL request: Among loans approved in 1996, which 12-month duration band (short=12, medium=24-36, long=48-60) has the worst default performance (highest B share among finished)? Quantify and characterise the typ...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_05.
> duration_default_1996: [{"duration_band":"short_12","finished_loans":15,"defaulted_loans":3,"default_rate":0.2,"avg_amount":59990.4,"avg_payments":4999.2},{"duration_band":"medium_24_36","finished_loans":20,"defaulted_loans":3,"default_rate":0.15,"avg_amount":123594.75,"avg_payments":4057.7083333333335},{"duration_band":"long_48_60","finished_loans":0,"defaulted_loans":0,"default_rate":null,"avg_amount":212690.22222222222,"avg_payments":3975.777777777778}]

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_06 | system: DirectLLM

NL request: What happened to the proportion of card-withdrawal transactions among all withdrawals between 1996 and 1998? Is the trend consistent across regions? Identify regions that are clear outliers from th...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL computes the proportion of card withdrawals among all withdrawals nationally and by region from 1996 to 1998. Regions with the largest absolute deviation_from_national are the outliers, and consistency is judged by whether regional proportions move in the same direction as the national trend.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_06 | system: SchemaGroundedLLM

NL request: What happened to the proportion of card-withdrawal transactions among all withdrawals between 1996 and 1998? Is the trend consistent across regions? Identify regions that are clear outliers from th...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_06 | system: SkillGuidedAgent

NL request: What happened to the proportion of card-withdrawal transactions among all withdrawals between 1996 and 1998? Is the trend consistent across regions? Identify regions that are clear outliers from th...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_06.
> card_withdrawal_share_by_region: [{"yr":1997,"region":"west Bohemia","region_share":0.018439030288374344,"national_share":0.012575695117773766,"deviation":0.005863335170600577},{"yr":1998,"region":"south Moravia","region_share":0.017563407125054976,"national_share":0.023029256245928217,"deviation":-0.005465849120873238},{"yr":1998,"region":"west Bohemia","region_share":0.02786247502891389,"national_share":0.023029256245928217,"deviation":0.004833218782985674},{"yr":1998,"region":"north Bohemia","region_share":0.027769557068166126,"national_share":0.023029256245928217,"deviation":0.004740300822237909},{"yr":1997,"region":"north Bohemia","region_share":0.016700768677763645,"national_share":0.012575695117...

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_07 | system: DirectLLM

NL request: Are clients who request weekly statement issuance (POPLATEK TYDNE) different from monthly-issuance clients in loan-default rate? If so, by how much, and is the difference statistically meaningful g...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL compares finished-loan default rates for weekly versus monthly statement accounts and includes sample sizes. A difference is statistically meaningful only if the rate gap is large relative to the binomial uncertainty implied by the two denominators; small samples should be treated as inconclusive.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_07 | system: SchemaGroundedLLM

NL request: Are clients who request weekly statement issuance (POPLATEK TYDNE) different from monthly-issuance clients in loan-default rate? If so, by how much, and is the difference statistically meaningful g...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_07 | system: SkillGuidedAgent

NL request: Are clients who request weekly statement issuance (POPLATEK TYDNE) different from monthly-issuance clients in loan-default rate? If so, by how much, and is the difference statistically meaningful g...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_07.
> frequency_default_comparison: [{"frequency":"POPLATEK MESICNE","finished_loans":190,"defaulted_loans":22,"default_rate":0.11578947368421053},{"frequency":"POPLATEK TYDNE","finished_loans":33,"defaulted_loans":6,"default_rate":0.18181818181818182}]

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_08 | system: DirectLLM

NL request: For accounts in 'south Bohemia' region, summarise the evolution of average account balance (post-transaction) month-over-month in 1997, and call out any month where the regional average dropped by ...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL calculates monthly average post-transaction balance for south Bohemia accounts in 1997 and flags any month where the month-over-month change is below -5 percent. The flagged rows are the required callouts.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_08 | system: SchemaGroundedLLM

NL request: For accounts in 'south Bohemia' region, summarise the evolution of average account balance (post-transaction) month-over-month in 1997, and call out any month where the regional average dropped by ...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_08 | system: SkillGuidedAgent

NL request: For accounts in 'south Bohemia' region, summarise the evolution of average account balance (post-transaction) month-over-month in 1997, and call out any month where the regional average dropped by ...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_08.
> south_bohemia_mom_balance: [{"month":"1997-01-01","avg_balance":32949.781499809666,"prev_avg_balance":null,"mom_change":null},{"month":"1997-02-01","avg_balance":33192.06142034549,"prev_avg_balance":32949.781499809666,"mom_change":0.007353005376901194},{"month":"1997-03-01","avg_balance":37636.431966726086,"prev_avg_balance":33192.06142034549,"mom_change":0.133898599731331},{"month":"1997-04-01","avg_balance":38261.97429906542,"prev_avg_balance":37636.431966726086,"mom_change":0.01662065981420267},{"month":"1997-05-01","avg_balance":39156.45580878266,"prev_avg_balance":38261.97429906542,"mom_change":0.023377818999242923}]

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_09 | system: DirectLLM

NL request: Compare transaction volume between gold-card-holding clients and classic-card-holding clients during 1998. Is the per-client transaction count and average transaction size materially different betw...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL aggregates 1998 transaction count and average transaction size per card-holding client for gold and classic cards, then compares segment averages. Gold should be treated as high engagement only if both per-client transaction count and average transaction amount are materially higher, not merely because total segment volume is larger.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_09 | system: SchemaGroundedLLM

NL request: Compare transaction volume between gold-card-holding clients and classic-card-holding clients during 1998. Is the per-client transaction count and average transaction size materially different betw...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_09 | system: SkillGuidedAgent

NL request: Compare transaction volume between gold-card-holding clients and classic-card-holding clients during 1998. Is the per-client transaction count and average transaction size materially different betw...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_09.
> gold_vs_classic_engagement_1998: [{"card_type":"classic","clients":659,"avg_tx_per_client":77.03186646433991,"median_tx_per_client":74,"avg_transaction_size":8371.013604793015},{"card_type":"gold","clients":88,"avg_tx_per_client":78,"median_tx_per_client":75,"avg_transaction_size":9197.119258217112}]

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_10 | system: DirectLLM

NL request: Which districts saw the biggest jump in number of new accounts opened from 1995 to 1996? Take the top three and describe what they have in common (region, average salary A11, unemployment rate chan...

Artifact (analysis report text):
> Report: DirectLLM did not execute data. The SQL counts new accounts by district in 1995 and 1996, ranks districts by the increase, and returns the top three with region, average salary, and unemployment-rate change. Commonality should be assessed by shared region or similar A11 and A13 minus A12 profiles across the top districts.

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_10 | system: SchemaGroundedLLM

NL request: Which districts saw the biggest jump in number of new accounts opened from 1995 to 1996? Take the top three and describe what they have in common (region, average salary A11, unemployment rate chan...

Artifact (analysis report text):
> analysis_report

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_analysis_10 | system: SkillGuidedAgent

NL request: Which districts saw the biggest jump in number of new accounts opened from 1995 to 1996? Take the top three and describe what they have in common (region, average salary A11, unemployment rate chan...

Artifact (analysis report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_analysis_10.
> district_account_growth_1995_1996: [{"district_id":1,"district_name":"Hl.m. Praha","region":"Prague","avg_salary":12541,"unemployment_1995":0.2,"unemployment_1996":0.43,"accounts_1995":74,"accounts_1996":159,"delta_accounts":85,"unemployment_delta":0.23},{"district_id":54,"district_name":"Brno - mesto","region":"south Moravia","avg_salary":9897,"unemployment_1995":1.6,"unemployment_1996":1.96,"accounts_1995":16,"accounts_1996":46,"delta_accounts":30,"unemployment_delta":0.36},{"district_id":74,"district_name":"Ostrava - mesto","region":"north Moravia","avg_salary":10673,"unemployment_1995":4.7,"unemployment_1996":5.44,"accounts_1995":20,"accounts_1996":46,"delta_accounts":26,"unemployment_delta":0.7400...

### Rubric: rubric_analysis

- dimension: latest_value_correct
  description: The latest-period value(s) reported in the analysis match the underlying queried data.
  score:
  comment:

- dimension: baseline_correct
  description: The baseline/reference (prior period, prior cohort, etc.) is computed correctly.
  score:
  comment:

- dimension: percentage_change_correct
  description: Period-over-period or segment-over-segment percentages are arithmetically correct.
  score:
  comment:

- dimension: trend_direction_correct
  description: Direction of trends (up, down, flat, oscillating) is correctly described.
  score:
  comment:

- dimension: evidence_supported
  description: Every quantitative claim is supported by an executed query (cited or visible in the artifact).
  score:
  comment:

- dimension: separates_observation_from_hypothesis
  description: The report distinguishes data observations from hypotheses and avoids unsupported causation.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_01 | system: DirectLLM

NL request: Total transaction amount in March 1996 was unusually low compared to neighbouring months. Identify the primary contributors to this drop. Drill down by region, transaction type, and k_symbol category.

Artifact (RCA report text):
> DirectLLM RCA: Treat March 1996 as an amount anomaly rather than a count anomaly. Compare March against the average of February and April, then rank negative gap contributors by region, transaction type, and k_symbol. The most likely primary driver is a lower average transaction amount within high-volume withdrawal or payment categories, since neighboring-month row counts are not materially lower for March.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_01 | system: SchemaGroundedLLM

NL request: Total transaction amount in March 1996 was unusually low compared to neighbouring months. Identify the primary contributors to this drop. Drill down by region, transaction type, and k_symbol category.

Artifact (RCA report text):
> The stated March 1996 drop is not supported by the local financial data: total transaction amount was 67,670,515 in February, 76,963,029 in March, and 79,177,007 in April. March is below April but above the two-month neighbor average. The largest negative segment gaps versus the February/April average are central Bohemia PRIJEM with blank k_symbol (-363,859), north Bohemia PRIJEM with blank k_symbol (-106,892), and west Bohemia PRIJEM with blank k_symbol (-66,611), so any localized softness is mainly incoming transactions without a purpose code, not broad transaction count collapse.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_01 | system: SkillGuidedAgent

NL request: Total transaction amount in March 1996 was unusually low compared to neighbouring months. Identify the primary contributors to this drop. Drill down by region, transaction type, and k_symbol category.

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_01.
> march_1996_drop_drilldown: [{"region":"central Bohemia","trans_type":"PRIJEM","k_symbol":"<blank>","march_amount":4825540,"neighbor_avg":5189399,"delta_vs_neighbor_avg":-363859},{"region":"north Bohemia","trans_type":"PRIJEM","k_symbol":"<blank>","march_amount":3589839,"neighbor_avg":3696731,"delta_vs_neighbor_avg":-106892},{"region":"west Bohemia","trans_type":"PRIJEM","k_symbol":"<blank>","march_amount":3600838,"neighbor_avg":3667448.5,"delta_vs_neighbor_avg":-66610.5},{"region":"south Moravia","trans_type":"VYBER","k_symbol":"<blank>","march_amount":326576,"neighbor_avg":380832,"delta_vs_neighbor_avg":-54256},{"region":"Prague","trans_type":"VYBER","k_symbol":"<blank>","march_amount":265336,"neighbor_avg...

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_02 | system: DirectLLM

NL request: The default rate on loans approved in Q3 1996 is materially higher than in Q2 1996. Find the primary driver: is it duration mix, amount distribution, geographic concentration, or client gender mix?

Artifact (RCA report text):
> DirectLLM RCA: Compare Q3 1996 to Q2 1996 only on finished loans. Attribute the default-rate increase by checking whether Q3 has a worse mix of duration, loan amount buckets, regions, or gender. The primary driver should be the drill axis whose within-axis default rates and volume shift explain most of the Q3 minus Q2 gap; stop at the first axis with dominant explanatory share and report the remaining residual.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_02 | system: SchemaGroundedLLM

NL request: The default rate on loans approved in Q3 1996 is materially higher than in Q2 1996. Find the primary driver: is it duration mix, amount distribution, geographic concentration, or client gender mix?

Artifact (RCA report text):
> The premise is not supported: finished-loan default rate fell from 50.0% in Q2 1996 (3 defaults out of 6 finished loans) to 8.3% in Q3 1996 (1 out of 12). Duration, amount bucket, region, and owner gender all show lower or non-increasing Q3 default rates. The apparent driver is therefore not a Q3 deterioration; Q2 is the anomalous quarter, especially short 12-month loans and the 50-100k amount bucket.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_02 | system: SkillGuidedAgent

NL request: The default rate on loans approved in Q3 1996 is materially higher than in Q2 1996. Find the primary driver: is it duration mix, amount distribution, geographic concentration, or client gender mix?

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_02.
> q2_q3_1996_default_drivers: [{"axis":"amount_quartile","value":"1","quarter":"1996_Q2","finished_loans":2,"default_rate":1},{"axis":"amount_quartile","value":"1","quarter":"1996_Q3","finished_loans":3,"default_rate":0.3333333333333333},{"axis":"amount_quartile","value":"2","quarter":"1996_Q2","finished_loans":3,"default_rate":0.3333333333333333},{"axis":"amount_quartile","value":"2","quarter":"1996_Q3","finished_loans":2,"default_rate":0},{"axis":"amount_quartile","value":"3","quarter":"1996_Q3","finished_loans":5,"default_rate":0}]

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_03 | system: DirectLLM

NL request: Card-withdrawal transaction count for January 1998 was exceptionally high (1,702) versus the 1997 monthly average (180.5). Was this driven by new card issuance during late 1997, by a specific card ...

Artifact (RCA report text):
> DirectLLM RCA: January 1998 card-withdrawal count should be compared with the 1997 monthly average of 180.5, not total January transactions. Drill January 1998 by card type, district, and Q4-1997 issuance cohort. The likely explanation is a broad step-up in card usage amplified by recently issued late-1997 cards if that cohort contributes a disproportionate share; otherwise classify it as activation/usage expansion rather than issuance alone.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_03 | system: SchemaGroundedLLM

NL request: Card-withdrawal transaction count for January 1998 was exceptionally high (1,702) versus the 1997 monthly average (180.5). Was this driven by new card issuance during late 1997, by a specific card ...

Artifact (RCA report text):
> January 1998 card-withdrawal volume is genuinely high at 1,702 versus the 1997 monthly average of 180.5. The largest visible driver is card type: classic cards account for 1,244 withdrawals, junior for 299, and gold for 159. Late-1997 issuance explains only part of the spike: cards issued in 1997 Q4 account for 308 January withdrawals, while other issuance cohorts account for 1,394. District concentration is present but not dominant; Hl.m. Praha leads with 214 withdrawals.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_03 | system: SkillGuidedAgent

NL request: Card-withdrawal transaction count for January 1998 was exceptionally high (1,702) versus the 1997 monthly average (180.5). Was this driven by new card issuance during late 1997, by a specific card ...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_03.
> jan_1998_card_withdrawal_attribution: [{"card_type":"classic","district_name":"Hl.m. Praha","issuance_cohort":"existing_or_other","tx_count":93,"total_amount":207800},{"card_type":"classic","district_name":"Hl.m. Praha","issuance_cohort":"issued_late_1997","tx_count":50,"total_amount":102100},{"card_type":"classic","district_name":"Karvina","issuance_cohort":"existing_or_other","tx_count":48,"total_amount":101500},{"card_type":"junior","district_name":"Hl.m. Praha","issuance_cohort":"existing_or_other","tx_count":42,"total_amount":68500},{"card_type":"classic","district_name":"Pisek","issuance_cohort":"existing_or_other","tx_count":41,"total_amount":78200}]

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_04 | system: DirectLLM

NL request: In 1996, district 5 (Kolin) had a noticeably lower average post-transaction balance than its 1995 average. Identify the main contributor. Drill by account-frequency, by client age band, and by tran...

Artifact (RCA report text):
> DirectLLM RCA: For Kolin, compare 1996 average post-transaction balance against the 1995 account-level baseline, then rank the segments with the largest negative shift. The strongest contributor is the account-frequency, age-band, or k_symbol segment with both a large balance decline and substantial transaction volume; avoid attributing the district decline to tiny segments.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_04 | system: SchemaGroundedLLM

NL request: In 1996, district 5 (Kolin) had a noticeably lower average post-transaction balance than its 1995 average. Identify the main contributor. Drill by account-frequency, by client age band, and by tran...

Artifact (RCA report text):
> The stated decline is not supported for district 5 (Kolin): average post-transaction balance increased from 39,213.77 in 1995 to 40,390.48 in 1996. Account frequency is not the cause of a drop because both monthly and weekly statement groups rose. The only notable negative slice is owner age band 30-44, whose average balance fell from 42,836.50 to 40,737.87, but that did not overcome increases in other age bands and k_symbol groups.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_04 | system: SkillGuidedAgent

NL request: In 1996, district 5 (Kolin) had a noticeably lower average post-transaction balance than its 1995 average. Identify the main contributor. Drill by account-frequency, by client age band, and by tran...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_04.
> kolin_balance_1995_1996_drivers: [{"yr":1995,"frequency":"POPLATEK MESICNE","k_symbol":" ","age_band":"<30","avg_balance":53038.583333333336,"tx_count":12},{"yr":1996,"frequency":"POPLATEK MESICNE","k_symbol":" ","age_band":"<30","avg_balance":41133,"tx_count":28},{"yr":1995,"frequency":"POPLATEK MESICNE","k_symbol":" ","age_band":"30-49","avg_balance":52110.13333333333,"tx_count":60},{"yr":1996,"frequency":"POPLATEK MESICNE","k_symbol":" ","age_band":"30-49","avg_balance":47352.08955223881,"tx_count":67},{"yr":1995,"frequency":"POPLATEK MESICNE","k_symbol":" ","age_band":"50+","avg_balance":35120.78260869565,"tx_count":23}]

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_05 | system: DirectLLM

NL request: In 1997, accounts with weekly statement issuance (POPLATEK TYDNE) defaulted on loans at a noticeably higher rate than other frequencies. Why? Investigate: are these accounts concentrated in lower-s...

Artifact (RCA report text):
> DirectLLM RCA: Weekly-statement accounts should first be compared with other frequencies on 1997 finished-loan default rate. Then test whether the weekly segment is overrepresented in lower-salary districts, larger loan amount quartiles, or longer durations. Treat these as correlational drivers; a convincing explanation requires both segment concentration and elevated within-segment default rates.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_05 | system: SchemaGroundedLLM

NL request: In 1997, accounts with weekly statement issuance (POPLATEK TYDNE) defaulted on loans at a noticeably higher rate than other frequencies. Why? Investigate: are these accounts concentrated in lower-s...

Artifact (RCA report text):
> The stated weekly-statement default-rate problem is not supported in the 1997 finished-loan cohort. Weekly statement accounts had 0 defaults out of 4 finished loans, while monthly statement accounts had 3 defaults out of 39, a 7.69% default rate. Weekly loans do not skew larger or longer in this slice: average amount is 51,423 and duration is 12 months, versus 57,339 and 12 months for monthly accounts.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_05 | system: SkillGuidedAgent

NL request: In 1997, accounts with weekly statement issuance (POPLATEK TYDNE) defaulted on loans at a noticeably higher rate than other frequencies. Why? Investigate: are these accounts concentrated in lower-s...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_05.
> weekly_default_1997_drivers: [{"frequency":"POPLATEK MESICNE","salary_quartile":2,"duration_band":"short_12","finished_loans":6,"defaulted_loans":2,"default_rate":0.3333333333333333,"avg_amount":43564},{"frequency":"POPLATEK MESICNE","salary_quartile":4,"duration_band":"short_12","finished_loans":18,"defaulted_loans":1,"default_rate":0.05555555555555555,"avg_amount":61175.333333333336},{"frequency":"POPLATEK MESICNE","salary_quartile":3,"duration_band":"short_12","finished_loans":6,"defaulted_loans":0,"default_rate":0,"avg_amount":63026},{"frequency":"POPLATEK MESICNE","salary_quartile":1,"duration_band":"short_12","finished_loans":9,"defaulted_loans":0,"default_rate":0,"avg_amount":55060},{"frequency":"POP...

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_06 | system: DirectLLM

NL request: Across all districts in 1996, the share of household payments (k_symbol='SIPO') in total transaction count varies substantially. Identify the district with the most extreme deviation from the natio...

Artifact (RCA report text):
> DirectLLM RCA: Compute each district's 1996 SIPO transaction-count share and compare it with the national share. Select the district with the largest absolute deviation, then characterize it by region, salary, and unemployment profile. Frame the result as an outlier description rather than a causal claim.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_06 | system: SchemaGroundedLLM

NL request: Across all districts in 1996, the share of household payments (k_symbol='SIPO') in total transaction count varies substantially. Identify the district with the most extreme deviation from the natio...

Artifact (RCA report text):
> Domazlice is the most extreme 1996 SIPO-share outlier: 242 SIPO transactions out of 1,726 total, a 14.02% share, which is 3.24 percentage points above the national share. It is in west Bohemia, has average salary A11=8,620, 1996 unemployment A13=1.25, and crime count A16=1,117. The profile points to a high household-payment share despite relatively low unemployment and moderate salary, not an obvious labor-market-stress explanation.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_06 | system: SkillGuidedAgent

NL request: Across all districts in 1996, the share of household payments (k_symbol='SIPO') in total transaction count varies substantially. Identify the district with the most extreme deviation from the natio...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_06.
> sipo_share_extreme_district_1996: [{"district_id":22,"district_name":"Domazlice","region":"west Bohemia","avg_salary":8620,"unemployment_1995":1.1,"unemployment_1996":1.25,"sipo_share":0.14020857473928158,"national_share":0.10779097363031624,"deviation":0.032417601108965334},{"district_id":49,"district_name":"Semily","region":"east Bohemia","avg_salary":8208,"unemployment_1995":1.8,"unemployment_1996":2.26,"sipo_share":0.07797537619699042,"national_share":0.10779097363031624,"deviation":-0.02981559743332582},{"district_id":69,"district_name":"Jesenik","region":"north Moravia","avg_salary":8173,"unemployment_1995":null,"unemployment_1996":7.01,"sipo_share":0.0811561978877154,"national_share":0.10779097363031...

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_07 | system: DirectLLM

NL request: Why did the count of new accounts opened drop substantially in February 1994 vs January 1994? Investigate by district, by frequency choice, and by region. Distinguish a one-time January spike from ...

Artifact (RCA report text):
> DirectLLM RCA: Compare account openings in January and February 1994 by district, frequency, and region. Distinguish whether January was unusually high or February unusually low by checking each segment's Feb/Jan ratio and share of the total decline. The safest conclusion is descriptive: identify the segments explaining the drop without claiming a causal operational event.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_07 | system: SchemaGroundedLLM

NL request: Why did the count of new accounts opened drop substantially in February 1994 vs January 1994? Investigate by district, by frequency choice, and by region. Distinguish a one-time January spike from ...

Artifact (RCA report text):
> The stated February 1994 drop in new-account openings is not supported: account openings increased from 24 in January to 34 in February. Several individual district/frequency slices fell by one account, but the aggregate movement is a February increase, led by gains in Prague, north Moravia, south Moravia, and west Bohemia monthly statement accounts. This is not evidence of a one-time January spike.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_07 | system: SkillGuidedAgent

NL request: Why did the count of new accounts opened drop substantially in February 1994 vs January 1994? Investigate by district, by frequency choice, and by region. Distinguish a one-time January spike from ...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_07.
> jan_feb_1994_account_openings: [{"month":"1994-02-01","district_name":"Hl.m. Praha","region":"Prague","frequency":"POPLATEK MESICNE","new_accounts":7},{"month":"1994-02-01","district_name":"Sumperk","region":"north Moravia","frequency":"POPLATEK MESICNE","new_accounts":3},{"month":"1994-01-01","district_name":"Hl.m. Praha","region":"Prague","frequency":"POPLATEK MESICNE","new_accounts":3},{"month":"1994-02-01","district_name":"Rokycany","region":"west Bohemia","frequency":"POPLATEK MESICNE","new_accounts":2},{"month":"1994-01-01","district_name":"Rokycany","region":"west Bohemia","frequency":"POPLATEK MESICNE","new_accounts":2}]

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_08 | system: DirectLLM

NL request: Within finished loans (status A or B), gold-card holders have a different default rate from junior-card holders. Quantify the gap and decompose: how much is explained by client age, how much by loa...

Artifact (RCA report text):
> DirectLLM RCA: Estimate the finished-loan default-rate gap between gold and junior card holders. Decompose the gap by comparing like-for-like age bands and loan amount bands, then report the residual unexplained gap. The result should rank whether age composition or loan-size composition explains more, while making clear that unexplained residual is not causal proof.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_08 | system: SchemaGroundedLLM

NL request: Within finished loans (status A or B), gold-card holders have a different default rate from junior-card holders. Quantify the gap and decompose: how much is explained by client age, how much by loa...

Artifact (RCA report text):
> Junior-card holders have the higher finished-loan default rate: 1 default out of 7 finished loans (14.29%) versus 0 out of 8 for gold-card holders, a 14.29 percentage-point gap. The evidence is sparse. The one junior default sits in the 100-200k loan amount band; all junior finished loans are in the under-30 age band, while gold loans are spread across under-30, 30-44, and 45-59. Amount and age both describe the gap, but most of the measured difference remains sample-size-sensitive and should be treated as unexplained rather than causal.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_08 | system: SkillGuidedAgent

NL request: Within finished loans (status A or B), gold-card holders have a different default rate from junior-card holders. Quantify the gap and decompose: how much is explained by client age, how much by loa...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_08.
> gold_junior_default_decomposition: [{"card_type":"gold","age_band":"<30","amount_quartile":1,"finished_loans":1,"default_rate":0},{"card_type":"gold","age_band":"<30","amount_quartile":3,"finished_loans":1,"default_rate":0},{"card_type":"gold","age_band":"30-49","amount_quartile":1,"finished_loans":1,"default_rate":0},{"card_type":"gold","age_band":"30-49","amount_quartile":2,"finished_loans":1,"default_rate":0},{"card_type":"gold","age_band":"30-49","amount_quartile":3,"finished_loans":2,"default_rate":0}]

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_09 | system: DirectLLM

NL request: In 1997, total monthly loan-payment outflows (k_symbol='UVER') grew faster in 'east Bohemia' than in any other region. Identify the underlying driver: is it more new loans being approved in that re...

Artifact (RCA report text):
> DirectLLM RCA: For UVER loan-payment outflows, decompose the 1996-to-1997 regional growth into more loan-payment transactions, more loan-holding accounts or newly approved loans, and larger average loans. If east Bohemia grows fastest, the primary driver is the component whose growth rate and contribution dominate the region's total UVER amount increase.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_09 | system: SchemaGroundedLLM

NL request: In 1997, total monthly loan-payment outflows (k_symbol='UVER') grew faster in 'east Bohemia' than in any other region. Identify the underlying driver: is it more new loans being approved in that re...

Artifact (RCA report text):
> East Bohemia UVER outflow rose from 998,826 in 1996 to 1,593,156 in 1997, a 59.5% increase. The main driver is more loan-payment accounts/new loans, not higher repayment frequency: new loans increased from 13 to 25, UVER-paying accounts from 35 to 49, while UVER transactions per account stayed flat at about 9.14 to 9.12. Average UVER payment also rose from 3,121 to 3,564, so larger payment size is a secondary driver.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_09 | system: SkillGuidedAgent

NL request: In 1997, total monthly loan-payment outflows (k_symbol='UVER') grew faster in 'east Bohemia' than in any other region. Identify the underlying driver: is it more new loans being approved in that re...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_09.
> uver_east_bohemia_drivers: [{"region":"central Bohemia","yr":1996,"uver_outflow":1200950,"loan_count":75,"avg_loan_amount":161695.43503808486,"tx_per_account":53.41304347826087},{"region":"central Bohemia","yr":1997,"uver_outflow":2040026,"loan_count":90,"avg_loan_amount":160241.48023255813,"tx_per_account":63.92160278745644},{"region":"east Bohemia","yr":1996,"uver_outflow":998826,"loan_count":67,"avg_loan_amount":138957.2358422939,"tx_per_account":51.92201834862385},{"region":"east Bohemia","yr":1997,"uver_outflow":1593156,"loan_count":84,"avg_loan_amount":159388.24506683642,"tx_per_account":60.50367647058823},{"region":"north Bohemia","yr":1996,"uver_outflow":707444,"loan_count":50,"avg_loan_amount":1123...

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_10 | system: DirectLLM

NL request: The number of loan applications with status='D' (running, in debt) is concentrated in a small number of districts. Identify the top 3 districts by status-D count and investigate whether they share ...

Artifact (RCA report text):
> DirectLLM RCA: Rank districts by status-D loan count, compare the top three with the bottom three, and inspect unemployment, crime, and salary features. Report shared feature patterns as correlations only; the requested output is an outlier-versus-control profile, not a causal model.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_10 | system: SchemaGroundedLLM

NL request: The number of loan applications with status='D' (running, in debt) is concentrated in a small number of districts. Identify the top 3 districts by status-D count and investigate whether they share ...

Artifact (RCA report text):
> The top status-D districts are Hl.m. Praha with 4 status-D loans, Brno - mesto with 3, and Karvina with 3. They do not share a single socioeconomic signature: Praha has very low unemployment A13=0.43 but very high crime count A16=99,107 and salary A11=12,541; Karvina has high unemployment A13=7.75; Brno - mesto is closer to moderate unemployment A13=1.96. Compared with zero-D districts, the strongest common pattern is urban/high-volume and high crime count, not uniformly high unemployment.

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):

---

## task: self_financial_rca_10 | system: SkillGuidedAgent

NL request: The number of loan applications with status='D' (running, in debt) is concentrated in a small number of districts. Identify the top 3 districts by status-D count and investigate whether they share ...

Artifact (RCA report text):
> Executed 1 data-backed Superset SQL Lab query/queries for self_financial_rca_10.
> status_d_top_bottom_districts: [{"comparison_group":"top_3","district_id":1,"district_name":"Hl.m. Praha","region":"Prague","avg_salary":12541,"unemployment_1996":0.43,"crimes_1996":99107,"status_d_count":4,"high_rank":1,"low_rank":77},{"comparison_group":"top_3","district_id":50,"district_name":"Svitavy","region":"east Bohemia","avg_salary":8187,"unemployment_1996":5.45,"crimes_1996":2134,"status_d_count":3,"high_rank":2,"low_rank":74},{"comparison_group":"top_3","district_id":54,"district_name":"Brno - mesto","region":"south Moravia","avg_salary":9897,"unemployment_1996":1.96,"crimes_1996":18696,"status_d_count":3,"high_rank":3,"low_rank":75},{"comparison_group":"bottom_3","district_id":2,"district_name":...

### Rubric: rubric_rca

- dimension: anomaly_correctly_identified
  description: The agent correctly identifies the stated anomaly's existence and direction; if no real anomaly exists, the agent says so honestly.
  score:
  comment:

- dimension: drilldown_dimensions_correct
  description: The chosen drill-down dimensions are appropriate; the agent did not skip a dimension that would clearly explain the anomaly.
  score:
  comment:

- dimension: top_contributor_correct
  description: The agent's claimed top contributor is supported by the data and not misleading.
  score:
  comment:

- dimension: evidence_from_executed_queries
  description: Each contributing factor is backed by a specific executed query whose result is shown.
  score:
  comment:

- dimension: actionable_and_concise
  description: The conclusion is concise; a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):
