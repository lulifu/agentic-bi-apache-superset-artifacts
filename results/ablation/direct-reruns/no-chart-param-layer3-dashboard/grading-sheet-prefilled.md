# Prefilled Grading Sheet - Financial Formal Benchmark - 2026-06-15

This sheet is a scorer-assisted prefill, not the final human-adjudicated result.
Scores marked `[auto]` are based on deterministic checks; `[agent_prefill]` scores are conservative Codex judgments from stored artifacts and should be spot-checked before paper submission.

Score scale: 0 / 1 / 2.

---

## task: self_financial_dashboard_01 | system: NoChartParamRefsAgent

NL request: Build a monthly executive overview dashboard for the lending portfolio in 1996. Include a KPI tile for total approved loan amount, a time-series chart of monthly approved loan count, a stacked bar showing loan status mix (finished OK / f...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_01.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 4 chart(s); artifact contains 4.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.91; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: kpi, line, stacked_bar, bar; actual: kpi, line, stacked_bar, bar.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_02 | system: NoChartParamRefsAgent

NL request: Build a regional risk dashboard. For each of the eight Czech regions, show: number of clients, count of active loans (status C or D), default rate (B over A+B for finished loans), and average client salary at the region's branch. Use a r...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_02.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 2 chart(s); artifact contains 2.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.75; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: table, bar; actual: table, bar.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_03 | system: NoChartParamRefsAgent

NL request: Create a credit-card product overview dashboard. Show issuance volume by month (line, by card type), issued-card mix by type (pie), and the count of card-withdrawal transactions per month for 1997 (line) so we can see whether issuance le...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_03.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 3 chart(s); artifact contains 3.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.83; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: line, pie, line; actual: line, pie, line.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_04 | system: NoChartParamRefsAgent

NL request: Build a transaction-mix dashboard for account holders. Show: total transaction amount by transaction type (PRIJEM=credit / VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), share of transactions by k_symbol purpose code (pie), and...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_04.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 3 chart(s); artifact contains 3.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 1.00; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: stacked_bar, pie, line; actual: stacked_bar, pie, line.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_05 | system: NoChartParamRefsAgent

NL request: Create a client-demographics dashboard. Show a histogram of client age (in years; ages computed against 1998-12-31 as the reference date), a gender breakdown bar, an age-vs-loan-size scatter for clients who hold loans, and a table of the...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_05.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 4 chart(s); artifact contains 4.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.76; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: histogram, bar, scatter, table; actual: histogram, bar, scatter, table.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_06 | system: NoChartParamRefsAgent

NL request: Build a quarterly transaction-volume dashboard for each of the five largest districts (by inhabitants A4). Show one line chart per district plus a combined bar comparing total quarterly transaction amount across the five districts in 199...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_06.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 6 chart(s); artifact contains 6.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.84; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: line, bar; actual: line, line, line, line, line, bar.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_07 | system: NoChartParamRefsAgent

NL request: Build a loan-portfolio aging dashboard for 1998. Slice loans by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), and by approval cohort year. Include: stacked bar of loan count by status x cohort, table of average loan amount ...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_07.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 3 chart(s); artifact contains 3.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.87; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: stacked_bar, table, kpi; actual: stacked_bar, table, kpi.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_08 | system: NoChartParamRefsAgent

NL request: Build a card-program acquisition dashboard. Show quarterly issuance trend by card type (gold / classic / junior, 1994-1998), a funnel chart from card issuance to first card-withdrawal transaction (counts of clients reaching each stage), ...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_08.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 3 chart(s); artifact contains 3.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.93; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: line, funnel, kpi; actual: line, funnel, kpi.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_09 | system: NoChartParamRefsAgent

NL request: Create a household-payment risk dashboard. Show monthly total household-payment outflow (k_symbol='SIPO') for 1997-1998 (line), accounts whose household payments exceed twice their 1996 monthly average (table of account_id with the ratio...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_09.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 3 chart(s); artifact contains 3.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 1.00; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: line, table, bar; actual: line, table, bar.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2

---

## task: self_financial_dashboard_10 | system: NoChartParamRefsAgent

NL request: Build a 'new-account growth and quality' dashboard for Branch Manager review. Charts: monthly new-account openings (line, 1993-1998), share of new accounts by frequency preference (POPLATEK MESICNE / TYDNE / PO OBRATU), and a heatmap of ...

Artifact link: results/ablation/direct-reruns/no-chart-param-layer3-dashboard/NoChartParamRefsAgent/self_financial_dashboard_10.json

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  description: Dashboard create/update API succeeded; layout JSON validates against Superset position_json.
  score: 0
  comment: [auto] Only a text/spec artifact was produced; no Superset dashboard was created.

- dimension: expected_charts_present
  description: All expected charts in the request are represented; no duplicates or extras that don't serve the request.
  score: 2
  comment: [auto] Expected at least 4 chart(s); artifact contains 4.

- dimension: dataset_metric_correctness
  description: Each chart uses the correct dataset, metric(s), dimension(s), filter(s), and time range.
  score: 2
  comment: [agent_prefill] Spec/token coverage against expected metrics/dimensions/filters is 0.94; not platform-executed.

- dimension: viz_type_appropriateness
  description: Viz types chosen are appropriate for the analytical intent.
  score: 2
  comment: [auto] Expected viz families: line, pie, heatmap, kpi; actual: line, pie, heatmap, kpi.

- dimension: layout_legibility
  description: Layout supports scanning and comparison; KPI/headline charts are placed prominently.
  score: 1
  comment: [agent_prefill] Spec includes layout intent but no rendered dashboard layout.

- dimension: render_and_screenshot
  description: Dashboard query/screenshot succeeds; no broken cells.
  score: 0
  comment: [auto] No platform render/query evidence; screenshot not applicable.

Average score: 1.17 / 2
