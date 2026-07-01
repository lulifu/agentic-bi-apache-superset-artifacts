# API-Only Monitoring Direct Evidence

This directory stores the direct signal-limited sub-agent scoring for the `Skill, API only (no screenshot)` row.

The scorer was allowed to inspect only benchmark task text and raw `SkillGuidedAgent` JSON files containing structured chart metadata, chart-data previews, SQL text, and query result rows. It was not allowed to inspect PNG screenshots, screenshot manifests, dashboard screenshot evidence markdown, existing score sheets, or ablation summaries. The resulting class scores are stored in `signal-limited-score.json` and consumed by `scripts/bench/aggregate_ablation_table.mjs`.

Important caveat: API evidence is strong for SQL-backed analysis and queryable chart data, but it cannot fully judge rendered layout or visual failures. Dashboard layout and screenshot/render dimensions are therefore capped at partial credit.
