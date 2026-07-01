# Dashboard Grading Agent Prefill - Financial Formal Benchmark

Generated: 2026-06-14T19:43:22.247Z

This is an agent-assisted prefill for the 10 `SkillGuidedAgent` dashboard tasks. It combines stored chart-data evidence, Superset dashboard metadata, and serial dashboard screenshots. Treat it as a grading aid; final paper numbers should still receive human spot-checking.

Score scale: 0 / 1 / 2.

## Aggregate

| System | Tasks | Dimensions | Avg / 2 | Normalized % |
|---|---:|---:|---:|---:|
| SkillGuidedAgent | 10 | 60 | 1.98 | 99.2 |

---

## task: self_financial_dashboard_01 | system: SkillGuidedAgent

NL request: Build a monthly executive overview dashboard for the lending portfolio in 1996. Include a KPI tile for total approved loan amount, a time-series chart of monthly approved loan count, a stacked bar showing loan status mix (finished OK / finished default / ru...

Artifact link: Superset dashboard #85 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_01_dashboard_85.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #85 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 4 chart(s); dashboard API reports 4, artifact records 4.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=1, 12, 12, 5.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: kpi, line, stacked_bar, bar; actual: kpi, line, bar, bar.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x1024 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (56863 bytes, sha256 3f437e6dfb87...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_02 | system: SkillGuidedAgent

NL request: Build a regional risk dashboard. For each of the eight Czech regions, show: number of clients, count of active loans (status C or D), default rate (B over A+B for finished loans), and average client salary at the region's branch. Use a regional choropleth-s...

Artifact link: Superset dashboard #86 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_02_dashboard_86.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #86 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 2 chart(s); dashboard API reports 2, artifact records 2.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=8, 8.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: table, bar; actual: table, bar.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x896 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (53759 bytes, sha256 c8b8bed550a0...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_03 | system: SkillGuidedAgent

NL request: Create a credit-card product overview dashboard. Show issuance volume by month (line, by card type), issued-card mix by type (pie), and the count of card-withdrawal transactions per month for 1997 (line) so we can see whether issuance leads transaction volume.

Artifact link: Superset dashboard #89 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_03_dashboard_89.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #89 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 3 chart(s); dashboard API reports 3, artifact records 3.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=59, 3, 12.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: line, pie, line; actual: line, pie, line.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x832 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (75005 bytes, sha256 fcdf7cfdab13...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_04 | system: SkillGuidedAgent

NL request: Build a transaction-mix dashboard for account holders. Show: total transaction amount by transaction type (PRIJEM=credit / VYDAJ=withdrawal) per month for 1997-1998 (stacked bar), share of transactions by k_symbol purpose code (pie), and monthly trend of av...

Artifact link: Superset dashboard #87 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_04_dashboard_87.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #87 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 3 chart(s); dashboard API reports 3, artifact records 3.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=24, 9, 24.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: stacked_bar, pie, line; actual: bar, pie, line.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x832 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (56308 bytes, sha256 3a7432e777dc...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_05 | system: SkillGuidedAgent

NL request: Create a client-demographics dashboard. Show a histogram of client age (in years; ages computed against 1998-12-31 as the reference date), a gender breakdown bar, an age-vs-loan-size scatter for clients who hold loans, and a table of the top 10 districts by...

Artifact link: Superset dashboard #90 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_05_dashboard_90.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #90 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 4 chart(s); dashboard API reports 4, artifact records 4.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=1000, 2, 52, 10.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: histogram, bar, scatter, table; actual: histogram, bar, scatter, table.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x832 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (60958 bytes, sha256 8b6d0499ff95...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_06 | system: SkillGuidedAgent

NL request: Build a quarterly transaction-volume dashboard for each of the five largest districts (by inhabitants A4). Show one line chart per district plus a combined bar comparing total quarterly transaction amount across the five districts in 1997, in a 2x3 grid lay...

Artifact link: Superset dashboard #92 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_06_dashboard_92.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #92 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 6 chart(s); dashboard API reports 6, artifact records 6.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=4, 4, 4, 4, 4, 4.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: line, bar; actual: line, line, line, line, line, bar.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x736 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (53208 bytes, sha256 b930c59dd514...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_07 | system: SkillGuidedAgent

NL request: Build a loan-portfolio aging dashboard for 1998. Slice loans by status, by duration bucket (12 / 24 / 36 / 48 / 60 months), and by approval cohort year. Include: stacked bar of loan count by status x cohort, table of average loan amount by duration bucket a...

Artifact link: Superset dashboard #88 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_07_dashboard_88.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #88 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 3 chart(s); dashboard API reports 3, artifact records 3.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=6, 20, 1.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: stacked_bar, table, kpi; actual: bar, table, kpi.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x832 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (59459 bytes, sha256 51f6e901828d...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_08 | system: SkillGuidedAgent

NL request: Build a card-program acquisition dashboard. Show quarterly issuance trend by card type (gold / classic / junior, 1994-1998), a funnel chart from card issuance to first card-withdrawal transaction (counts of clients reaching each stage), and a KPI tile for t...

Artifact link: Superset dashboard #93 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_08_dashboard_93.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #93 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 3 chart(s); dashboard API reports 3, artifact records 3.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=20, 2, 1.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: line, funnel, kpi; actual: line, funnel, kpi.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x832 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (58241 bytes, sha256 53d54390ee50...).

Average score: 2.00 / 2

---

## task: self_financial_dashboard_09 | system: SkillGuidedAgent

NL request: Create a household-payment risk dashboard. Show monthly total household-payment outflow (k_symbol='SIPO') for 1997-1998 (line), accounts whose household payments exceed twice their 1996 monthly average (table of account_id with the ratio), and a regional ba...

Artifact link: Superset dashboard #94 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_09_dashboard_94.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #94 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 3 chart(s); dashboard API reports 3, artifact records 3.

- dimension: dataset_metric_correctness
  score: 1
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=false; non-empty chart-data rowcounts=24, 13, 8.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: line, table, bar; actual: line, table, bar.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x832 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (70611 bytes, sha256 b2d99da52f56...).

Average score: 1.83 / 2

---

## task: self_financial_dashboard_10 | system: SkillGuidedAgent

NL request: Build a 'new-account growth and quality' dashboard for Branch Manager review. Charts: monthly new-account openings (line, 1993-1998), share of new accounts by frequency preference (POPLATEK MESICNE / TYDNE / PO OBRATU), and a heatmap of new-account count by...

Artifact link: Superset dashboard #91 (internal URL omitted)
Screenshot: results/financial-formal/dashboard-evidence/screenshots/self_financial_dashboard_10_dashboard_91.png

### Rubric: rubric_dashboard

- dimension: dashboard_create_success
  score: 2
  comment: [agent_prefill] Superset dashboard #91 metadata was fetched successfully.

- dimension: expected_charts_present
  score: 2
  comment: [agent_prefill] Expected at least 4 chart(s); dashboard API reports 4, artifact records 4.

- dimension: dataset_metric_correctness
  score: 2
  comment: [agent_prefill] Financial dataset IDs=true; chart validation=true; non-empty chart-data rowcounts=60, 3, 1, 300.

- dimension: viz_type_appropriateness
  score: 2
  comment: [agent_prefill] Expected viz families: line, pie, heatmap, kpi; actual: line, pie, kpi, heatmap.

- dimension: layout_legibility
  score: 2
  comment: [agent_prefill] Dashboard screenshot rendered as 1600x1264 PNG; visual spot-check still recommended for final paper numbers.

- dimension: render_and_screenshot
  score: 2
  comment: [agent_prefill] Serial screenshot API succeeded; saved local PNG (92560 bytes, sha256 ece44075b032...).

Average score: 2.00 / 2
