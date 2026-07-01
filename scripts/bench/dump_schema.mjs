#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_SMOKE_CSV, ROOT, loadTasks, parseArgs, runProcess } from "./common.mjs";

const SKILL_SCRIPT = path.resolve(ROOT, "skills/superset-dev-benchmark/scripts/create_chart.mjs");
const INTERCEPTOR = "./scripts/skill-adapter-codex/superset_token_interceptor.mjs";

const BENCHMARK_DATASET_GROUPS = {
  dog_kennels: {
    schema: "bench_nvbench_dog_kennels",
    datasetIds: [79, 80, 81, 82, 83, 84, 85, 86],
  },
  employee_hire_evaluation: {
    schema: "bench_nvbench_employee_hire_evaluation",
    datasetIds: [87, 88, 89, 90],
  },
  cre_Docs_and_Epenses: {
    schema: "bench_nvbench_cre_docs_and_expenses",
    datasetIds: [91, 92, 93, 94, 95, 96, 97],
  },
  behavior_monitoring: {
    schema: "bench_nvbench_behavior_monitoring",
    datasetIds: [98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108],
  },
  customers_and_invoices: {
    schema: "bench_nvbench_customers_and_invoices",
    datasetIds: [109, 110, 111, 112, 113, 114, 115, 116, 117],
  },
};

function formatSchema(datasetName, detail) {
  const r = detail.result || detail;
  const columns = r.columns || [];
  const metrics = r.metrics || [];
  const lines = [];
  lines.push(`dataset: ${datasetName}`);
  lines.push(`superset_dataset_id: ${r.id || ""}`);
  lines.push(`database: ${r.database?.database_name || r.database?.name || ""}`);
  lines.push(`schema: ${r.schema || ""}`);
  lines.push("");
  lines.push("columns:");
  for (const c of columns) {
    const flags = [
      c.is_dttm ? "time" : null,
      c.groupby ? "groupby" : null,
      c.filterable ? "filterable" : null,
    ].filter(Boolean).join(", ");
    lines.push(`- ${c.column_name} ${c.type || ""}${flags ? ` (${flags})` : ""}`.trimEnd());
  }
  lines.push("");
  lines.push("metrics:");
  if (!metrics.length) {
    lines.push("- none");
  } else {
    for (const m of metrics) lines.push(`- ${m.metric_name}: ${m.expression || ""}`);
  }
  return `${lines.join("\n")}\n`;
}

function formatDatasetGroup(datasetName, group, details) {
  const lines = [];
  lines.push(`benchmark_dataset: ${datasetName}`);
  lines.push(`superset_database: examples`);
  lines.push(`superset_schema: ${group.schema}`);
  lines.push(`superset_dataset_ids: ${group.datasetIds.join(", ")}`);
  lines.push("");
  lines.push("tables:");
  for (const detail of details) {
    const r = detail.result || detail;
    lines.push(`- ${r.table_name} (#${r.id})`);
  }
  lines.push("");

  for (const detail of details) {
    const r = detail.result || detail;
    const columns = r.columns || [];
    const metrics = r.metrics || [];
    lines.push(`table: ${r.table_name} (#${r.id})`);
    lines.push(`schema: ${r.schema || group.schema}`);
    lines.push("columns:");
    for (const c of columns) {
      const flags = [
        c.is_dttm ? "time" : null,
        c.groupby ? "groupby" : null,
        c.filterable ? "filterable" : null,
      ].filter(Boolean).join(", ");
      lines.push(`- ${c.column_name} ${c.type || ""}${flags ? ` (${flags})` : ""}`.trimEnd());
    }
    lines.push("metrics:");
    if (!metrics.length) {
      lines.push("- none");
    } else {
      for (const m of metrics) lines.push(`- ${m.metric_name}: ${m.expression || ""}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function runJson(args) {
  const result = await runProcess("node", ["--import", INTERCEPTOR, SKILL_SCRIPT, ...args, "--json"]);
  if (!result.ok) {
    throw new Error(result.stderr || result.stdout || `command failed: ${args.join(" ")}`);
  }
  return JSON.parse(result.stdout);
}

export async function dumpSchema(datasetName, outDir = "cache/schema", force = false) {
  const outPath = path.resolve(ROOT, outDir, `${datasetName}.txt`);
  if (!force) {
    try {
      return { path: outPath, cached: true, text: readFileSync(outPath, "utf8") };
    } catch {
      // Generate below.
    }
  }

  const group = BENCHMARK_DATASET_GROUPS[datasetName];
  if (group) {
    const details = [];
    for (const datasetId of group.datasetIds) {
      details.push(await runJson(["--dataset-info", String(datasetId)]));
    }
    const text = formatDatasetGroup(datasetName, group, details);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, text);
    return { path: outPath, cached: false, text };
  }

  const search = await runJson(["--search-dataset", datasetName]);
  const matches = search.result || [];
  const exact = matches.find((d) => d.table_name === datasetName) || matches[0];
  if (!exact?.id) {
    throw new Error(`Dataset not found: ${datasetName}`);
  }
  const detail = await runJson(["--dataset-info", String(exact.id)]);
  const text = formatSchema(datasetName, detail);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, text);
  return { path: outPath, cached: false, text };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv.slice(2));
  const csv = args.csv || DEFAULT_SMOKE_CSV;
  const tasks = loadTasks(csv).filter((task) => {
    if (args.dataset && task.dataset !== args.dataset) return false;
    if (args.layer && task.layer !== args.layer) return false;
    if (args["task-class"] && task.class !== args["task-class"]) return false;
    return true;
  });
  const datasets = [...new Set(tasks.map((t) => t.dataset).filter(Boolean))];
  for (const dataset of datasets) {
    const result = await dumpSchema(dataset, args.out || "cache/schema", Boolean(args.force));
    console.log(`${result.cached ? "cached" : "wrote"} ${path.relative(ROOT, result.path)}`);
  }
}
