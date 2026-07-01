# Benchmark Result Artifacts

This directory stores the formal experiment evidence used for the paper tables.

## Layout

- `bird-layer1-formal/` — Layer 1 BIRD NL2Query first-pass outputs for DirectLLM, SchemaGroundedLLM, and SkillGuidedAgent, plus strict SQL execution / result-set scoring summaries.
- `bird-layer1-repair/` — oracle-blind SkillGuided repair-loop outputs and scores.
- `nvbench-layer2-formal/` — Layer 2 NVBench NL2Chart chart-spec outputs for all systems and Superset chart-artifact evidence for SkillGuidedAgent.
- `financial-formal/` — Layer 3 BIRD `financial` query, dashboard, analysis, and RCA outputs plus grading sheets.
- `ablation/` — aggregate ablation table values plus direct reruns / signal-limited scoring evidence for ablation arms.

Smoke-test and early pilot outputs are intentionally excluded from this public package because they are not paper table inputs.

## Raw JSON Policy

Raw per-task JSON outputs under `results/**/{system}/` are retained so paper numbers can be traced back to generated artifacts. The JSON files include generated SQL, chart/dashboard specs, row-count evidence, and development Superset artifact IDs where relevant.

Internal hostnames are stripped from artifact URLs, leaving only relative paths or IDs. Tokens, cookies, and bearer credentials must never be committed. Screenshot PNGs are excluded; committed markdown/TSV evidence may record local screenshot paths, dimensions, and hashes for traceability.
