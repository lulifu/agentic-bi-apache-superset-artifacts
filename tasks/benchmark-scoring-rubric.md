# Benchmark Scoring Rubric

Use this file to keep human scoring consistent across baseline systems.

## Mapping from `nl2bi-benchmark.csv` `automatic_check` column

| `automatic_check` value | Section to apply |
|---|---|
| `result_set_equivalence` | NL2Query (automatic only; no human grading needed) |
| `vegalite_to_echarts_semantic_equivalence` | NL2Chart (automatic + manual fallback) |
| `rubric_dashboard` | NL2Dashboard |
| `rubric_analysis` | Analysis |
| `rubric_rca` | RCA |

## General 0-2 Score

- 0: Failed, invalid, empty, unsupported by data, or created the wrong artifact.
- 1: Partially correct; the main intent is visible but one or more important dataset, metric, filter, time, or artifact requirements are wrong or missing.
- 2: Correct and useful; the artifact or analysis satisfies the request and is supported by executable evidence.

## NL2Query

Automatic checks:

- SQL executes.
- Correct database/dataset.
- Correct columns/metrics.
- Correct time range.
- Correct filters.
- Result matches oracle values within tolerance.

## NL2Chart

Automatic checks:

- Chart create API succeeds.
- Created chart uses the expected dataset.
- Query returns non-empty data.
- Chart type matches the task.
- Metrics, dimensions, filters, and time range match expectations.

Manual checks:

- Visualization is appropriate for the analytical intent.
- Labels and aggregation semantics are understandable.

## NL2Dashboard

Automatic checks:

- Dashboard create/update API succeeds.
- Expected charts are present.
- Layout contains no duplicate or missing charts.
- Dashboard query/screenshot succeeds.

Manual checks:

- Dashboard organization supports scanning and comparison.
- Chart set covers the user request.

## Analysis

Automatic checks:

- Latest value is correct.
- Baseline average is correct.
- Percentage change is correct.
- Trend direction is correct.

Manual checks:

- Conclusions are supported by queried data.
- Report separates observations from hypotheses.
- Report does not overclaim causal explanations.

## RCA

Score each dimension from 0 to 2 and average:

- Correct anomaly identification.
- Correct drill-down dimensions.
- Correct top contributor.
- Evidence support from executed queries.
- Actionable and concise conclusion.

