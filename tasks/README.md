# Benchmark Tasks

This directory contains the public benchmark artifacts used by the paper.

- `nl2bi-benchmark.csv` is the 90-task benchmark: 30 BIRD-SQL NL2Query tasks, 30 NVBench NL2Chart tasks, and 30 Layer 3 financial-schema tasks for dashboards, analysis, and RCA.
- `datasets/` contains schema reports for the selected public benchmark databases.
- `virtual-datasets/financial/` contains SQL for reusable Superset virtual datasets used by Layer 3 artifact-creating tasks.
- `_gen_layer3.py` is the generator for the self-built Layer 3 task rows.
- `benchmark-scoring-rubric.md` and `grading-sheet-template.md` define the grading dimensions used for artifact and analysis tasks.
