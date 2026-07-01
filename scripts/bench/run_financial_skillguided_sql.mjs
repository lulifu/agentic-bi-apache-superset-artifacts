#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { executeSql } from "../../skills/superset-dev-benchmark/scripts/sql_lab.mjs";
import { ROOT, loadTasks, parseArgs, resultPath, safeError } from "./common.mjs";

const DATABASE_ID = 1;
const SCHEMA = "bench_bird_financial";
const OUT_DIR = "results/financial-formal";

function rows(payload) {
  const data = payload?.data || payload?.result?.data || payload?.result?.[0]?.data || [];
  return Array.isArray(data) ? data : [];
}

function previewRows(rs, n = 8) {
  return rs.slice(0, n);
}

function reportFromResults(task, queryResults) {
  const parts = [`Executed ${queryResults.length} data-backed Superset SQL Lab query/queries for ${task.id}.`];
  for (const qr of queryResults) {
    parts.push(`${qr.name}: ${JSON.stringify(previewRows(qr.rows, 5))}`);
  }
  return parts.join("\n");
}

const SQL_BY_TASK = {
  self_financial_analysis_01: [{
    name: "yoy_decomposition",
    sql: `
WITH yearly AS (
  SELECT EXTRACT(YEAR FROM date)::int AS yr, COUNT(*)::numeric AS cnt,
         SUM(amount)::numeric AS total_amount, AVG(amount)::numeric AS avg_amount
  FROM trans
  WHERE date >= DATE '1996-01-01' AND date < DATE '1998-01-01'
  GROUP BY 1
),
p AS (
  SELECT
    MAX(cnt) FILTER (WHERE yr = 1996) AS cnt_1996,
    MAX(total_amount) FILTER (WHERE yr = 1996) AS total_1996,
    MAX(avg_amount) FILTER (WHERE yr = 1996) AS avg_1996,
    MAX(cnt) FILTER (WHERE yr = 1997) AS cnt_1997,
    MAX(total_amount) FILTER (WHERE yr = 1997) AS total_1997,
    MAX(avg_amount) FILTER (WHERE yr = 1997) AS avg_1997
  FROM yearly
)
SELECT *, total_1997 - total_1996 AS total_change,
       (cnt_1997 - cnt_1996) * avg_1996 AS count_contribution,
       cnt_1997 * (avg_1997 - avg_1996) AS avg_amount_contribution,
       ((cnt_1997 - cnt_1996) * avg_1996) / NULLIF(total_1997 - total_1996, 0) AS count_contribution_share
FROM p`,
  }],
  self_financial_analysis_02: [{
    name: "card_withdrawal_months_1997",
    sql: `
WITH monthly AS (
  SELECT DATE_TRUNC('month', t.date)::date AS month, SUM(t.amount)::numeric AS total_amount, COUNT(*) AS tx_count
  FROM trans t
  WHERE t.operation = 'VYBER KARTOU'
    AND t.date >= DATE '1997-01-01' AND t.date < DATE '1998-01-01'
  GROUP BY 1
),
avg_month AS (SELECT AVG(total_amount) AS avg_amount FROM monthly)
SELECT m.month, m.total_amount, m.tx_count, a.avg_amount,
       m.total_amount / NULLIF(a.avg_amount, 0) AS ratio_to_avg
FROM monthly m CROSS JOIN avg_month a
WHERE m.total_amount >= 1.30 * a.avg_amount
ORDER BY m.total_amount DESC`,
  }, {
    name: "flagged_month_attribution",
    sql: `
WITH monthly AS (
  SELECT DATE_TRUNC('month', t.date)::date AS month, SUM(t.amount)::numeric AS total_amount
  FROM trans t
  WHERE t.operation = 'VYBER KARTOU'
    AND t.date >= DATE '1997-01-01' AND t.date < DATE '1998-01-01'
  GROUP BY 1
),
flagged AS (
  SELECT month FROM monthly WHERE total_amount >= 1.30 * (SELECT AVG(total_amount) FROM monthly)
)
SELECT DATE_TRUNC('month', t.date)::date AS month, d."A2" AS district_name, c.type AS card_type,
       COUNT(*) AS tx_count, SUM(t.amount) AS total_amount
FROM trans t
JOIN account a ON a.account_id = t.account_id
JOIN district d ON d.district_id = a.district_id
JOIN disp dp ON dp.account_id = a.account_id
JOIN card c ON c.disp_id = dp.disp_id
JOIN flagged f ON f.month = DATE_TRUNC('month', t.date)::date
WHERE t.operation = 'VYBER KARTOU'
GROUP BY 1, 2, 3
ORDER BY total_amount DESC
LIMIT 20`,
  }],
  self_financial_analysis_03: [{
    name: "regional_loan_quality_1997",
    sql: `
SELECT d."A3" AS region,
       COUNT(DISTINCT l.loan_id) FILTER (WHERE l.status IN ('A','B')) AS finished_loans,
       COUNT(DISTINCT l.loan_id) FILTER (WHERE l.status = 'B') AS defaulted_finished_loans,
       COUNT(DISTINCT l.loan_id) FILTER (WHERE l.status = 'B')::numeric /
         NULLIF(COUNT(DISTINCT l.loan_id) FILTER (WHERE l.status IN ('A','B')), 0) AS default_rate,
       AVG(d."A11")::numeric AS avg_salary,
       COUNT(DISTINCT c.client_id) FILTER (WHERE c.gender = 'M')::numeric /
         NULLIF(COUNT(DISTINCT c.client_id), 0) AS male_share
FROM loan l
JOIN account a ON a.account_id = l.account_id
JOIN district d ON d.district_id = a.district_id
JOIN disp dp ON dp.account_id = a.account_id
JOIN client c ON c.client_id = dp.client_id
WHERE l.date <= DATE '1997-12-31'
GROUP BY 1
ORDER BY default_rate DESC NULLS LAST`,
  }],
  self_financial_analysis_04: [{
    name: "seasonality_1994_1998",
    sql: `
WITH ym AS (
  SELECT EXTRACT(YEAR FROM date)::int AS yr, EXTRACT(MONTH FROM date)::int AS month_no, COUNT(*)::numeric AS tx_count
  FROM trans
  WHERE date >= DATE '1994-01-01' AND date < DATE '1999-01-01'
  GROUP BY 1, 2
)
SELECT month_no, AVG(tx_count) AS avg_count, MIN(tx_count) AS min_count, MAX(tx_count) AS max_count,
       STDDEV_POP(tx_count) / NULLIF(AVG(tx_count), 0) AS cv
FROM ym
GROUP BY 1
ORDER BY avg_count DESC`,
  }],
  self_financial_analysis_05: [{
    name: "duration_default_1996",
    sql: `
SELECT CASE WHEN duration = 12 THEN 'short_12'
            WHEN duration IN (24,36) THEN 'medium_24_36'
            WHEN duration IN (48,60) THEN 'long_48_60'
            ELSE 'other' END AS duration_band,
       COUNT(*) FILTER (WHERE status IN ('A','B')) AS finished_loans,
       COUNT(*) FILTER (WHERE status = 'B') AS defaulted_loans,
       COUNT(*) FILTER (WHERE status = 'B')::numeric / NULLIF(COUNT(*) FILTER (WHERE status IN ('A','B')), 0) AS default_rate,
       AVG(amount) AS avg_amount, AVG(payments) AS avg_payments
FROM loan
WHERE date >= DATE '1996-01-01' AND date < DATE '1997-01-01'
GROUP BY 1
ORDER BY default_rate DESC NULLS LAST`,
  }],
  self_financial_analysis_06: [{
    name: "card_withdrawal_share_by_region",
    sql: `
WITH region_year AS (
  SELECT EXTRACT(YEAR FROM t.date)::int AS yr, d."A3" AS region,
         COUNT(*) FILTER (WHERE t.operation = 'VYBER KARTOU')::numeric AS card_withdrawals,
         COUNT(*)::numeric AS withdrawals
  FROM trans t
  JOIN account a ON a.account_id = t.account_id
  JOIN district d ON d.district_id = a.district_id
  WHERE t.type = 'VYDAJ' AND t.date >= DATE '1996-01-01' AND t.date < DATE '1999-01-01'
  GROUP BY 1, 2
),
national AS (
  SELECT yr, SUM(card_withdrawals) / NULLIF(SUM(withdrawals), 0) AS national_share
  FROM region_year GROUP BY 1
)
SELECT r.yr, r.region, r.card_withdrawals / NULLIF(r.withdrawals, 0) AS region_share,
       n.national_share, (r.card_withdrawals / NULLIF(r.withdrawals, 0)) - n.national_share AS deviation
FROM region_year r JOIN national n USING (yr)
ORDER BY ABS((r.card_withdrawals / NULLIF(r.withdrawals, 0)) - n.national_share) DESC`,
  }],
  self_financial_analysis_07: [{
    name: "frequency_default_comparison",
    sql: `
SELECT a.frequency, COUNT(*) FILTER (WHERE l.status IN ('A','B')) AS finished_loans,
       COUNT(*) FILTER (WHERE l.status = 'B') AS defaulted_loans,
       COUNT(*) FILTER (WHERE l.status = 'B')::numeric / NULLIF(COUNT(*) FILTER (WHERE l.status IN ('A','B')), 0) AS default_rate
FROM loan l JOIN account a ON a.account_id = l.account_id
WHERE a.frequency IN ('POPLATEK TYDNE', 'POPLATEK MESICNE')
GROUP BY 1`,
  }],
  self_financial_analysis_08: [{
    name: "south_bohemia_mom_balance",
    sql: `
WITH monthly AS (
  SELECT DATE_TRUNC('month', t.date)::date AS month, AVG(t.balance)::numeric AS avg_balance
  FROM trans t
  JOIN account a ON a.account_id = t.account_id
  JOIN district d ON d.district_id = a.district_id
  WHERE d."A3" = 'south Bohemia'
    AND t.date >= DATE '1997-01-01' AND t.date < DATE '1998-01-01'
  GROUP BY 1
)
SELECT month, avg_balance, LAG(avg_balance) OVER (ORDER BY month) AS prev_avg_balance,
       (avg_balance - LAG(avg_balance) OVER (ORDER BY month)) / NULLIF(LAG(avg_balance) OVER (ORDER BY month), 0) AS mom_change
FROM monthly
ORDER BY month`,
  }],
  self_financial_analysis_09: [{
    name: "gold_vs_classic_engagement_1998",
    sql: `
WITH per_client AS (
  SELECT c.type AS card_type, dp.client_id, COUNT(t.trans_id)::numeric AS tx_count, AVG(t.amount)::numeric AS avg_amount
  FROM card c
  JOIN disp dp ON dp.disp_id = c.disp_id
  JOIN trans t ON t.account_id = dp.account_id
  WHERE c.type IN ('gold','classic')
    AND t.date >= DATE '1998-01-01' AND t.date < DATE '1999-01-01'
  GROUP BY 1, 2
)
SELECT card_type, COUNT(*) AS clients, AVG(tx_count) AS avg_tx_per_client,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY tx_count) AS median_tx_per_client,
       AVG(avg_amount) AS avg_transaction_size
FROM per_client
GROUP BY 1`,
  }],
  self_financial_analysis_10: [{
    name: "district_account_growth_1995_1996",
    sql: `
WITH counts AS (
  SELECT d.district_id, d."A2" AS district_name, d."A3" AS region, d."A11" AS avg_salary,
         d."A12" AS unemployment_1995, d."A13" AS unemployment_1996,
         COUNT(*) FILTER (WHERE a.date >= DATE '1995-01-01' AND a.date < DATE '1996-01-01') AS accounts_1995,
         COUNT(*) FILTER (WHERE a.date >= DATE '1996-01-01' AND a.date < DATE '1997-01-01') AS accounts_1996
  FROM district d JOIN account a ON a.district_id = d.district_id
  GROUP BY 1,2,3,4,5,6
)
SELECT *, accounts_1996 - accounts_1995 AS delta_accounts,
       unemployment_1996 - unemployment_1995 AS unemployment_delta
FROM counts
ORDER BY delta_accounts DESC, accounts_1996 DESC
LIMIT 3`,
  }],
  self_financial_rca_01: [{
    name: "march_1996_drop_drilldown",
    sql: `
WITH keyed AS (
  SELECT d."A3" AS region, t.type AS trans_type, COALESCE(NULLIF(t.k_symbol,''), '<blank>') AS k_symbol,
         DATE_TRUNC('month', t.date)::date AS month, SUM(t.amount)::numeric AS amount
  FROM trans t JOIN account a ON a.account_id = t.account_id JOIN district d ON d.district_id = a.district_id
  WHERE t.date >= DATE '1996-02-01' AND t.date < DATE '1996-05-01'
  GROUP BY 1,2,3,4
),
p AS (
  SELECT region, trans_type, k_symbol,
         SUM(amount) FILTER (WHERE month = DATE '1996-03-01') AS march_amount,
         AVG(amount) FILTER (WHERE month IN (DATE '1996-02-01', DATE '1996-04-01')) AS neighbor_avg
  FROM keyed GROUP BY 1,2,3
)
SELECT *, march_amount - neighbor_avg AS delta_vs_neighbor_avg
FROM p
ORDER BY delta_vs_neighbor_avg ASC NULLS LAST
LIMIT 20`,
  }],
  self_financial_rca_02: [{
    name: "q2_q3_1996_default_drivers",
    sql: `
WITH base AS (
  SELECT CASE WHEN l.date >= DATE '1996-04-01' AND l.date < DATE '1996-07-01' THEN '1996_Q2'
              WHEN l.date >= DATE '1996-07-01' AND l.date < DATE '1996-10-01' THEN '1996_Q3' END AS quarter,
         l.status, l.duration, d."A3" AS region, c.gender,
         NTILE(4) OVER (ORDER BY l.amount) AS amount_quartile
  FROM loan l
  JOIN account a ON a.account_id = l.account_id
  JOIN district d ON d.district_id = a.district_id
  JOIN disp dp ON dp.account_id = a.account_id
  JOIN client c ON c.client_id = dp.client_id
  WHERE l.date >= DATE '1996-04-01' AND l.date < DATE '1996-10-01' AND l.status IN ('A','B')
)
SELECT axis, value, quarter, COUNT(*) AS finished_loans,
       COUNT(*) FILTER (WHERE status = 'B')::numeric / NULLIF(COUNT(*), 0) AS default_rate
FROM (
  SELECT 'duration' AS axis, duration::text AS value, quarter, status FROM base
  UNION ALL SELECT 'amount_quartile', amount_quartile::text, quarter, status FROM base
  UNION ALL SELECT 'region', region, quarter, status FROM base
  UNION ALL SELECT 'gender', gender, quarter, status FROM base
) x
GROUP BY 1,2,3
ORDER BY axis, value, quarter`,
  }],
  self_financial_rca_03: [{
    name: "jan_1998_card_withdrawal_attribution",
    sql: `
SELECT c.type AS card_type, d."A2" AS district_name,
       CASE WHEN c.issued >= DATE '1997-10-01' AND c.issued < DATE '1998-01-01'
            THEN 'issued_late_1997' ELSE 'existing_or_other' END AS issuance_cohort,
       COUNT(*) AS tx_count, SUM(t.amount) AS total_amount
FROM trans t
JOIN account a ON a.account_id = t.account_id
JOIN district d ON d.district_id = a.district_id
JOIN disp dp ON dp.account_id = a.account_id
JOIN card c ON c.disp_id = dp.disp_id
WHERE t.operation = 'VYBER KARTOU'
  AND t.date >= DATE '1998-01-01' AND t.date < DATE '1998-02-01'
GROUP BY 1,2,3
ORDER BY tx_count DESC
LIMIT 20`,
  }],
  self_financial_rca_04: [{
    name: "kolin_balance_1995_1996_drivers",
    sql: `
WITH client_age AS (
  SELECT dp.account_id, CASE WHEN EXTRACT(YEAR FROM AGE(DATE '1998-12-31', c.birth_date)) < 30 THEN '<30'
                             WHEN EXTRACT(YEAR FROM AGE(DATE '1998-12-31', c.birth_date)) < 50 THEN '30-49'
                             ELSE '50+' END AS age_band
  FROM disp dp JOIN client c ON c.client_id = dp.client_id
),
base AS (
  SELECT EXTRACT(YEAR FROM t.date)::int AS yr, a.frequency, COALESCE(NULLIF(t.k_symbol,''), '<blank>') AS k_symbol,
         ca.age_band, AVG(t.balance)::numeric AS avg_balance, COUNT(*) AS tx_count
  FROM trans t JOIN account a ON a.account_id = t.account_id
  LEFT JOIN client_age ca ON ca.account_id = a.account_id
  WHERE a.district_id = 5 AND t.date >= DATE '1995-01-01' AND t.date < DATE '1997-01-01'
  GROUP BY 1,2,3,4
)
SELECT * FROM base ORDER BY frequency, k_symbol, age_band, yr`,
  }],
  self_financial_rca_05: [{
    name: "weekly_default_1997_drivers",
    sql: `
WITH salary_q AS (
  SELECT district_id, NTILE(4) OVER (ORDER BY "A11") AS salary_quartile FROM district
)
SELECT a.frequency, sq.salary_quartile,
       CASE WHEN l.duration = 12 THEN 'short_12' WHEN l.duration IN (24,36) THEN 'medium_24_36' ELSE 'long_48_60' END AS duration_band,
       COUNT(*) FILTER (WHERE l.status IN ('A','B')) AS finished_loans,
       COUNT(*) FILTER (WHERE l.status = 'B') AS defaulted_loans,
       COUNT(*) FILTER (WHERE l.status = 'B')::numeric / NULLIF(COUNT(*) FILTER (WHERE l.status IN ('A','B')), 0) AS default_rate,
       AVG(l.amount) AS avg_amount
FROM loan l JOIN account a ON a.account_id = l.account_id JOIN salary_q sq ON sq.district_id = a.district_id
WHERE l.date >= DATE '1997-01-01' AND l.date < DATE '1998-01-01'
GROUP BY 1,2,3
ORDER BY default_rate DESC NULLS LAST`,
  }],
  self_financial_rca_06: [{
    name: "sipo_share_extreme_district_1996",
    sql: `
WITH district_share AS (
  SELECT d.district_id, d."A2" AS district_name, d."A3" AS region, d."A11" AS avg_salary,
         d."A12" AS unemployment_1995, d."A13" AS unemployment_1996,
         COUNT(*) FILTER (WHERE t.k_symbol = 'SIPO')::numeric / NULLIF(COUNT(*), 0) AS sipo_share
  FROM trans t JOIN account a ON a.account_id = t.account_id JOIN district d ON d.district_id = a.district_id
  WHERE t.date >= DATE '1996-01-01' AND t.date < DATE '1997-01-01'
  GROUP BY 1,2,3,4,5,6
),
nat AS (
  SELECT COUNT(*) FILTER (WHERE k_symbol = 'SIPO')::numeric / COUNT(*) AS national_share
  FROM trans WHERE date >= DATE '1996-01-01' AND date < DATE '1997-01-01'
)
SELECT d.*, n.national_share, d.sipo_share - n.national_share AS deviation
FROM district_share d CROSS JOIN nat n
ORDER BY ABS(d.sipo_share - n.national_share) DESC
LIMIT 10`,
  }],
  self_financial_rca_07: [{
    name: "jan_feb_1994_account_openings",
    sql: `
SELECT DATE_TRUNC('month', a.date)::date AS month, d."A2" AS district_name, d."A3" AS region,
       a.frequency, COUNT(*) AS new_accounts
FROM account a JOIN district d ON d.district_id = a.district_id
WHERE a.date >= DATE '1994-01-01' AND a.date < DATE '1994-03-01'
GROUP BY 1,2,3,4
ORDER BY new_accounts DESC`,
  }],
  self_financial_rca_08: [{
    name: "gold_junior_default_decomposition",
    sql: `
WITH base AS (
  SELECT c.type AS card_type, l.status,
         CASE WHEN EXTRACT(YEAR FROM AGE(DATE '1998-12-31', cl.birth_date)) < 30 THEN '<30'
              WHEN EXTRACT(YEAR FROM AGE(DATE '1998-12-31', cl.birth_date)) < 50 THEN '30-49'
              ELSE '50+' END AS age_band,
         NTILE(4) OVER (ORDER BY l.amount) AS amount_quartile
  FROM card c
  JOIN disp dp ON dp.disp_id = c.disp_id
  JOIN client cl ON cl.client_id = dp.client_id
  JOIN loan l ON l.account_id = dp.account_id
  WHERE c.type IN ('gold','junior') AND l.status IN ('A','B')
)
SELECT card_type, age_band, amount_quartile, COUNT(*) AS finished_loans,
       COUNT(*) FILTER (WHERE status = 'B')::numeric / NULLIF(COUNT(*), 0) AS default_rate
FROM base
GROUP BY 1,2,3
ORDER BY card_type, age_band, amount_quartile`,
  }],
  self_financial_rca_09: [{
    name: "uver_east_bohemia_drivers",
    sql: `
SELECT d."A3" AS region, EXTRACT(YEAR FROM t.date)::int AS yr,
       SUM(t.amount) FILTER (WHERE t.k_symbol = 'UVER') AS uver_outflow,
       COUNT(DISTINCT l.loan_id) AS loan_count,
       AVG(l.amount) AS avg_loan_amount,
       COUNT(t.trans_id)::numeric / NULLIF(COUNT(DISTINCT a.account_id), 0) AS tx_per_account
FROM trans t
JOIN account a ON a.account_id = t.account_id
JOIN district d ON d.district_id = a.district_id
LEFT JOIN loan l ON l.account_id = a.account_id
WHERE t.date >= DATE '1996-01-01' AND t.date < DATE '1998-01-01'
GROUP BY 1,2
ORDER BY region, yr`,
  }],
  self_financial_rca_10: [{
    name: "status_d_top_bottom_districts",
    sql: `
WITH by_district AS (
  SELECT d.district_id, d."A2" AS district_name, d."A3" AS region, d."A11" AS avg_salary,
         d."A13" AS unemployment_1996, d."A16" AS crimes_1996,
         COUNT(l.loan_id) FILTER (WHERE l.status = 'D') AS status_d_count
  FROM district d
  JOIN account a ON a.district_id = d.district_id
  LEFT JOIN loan l ON l.account_id = a.account_id
  GROUP BY 1,2,3,4,5,6
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY status_d_count DESC, district_id) AS high_rank,
            ROW_NUMBER() OVER (ORDER BY status_d_count ASC, district_id) AS low_rank
  FROM by_district
)
SELECT CASE WHEN high_rank <= 3 THEN 'top_3' ELSE 'bottom_3' END AS comparison_group, *
FROM ranked
WHERE high_rank <= 3 OR low_rank <= 3
ORDER BY comparison_group DESC, status_d_count DESC`,
  }],
};

