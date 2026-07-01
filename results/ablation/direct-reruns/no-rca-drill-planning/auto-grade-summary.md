# Auto Grade Summary - Financial Formal Benchmark

Generated: 2026-06-15T16:39:34.391Z

## Aggregate Scores

| System | Class | Entries | Dimensions | Avg / 2 | Normalized % |
|---|---|---:|---:|---:|---:|
| NoRcaDrillPlanningAgent | rca | 10 | 50 | 0.80 | 40.0 |

## Interpretation Guardrails

- Query scores are deterministic SQL execution and result-set equivalence checks against the stored PostgreSQL oracle.
- Dashboard scores mix deterministic artifact checks with conservative agent-prefill judgments for semantic/layout dimensions.
- Analysis and RCA scores are prefilled from stored evidence; because many baseline artifacts are plans/specs without executed rows, evidence-support dimensions are intentionally strict.
- Use this file to reduce manual work, then spot-check the prefilled sheet before copying numbers into the paper.
