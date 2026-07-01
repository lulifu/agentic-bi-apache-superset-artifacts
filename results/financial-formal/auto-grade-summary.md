# Auto Grade Summary - Financial Formal Benchmark

Generated: 2026-06-12T05:07:26.511Z

## Aggregate Scores

| System | Class | Entries | Dimensions | Avg / 2 | Normalized % |
|---|---|---:|---:|---:|---:|
| DirectLLM | query | 6 | 12 | 0.67 | 33.3 |
| SchemaGroundedLLM | query | 6 | 12 | 2.00 | 100.0 |
| SkillGuidedAgent | query | 6 | 12 | 2.00 | 100.0 |
| DirectLLM | dashboard | 10 | 60 | 1.17 | 58.3 |
| SchemaGroundedLLM | dashboard | 10 | 60 | 1.08 | 54.2 |
| SkillGuidedAgent | dashboard | 10 | 60 | 1.98 | 99.2 |
| DirectLLM | analysis | 10 | 60 | 0.82 | 40.8 |
| SchemaGroundedLLM | analysis | 10 | 60 | 0.50 | 25.0 |
| SkillGuidedAgent | analysis | 10 | 60 | 1.67 | 83.3 |
| DirectLLM | rca | 10 | 50 | 0.80 | 40.0 |
| SchemaGroundedLLM | rca | 10 | 50 | 0.76 | 38.0 |
| SkillGuidedAgent | rca | 10 | 50 | 1.60 | 80.0 |

## Interpretation Guardrails

- Query scores are deterministic SQL execution and result-set equivalence checks against the stored PostgreSQL oracle.
- Dashboard scores mix deterministic artifact checks with conservative agent-prefill judgments for semantic/layout dimensions.
- Analysis and RCA scores are prefilled from stored evidence; because many baseline artifacts are plans/specs without executed rows, evidence-support dimensions are intentionally strict.
- Use this file to reduce manual work, then spot-check the prefilled sheet before copying numbers into the paper.
