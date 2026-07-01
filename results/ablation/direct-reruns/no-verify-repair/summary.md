# No Verify-Repair Direct Evidence

This directory records the direct evidence used for the `Skill, no verify-repair` row in the combined ablation table.

The arm uses archived first-pass/no-retry outputs, not the repaired outputs:

- NL2Query: `results/bird-layer1-formal/SkillGuidedAgent/*.json`
- NL2Chart: `results/nvbench-layer2-formal/SkillGuidedAgent/*.json`, scored as chart-spec semantics without the artifact-execution/repair bonus.
- NL2Dashboard/NL2Analysis/NL2RCA: `results/financial-formal/SkillGuidedAgent/*.json`, which were archived as one-shot formal executions without a separate LLM repair-loop arm.

Class scores are stored in `evidence.json` and consumed by `scripts/bench/aggregate_ablation_table.mjs`.
