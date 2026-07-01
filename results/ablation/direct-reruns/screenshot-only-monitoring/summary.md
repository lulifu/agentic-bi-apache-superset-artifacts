# Screenshot-Only Monitoring Direct Evidence

This directory stores the direct signal-limited sub-agent scoring for the `Skill, screenshot only (no API)` row.

The scorer was allowed to inspect only the benchmark task text and the ten rendered financial dashboard screenshots. It was not allowed to read raw result JSON, existing score sheets, dashboard evidence markdown, or ablation summaries. The resulting class scores are stored in `signal-limited-score.json` and consumed by `scripts/bench/aggregate_ablation_table.mjs`.

Important caveat: screenshots support rendered dashboard presence, chart mix, and visible label checks, but they do not prove SQL joins, filters, or numerical result equivalence. Analysis and RCA classes receive conservative zero scores because this ablation provided no permitted screenshot artifact for those text/report tasks.