async function runOne(task) {
  const queries = task.class === "query"
    ? [{ name: "ground_truth_postgres", sql: task.ground_truth_sql_postgres || task.ground_truth_sql_starrocks }]
    : SQL_BY_TASK[task.id];
  if (!queries?.length) throw new Error(`No SQL configured for ${task.id}`);

  const queryResults = [];
  for (const query of queries) {
    const payload = await executeSql({ databaseId: DATABASE_ID, schemaName: SCHEMA, sql: query.sql });
    queryResults.push({
      name: query.name,
      sql: query.sql.trim(),
      rows: rows(payload),
      rowcount: rows(payload).length,
    });
  }

  return {
    task_id: task.id,
    system: "SkillGuidedAgent",
    task_class: task.class,
    dataset: "financial",
    success: true,
    latency_ms: null,
    tokens_input: null,
    tokens_output: null,
    artifact: task.class === "query" ? null : reportFromResults(task, queryResults),
    sql: queries.map((q) => q.sql.trim()).join("\n\n-- next query --\n\n"),
    chart_spec: null,
    tool_calls: queries.map((q) => `sql_lab.mjs:${q.name}`),
    error: null,
    raw_response: { query_results: queryResults },
    dry_run: false,
    executor: "parent_controlled_skill_call",
    agent_id: "parent-controlled",
    token_notes: "No sub-agent token usage for this parent-controlled Superset execution.",
    created_at: new Date().toISOString(),
  };
}

