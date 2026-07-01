# Manual Grading Sheet — Template

This file is the canonical format for the human-grading sheets the scorer (`scripts/bench/score.mjs`) emits for NL2Dashboard, NL2Analysis, and NL2RCA tasks. The scorer reads this template, substitutes one block per (task × system), and writes `results/smoke/grading-sheet.md` (and later `results/main/grading-sheet.md`).

The grader fills in the score lines per rubric dimension and the optional comment. Once filled, the scorer parses it back into per-task totals.

## File header (emitted once)

```markdown
# Grading Sheet — {benchmark name} — {date}

Score scale: 0 / 1 / 2 (see `tasks/benchmark-scoring-rubric.md`).
- 0: failed, invalid, empty, unsupported by data, or wrong artifact.
- 1: partially correct; main intent visible but important fields missing/wrong.
- 2: correct and useful; satisfied the request and supported by evidence.

Total tasks: {N}. Total grading entries: {N × number_of_systems}.

Fill in the `score:` line on each rubric dimension (a number 0/1/2). Leave `comment:` blank if there is nothing to say. Do not change any other line; the parser is whitespace-sensitive.
```

## NL2Dashboard block (per task × per system)

```markdown
---

## task: {task_id} | system: {system_name}

NL request: {first 200 chars of nl_request}

Artifact link: {dashboard URL or local JSON path; "-" if none}

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
  description: Viz types chosen are appropriate for the analytical intent (e.g. trends → line, mix → pie/stacked, comparison → bar).
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

Notes (optional): {free-form text the grader can write here}
```

## NL2Analysis block

```markdown
---

## task: {task_id} | system: {system_name}

NL request: {first 200 chars of nl_request}

Artifact (analysis report text):
> {first 800 chars of the report}
> ...

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
  description: The report distinguishes "the data shows X" from "X may be caused by Y." Does NOT assert causation where only correlation is supported.
  score:
  comment:

Notes (optional):
```

## NL2RCA block

```markdown
---

## task: {task_id} | system: {system_name}

NL request: {first 200 chars of nl_request}

Artifact (RCA report text):
> {first 800 chars of the report}
> ...

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
  description: The conclusion is concise (no padding); a stakeholder reading it would know what to do next.
  score:
  comment:

Notes (optional):
```

## Aggregation rule

For each (task, system), the scorer reads the six dimension scores (max = 12) and reports both:
- raw_total (sum of dimension scores), and
- normalized = raw_total / max_possible (a value in [0, 1]).

Per-system per-class summary in `results/smoke/summary.md` reports the mean and median normalized score and a histogram.

## Implementation notes for the scorer

- The block delimiters `---` and `## task:` lines are PARSER-CRITICAL; do not change.
- The `dimension:` and `score:` lines are PARSER-CRITICAL; the parser regex is `^- dimension: (\w+)\n  description: .*\n  score: (\d)`.
- A missing `score:` value (the line is `score:` with no number) is treated as ungraded; the scorer reports `ungraded_count` per system and excludes those tasks from the per-system mean.
- A score outside {0, 1, 2} is a parse error.
- Free-form `Notes (optional):` text is preserved verbatim in the output but does not affect scoring.
