# Reproducibility Boundary

This artifact package is designed for transparent inspection of benchmark tasks, scoring logic, and archived outputs. It is not a turnkey public Superset deployment.

## Publicly Reproducible

- Task selection and task wording through `tasks/nl2bi-benchmark.csv`.
- Dataset/schema context through `tasks/datasets/*.md`.
- Layer 3 generated task definitions through `tasks/_gen_layer3.py`.
- Grading dimensions through `tasks/benchmark-scoring-rubric.md` and `tasks/grading-sheet-template.md`.
- Formal scoring and aggregation logic through `scripts/bench/`.
- Raw per-task generated outputs and aggregate summaries through `results/`.

## Requires Local Setup

To rerun artifact-creating experiments, prepare a Superset instance with the selected BIRD-SQL and NVBench schemas, then provide a local Superset access token through environment variables. The included `skills/superset-dev-benchmark/` and `scripts/skill-adapter-codex/` code uses placeholder hostnames and does not contain credentials.

## Not Released

Production deployment logs, internal Superset endpoints, internal messaging integrations, user identifiers, credentials, and production screenshots are intentionally excluded. Deployment evidence in the paper is reported only as aggregate telemetry and anonymized descriptions.