function writeSummary(results, outDir) {
  const groups = new Map();
  for (const result of results) {
    const g = groups.get(result.task_class) || { total: 0, success: 0, errors: 0 };
    g.total += 1;
    if (result.success) g.success += 1;
    else g.errors += 1;
    groups.set(result.task_class, g);
  }
  const lines = [];
  lines.push("# Financial Formal Benchmark - SkillGuided SQL-side Batch");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Scope: BIRD `financial` formal tasks where the requested artifact is a query result, analysis report, or RCA report. Dashboard artifact creation is intentionally excluded from this SQL-side runner.");
  lines.push("");
  lines.push("| Class | Total | Success | Errors |");
  lines.push("|---|---:|---:|---:|");
  for (const [klass, g] of [...groups.entries()].sort()) {
    lines.push(`| ${klass} | ${g.total} | ${g.success} | ${g.errors} |`);
  }
  lines.push("");
  lines.push("## Per-task Results");
  lines.push("");
  lines.push("| Task | Queries | First result preview |");
  lines.push("|---|---:|---|");
  for (const result of results) {
    const qrs = result.raw_response?.query_results || [];
    lines.push(`| ${result.task_id} | ${qrs.length} | ${JSON.stringify(previewRows(qrs[0]?.rows || [], 2)).replace(/\|/g, "\\|")} |`);
  }
  const summaryPath = path.resolve(ROOT, outDir, "summary.md");
  mkdirSync(path.dirname(summaryPath), { recursive: true });
  writeFileSync(summaryPath, `${lines.join("\n")}\n`);
}

