# Agentic BI for Apache Superset: Public Artifacts

This repository contains the public artifact package for a WISE 2026 industry-track paper on retrofitting Apache Superset for agent-driven business intelligence.

The package is intended to support inspection of the benchmark construction, scoring logic, skill-side Superset procedures, and archived experiment outputs. It does not include internal deployment endpoints, credentials, raw production logs, production screenshots, or large benchmark dataset binaries.

## What Is Included

- `tasks/` — the 90-task NL2BI benchmark, public benchmark schema reports, Layer 3 task generator, grading rubric, and financial virtual-dataset SQL.
- `scripts/bench/` — benchmark runners, scorers, result archivers, and ablation aggregation scripts.
- `scripts/skill-adapter-codex/` — a local skill-loading adapter and benchmark-only token interceptor used for controlled experiments.
- `skills/superset-dev-benchmark/` — a sanitized development Superset skill snapshot used by the SkillGuidedAgent arm.
- `results/` — formal benchmark outputs, grading sheets, summaries, ablation outputs, and raw per-task JSON files.
- `docs/` — reproducibility boundary and sanitization notes.

## What Is Not Included

- Internal Superset hostnames, IP addresses, cookies, JWTs, bearer tokens, session values, or production URLs.
- Production screenshots or raw production logs.
- Large BIRD-SQL or NVBench dataset binaries. Download them from their upstream projects and use the schema reports/task CSV here to reconstruct the selected subset.
- Smoke-test and early pilot artifacts that are not used for the paper tables.
- Manuscript source and LaTeX build artifacts. The repository is an artifact package rather than the paper-writing workspace.

## Quick Start

1. Inspect task definitions in `tasks/nl2bi-benchmark.csv`.
2. Inspect scoring rules in `tasks/benchmark-scoring-rubric.md` and the scorer implementations in `scripts/bench/`.
3. Inspect aggregate table inputs in `results/*/summary.md` and `results/ablation/summary.md`.
4. Inspect raw generated outputs under `results/**/{DirectLLM,SchemaGroundedLLM,SkillGuidedAgent}/*.json`.

End-to-end artifact creation requires a Superset instance loaded with the selected benchmark schemas and a local access token. See `docs/REPRODUCIBILITY.md` for the boundary.
