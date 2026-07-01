# NVBench Layer-2 Ablation Summary

Generated: 2026-06-14T20:53:42.511Z

| Arm | Removed capability | Evidence captured | Current result |
|---|---|---|---|
| DirectLLM | schema grounding and Superset skill/tool execution | chart spec only | scored if archived result JSON exists |
| SchemaGroundedLLM | Superset skill/tool execution | schema-grounded chart spec only | scored if archived result JSON exists |
| SkillGuidedAgent | none | virtual dataset + chart + chart-data + serial screenshot | 30/30 artifacts verified |

The most concrete Layer-2 ablation signal is execution capability: only SkillGuidedAgent proves that the generated chart can be materialized and rendered in Superset. DirectLLM and SchemaGroundedLLM may still produce plausible chart specs, but without the skill/tool layer those specs remain unexecuted plans.