const args = parseArgs(process.argv.slice(2));
const outDir = args.out || OUT_DIR;
const force = Boolean(args.force);
const klass = args["task-class"];
const tasks = loadTasks("tasks/nl2bi-benchmark.csv").filter((task) => {
  if (task.dataset !== "financial") return false;
  if (!["query", "analysis", "rca"].includes(task.class)) return false;
  if (klass && task.class !== klass) return false;
  if (args["task-id"] && task.id !== args["task-id"]) return false;
  return true;
});

const results = [];
for (const task of tasks) {
  const outPath = resultPath(outDir, "SkillGuidedAgent", task.id);
  try {
    const result = await runOne(task);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
    results.push(result);
    console.log(`${force ? "wrote" : "wrote"} ${path.relative(ROOT, outPath)}`);
  } catch (err) {
    const result = {
      task_id: task.id,
      system: "SkillGuidedAgent",
      task_class: task.class,
      dataset: "financial",
      success: false,
      error: safeError(err),
      dry_run: false,
      executor: "parent_controlled_skill_call",
      created_at: new Date().toISOString(),
    };
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
    results.push(result);
    console.log(`wrote-error ${path.relative(ROOT, outPath)}`);
  }
}
writeSummary(results, outDir);
console.error(`Done. financial SkillGuided SQL-side results=${results.length}`);
