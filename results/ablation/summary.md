# Combined Ablation Table Values

Generated: 2026-06-15T17:01:46.499Z

This file aggregates existing formal benchmark evidence and direct signal-limited ablation reruns into the paper's combined ablation table.

## Table Values

| Variant | Skill SOP+refs | Verify-repair | Hybrid monitor | NL2Query/NL2Chart | NL2Dash/NL2Anal/NL2RCA | Aggregate | Evidence status |
|---|---|---|---|---:|---:|---:|---|
| Full system | yes | yes | yes | 88.3% | 87.5% | 87.8% | direct |
| Skill, no verify-repair | yes | no | yes | 77.7% | 87.5% | 83.6% | direct |
| Skill, screenshot only (no API) | yes | yes | screenshot only | 88.3% | 29.2% | 52.8% | direct |
| Skill, API only (no screenshot) | yes | yes | API only | 88.3% | 75.7% | 80.7% | direct |
| No skill (schema-grounded), hybrid | no | yes | yes | 86.3% | 39.1% | 57.9% | direct |
| No chart-param references | partial | yes | yes | 74.3% | 73.9% | 74.0% | direct |
| No RCA drill-planning | partial | yes | yes | 88.3% | 74.2% | 79.8% | direct |

## Per-Class Inputs

| Variant | NL2Query | NL2Chart | NL2Dashboard | NL2Analysis | NL2RCA |
|---|---:|---:|---:|---:|---:|
| Full system | 88.5% | 88.0% | 99.2% | 83.3% | 80.0% |
| Skill, no verify-repair | 75.0% | 80.3% | 99.2% | 83.3% | 80.0% |
| Skill, screenshot only (no API) | 88.5% | 88.0% | 87.5% | 0.0% | 0.0% |
| Skill, API only (no screenshot) | 88.5% | 88.0% | 81.7% | 87.5% | 58.0% |
| No skill (schema-grounded), hybrid | 78.5% | 94.0% | 54.2% | 25.0% | 38.0% |
| No chart-param references | 88.5% | 60.0% | 58.3% | 83.3% | 80.0% |
| No RCA drill-planning | 88.5% | 88.0% | 99.2% | 83.3% | 40.0% |

## Evidence Notes

### Full system

- Evidence status: direct
- Evidence: BIRD repair summary + NVBench SkillGuided artifact summary + financial prefilled rubric.
- Caveat: Layer-2/Layer-3 values remain spot-check pending before final submission.

### Skill, no verify-repair

- Evidence status: direct
- Evidence: Archived first-pass/no-retry SkillGuided outputs under `results/bird-layer1-formal/`, `results/nvbench-layer2-formal/`, and `results/financial-formal/`, summarized in `results/ablation/direct-reruns/no-verify-repair/evidence.json`.
- Caveat: Layer-3 formal SkillGuided outputs did not archive a separate post-verdict retry arm, so their no-verify values equal the one-shot formal outputs.

### Skill, screenshot only (no API)

- Evidence status: direct
- Evidence: Fresh signal-limited no-context `ScreenshotOnlyMonitoringAgent` scoring stored in `results/ablation/direct-reruns/screenshot-only-monitoring/signal-limited-score.json`.
- Caveat: Screenshots can judge rendered dashboard presence and label alignment, but not SQL correctness; analysis/RCA receive conservative zero because no screenshot artifact was allowed for those text/report tasks.

### Skill, API only (no screenshot)

- Evidence status: direct
- Evidence: Fresh signal-limited no-context `ApiOnlyMonitoringAgent` scoring stored in `results/ablation/direct-reruns/api-only-monitoring/signal-limited-score.json`.
- Caveat: API evidence supports SQL/query-data correctness, but cannot fully judge rendered layout or screenshot-only visual failures.

### No skill (schema-grounded), hybrid

- Evidence status: direct
- Evidence: SchemaGroundedLLM rows from BIRD, NVBench, and financial formal summaries.
- Caveat: Layer-2 is spec-only and does not prove Superset artifact creation.

### No chart-param references

- Evidence status: direct
- Evidence: Fresh no-context NoChartParamRefsAgent reruns for 30 NVBench chart specs and 10 financial dashboards under `results/ablation/direct-reruns/`; Layer-2 scoring requires artifact execution and therefore records 0/30 verified artifacts.
- Caveat: Layer-2 chart semantics remain strong as specs, but the ablation does not materialize Superset charts without the chart-param reference/tool layer.

### No RCA drill-planning

- Evidence status: direct
- Evidence: Fresh no-context NoRcaDrillPlanningAgent rerun for the 10 financial RCA tasks under `results/ablation/direct-reruns/`.
- Caveat: The no-RCA-drill-planning sub-agent could not authenticate to SQL Lab and therefore produced planned SQL plus inconclusive reports; this is counted as missing executed-evidence rather than repaired by the parent.

## Recommended Manuscript Footnote

Rows marked `direct` are computed from archived benchmark outputs or fresh direct-rerun ablation outputs under `results/ablation/direct-reruns/`. Signal-limited monitoring rows are direct scorer reruns with restricted evidence scopes, not diagnostic proxy estimates.
