#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { executeSql } from "../../skills/superset-dev-benchmark/scripts/sql_lab.mjs";
import { ROOT, SYSTEMS, loadTasks, parseArgs, readJson, resultPath, safeError, truncate } from "./common.mjs";

const CSV = "tasks/nl2bi-benchmark.csv";
const OUT_DIR = "results/bird-layer1-formal";
const DATABASE_ID = 1;

const SCHEMA_BY_DATASET = {
  financial: "bench_bird_financial",
  formula_1: "bench_bird_formula_1",
  card_games: "bench_bird_card_games",
  european_football_2: "bench_bird_european_football_2",
  student_club: "bench_bird_student_club",
};

function rows(payload) {
  const data = payload?.data || payload?.result?.data || payload?.result?.[0]?.data || [];
  return Array.isArray(data) ? data : [];
}

function rowValues(row) {
  if (row && typeof row === "object" && !Array.isArray(row)) return Object.values(row);
  if (Array.isArray(row)) return row;
  return [row];
}

function canonicalValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number(value.toFixed(9));
  if (typeof value === "string") {
    const trimmed = value.trim();
    const asNumber = Number(trimmed);
    if (trimmed !== "" && Number.isFinite(asNumber)) return Number(asNumber.toFixed(9));
    return trimmed;
  }
  return value;
}

function canonicalRows(rs) {
  return rs
    .map((row) => rowValues(row).map(canonicalValue))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function sampleRows(rs, maxRows = 8) {
  return JSON.stringify(canonicalRows(rs).slice(0, maxRows));
}

function equivalentRows(left, right) {
  const a = canonicalRows(left);
  const b = canonicalRows(right);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j += 1) {
      const av = a[i][j];
      const bv = b[i][j];
      if (typeof av === "number" && typeof bv === "number") {
        const tolerance = Math.max(1e-6, Math.abs(bv) * 1e-8);
        if (Math.abs(av - bv) > tolerance) return false;
      } else if (av !== bv) {
        return false;
      }
    }
  }
  return true;
}

async function executeForTask(task, sql) {
  const schema = SCHEMA_BY_DATASET[task.dataset];
  if (!schema) throw new Error(`No schema mapping for dataset: ${task.dataset}`);
  const payload = await executeSql({ databaseId: DATABASE_ID, schemaName: schema, sql });
  return rows(payload);
}

function readResult(outDir, system, taskId) {
  const file = resultPath(outDir, system, taskId);
  return existsSync(file) ? readJson(file) : null;
}

async function gradeTask(task, system, result, oracleRows) {
  if (!result) {
    return {
      status: "missing",
      sql_executes: 0,
      result_set_equivalence: 0,
      actual_rowcount: null,
      comment: "No result JSON found.",
    };
  }
  if (result.error || !result.success || !result.sql) {
    return {
      status: "no_sql",
      sql_executes: 0,
      result_set_equivalence: 0,
      actual_rowcount: null,
      comment: result.error || "No executable SQL was produced.",
    };
  }

  try {
    const actualRows = await executeForTask(task, result.sql);
    const equivalent = equivalentRows(oracleRows, actualRows);
    return {
      status: equivalent ? "match" : "mismatch",
      sql_executes: 2,
      result_set_equivalence: equivalent ? 2 : 0,
      actual_rowcount: actualRows.length,
      comment: equivalent
        ? "Generated SQL executed and matched the PostgreSQL oracle result set."
        : `Result mismatch. Expected sample ${sampleRows(oracleRows)}; got sample ${sampleRows(actualRows)}.`,
    };
  } catch (err) {
    return {
      status: "exec_error",
      sql_executes: 0,
      result_set_equivalence: 0,
      actual_rowcount: null,
      comment: safeError(err),
    };
  }
}

function groupSummary(grades) {
  const groups = new Map();
  for (const grade of grades) {
    const group = groups.get(grade.system) || {
      system: grade.system,
      total: 0,
      missing: 0,
      exec_errors: 0,
      executable: 0,
      matches: 0,
      score_total: 0,
    };
    group.total += 1;
    if (grade.status === "missing") group.missing += 1;
    if (grade.status === "exec_error" || grade.status === "no_sql") group.exec_errors += 1;
    if (grade.sql_executes === 2) group.executable += 1;
    if (grade.result_set_equivalence === 2) group.matches += 1;
    group.score_total += grade.sql_executes + grade.result_set_equivalence;
    groups.set(grade.system, group);
  }
  return [...groups.values()].map((g) => ({
    ...g,
    avg: g.total ? g.score_total / (g.total * 2) : 0,
    exact_pct: g.total ? (g.matches / g.total) * 100 : 0,
  }));
}

function writeOutputs(outDir, tasks, grades, oracleInfo) {
  const outAbs = path.resolve(ROOT, outDir);
  mkdirSync(outAbs, { recursive: true });
  const generatedAt = new Date().toISOString();
  const summary = groupSummary(grades);
  const isRepairRun = outDir.includes("repair");

  const lines = [];
  lines.push(isRepairRun ? "# BIRD Layer-1 SkillGuided Repair Query Benchmark Summary" : "# BIRD Layer-1 Formal Query Benchmark Summary");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Tasks: ${tasks.length}`);
  lines.push("");
  lines.push("## Aggregate Scores");
  lines.push("");
  lines.push("| System | Total | Executable | Exact match | Missing | SQL errors | Avg / 2 | Exact % |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|");
  for (const row of summary) {
    lines.push(`| ${row.system} | ${row.total} | ${row.executable} | ${row.matches} | ${row.missing} | ${row.exec_errors} | ${row.avg.toFixed(2)} | ${row.exact_pct.toFixed(1)} |`);
  }
  lines.push("");
  lines.push("## Method");
  lines.push("");
  lines.push("- Scope: 30 BIRD Layer-1 `query` tasks from `tasks/nl2bi-benchmark.csv`.");
  lines.push("- Oracle: validated `ground_truth_sql_postgres` for each task.");
  lines.push("- Execution: dev Superset SQL Lab against database `examples` (#1), with per-dataset Postgres schemas.");
  lines.push("- Scoring: generated SQL receives 2 points for executing and 2 points for result-set equivalence; aggregate `Avg / 2` is averaged across the two dimensions.");
  lines.push("- Result equivalence is strict: extra or missing output columns count as mismatches even when the leading value is correct.");
  if (isRepairRun) {
    lines.push("- Repair protocol: no-context sub-agents started from first-pass SkillGuidedAgent SQL, called SQL Lab themselves, and could use SQL errors / result shape feedback but not oracle SQL or oracle rows.");
    lines.push("- The oracle was used only after final repaired SQL was frozen, by this offline scorer.");
  } else {
    lines.push("- The SkillGuidedAgent query-only batch used schema/skill guidance but did not run a parent-controlled SQL repair loop; these numbers measure first-pass SQL generation.");
  }
  lines.push("- Raw per-task JSON outputs remain gitignored; this summary and the prefilled grading sheet are the commit-eligible artifacts.");
  lines.push("");
  lines.push("## Oracle Row Counts");
  lines.push("");
  lines.push("| Task | Dataset | Oracle rows |");
  lines.push("|---|---|---:|");
  for (const task of tasks) {
    lines.push(`| ${task.id} | ${task.dataset} | ${oracleInfo.get(task.id)?.rowcount ?? ""} |`);
  }
  lines.push("");
  lines.push("## Per-Task Results");
  lines.push("");
  lines.push("| Task | Dataset | System | Status | SQL exec | Equivalence | Actual rows | Comment |");
  lines.push("|---|---|---|---|---:|---:|---:|---|");
  for (const grade of grades) {
    lines.push(`| ${grade.task_id} | ${grade.dataset} | ${grade.system} | ${grade.status} | ${grade.sql_executes} | ${grade.result_set_equivalence} | ${grade.actual_rowcount ?? ""} | ${truncate(grade.comment, 180).replace(/\|/g, "\\|")} |`);
  }

  const sheet = [];
  sheet.push(`# Prefilled Grading Sheet - ${isRepairRun ? "BIRD Layer-1 SkillGuided Repair Query Benchmark" : "BIRD Layer-1 Formal Query Benchmark"} - ${generatedAt.slice(0, 10)}`);
  sheet.push("");
  sheet.push("This sheet is deterministic: every score below comes from SQL Lab execution and result-set comparison against the validated PostgreSQL oracle.");
  sheet.push("");
  for (const grade of grades) {
    const task = tasks.find((t) => t.id === grade.task_id);
    const result = readResult(outDir, grade.system, grade.task_id);
    sheet.push("---", "");
    sheet.push(`## task: ${grade.task_id} | system: ${grade.system}`);
    sheet.push("");
    sheet.push(`Dataset: ${grade.dataset}`);
    sheet.push(`NL request: ${truncate(task.nl_request, 240)}`);
    sheet.push("");
    sheet.push("Generated SQL:");
    sheet.push("```sql");
    sheet.push((result?.sql || "").trim() || "-- no SQL");
    sheet.push("```");
    sheet.push("");
    sheet.push("- dimension: sql_executes");
    sheet.push("  description: Generated SQL executes in dev Superset SQL Lab.");
    sheet.push(`  score: ${grade.sql_executes}`);
    sheet.push(`  comment: ${grade.sql_executes === 2 ? "SQL executed." : truncate(grade.comment, 300)}`);
    sheet.push("");
    sheet.push("- dimension: result_set_equivalence");
    sheet.push("  description: Generated SQL result matches the PostgreSQL ground truth result set.");
    sheet.push(`  score: ${grade.result_set_equivalence}`);
    sheet.push(`  comment: ${truncate(grade.comment, 300)}`);
    sheet.push("");
    sheet.push(`Average score: ${((grade.sql_executes + grade.result_set_equivalence) / 2).toFixed(2)} / 2`);
    sheet.push("");
  }

  writeFileSync(path.join(outAbs, "summary.md"), `${lines.join("\n")}\n`);
  writeFileSync(path.join(outAbs, "grading-sheet-prefilled.md"), `${sheet.join("\n").replace(/\n+$/u, "")}\n`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "summary.md"))}`);
  console.log(`wrote ${path.relative(ROOT, path.join(outAbs, "grading-sheet-prefilled.md"))}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const csv = args.csv || CSV;
  const outDir = args.out || OUT_DIR;
  const selectedSystem = args.system || "all";
  const systems = selectedSystem === "all"
    ? SYSTEMS
    : String(selectedSystem).split(",").map((s) => s.trim()).filter(Boolean);
  const tasks = loadTasks(csv).filter((task) => task.layer === "1" && task.class === "query");
  const oracleRows = new Map();
  const oracleInfo = new Map();
  const grades = [];

  for (const task of tasks) {
    const sql = task.ground_truth_sql_postgres;
    if (!sql) throw new Error(`Missing ground_truth_sql_postgres for ${task.id}`);
    const rs = await executeForTask(task, sql);
    oracleRows.set(task.id, rs);
    oracleInfo.set(task.id, { rowcount: rs.length });
  }

  for (const system of systems) {
    for (const task of tasks) {
      const result = readResult(outDir, system, task.id);
      const grade = await gradeTask(task, system, result, oracleRows.get(task.id));
      grades.push({ ...grade, task_id: task.id, dataset: task.dataset, system });
      console.log(`${system} ${task.id}: ${grade.status}`);
    }
  }

  writeOutputs(outDir, tasks, grades, oracleInfo);
}

main().catch((err) => {
  console.error(`Error: ${safeError(err)}`);
  process.exitCode = 1;
});
