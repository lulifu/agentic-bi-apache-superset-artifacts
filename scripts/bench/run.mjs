#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_RESULTS_DIR,
  DEFAULT_SMOKE_CSV,
  ROOT,
  SYSTEMS,
  loadTasks,
  parseArgs,
  resultPath,
  taskMatches,
  writeJson,
} from "./common.mjs";
import { codexSubagentNote, runSystem } from "./systems.mjs";

function usage() {
  console.error("Usage: node scripts/bench/run.mjs [--csv tasks/nl2bi-smoke-benchmark.csv] [--out results/smoke] [--system DirectLLM|SchemaGroundedLLM|SkillGuidedAgent|all] [--task-id ID] [--task-class query|chart|dashboard|analysis|rca] [--limit N] [--dry-run] [--force] [--allow-mutate]");
  console.error("");
  console.error(codexSubagentNote());
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const csv = args.csv || DEFAULT_SMOKE_CSV;
const outDir = args.out || DEFAULT_RESULTS_DIR;
const selectedSystem = args.system || "DirectLLM";
const systems = selectedSystem === "all" ? SYSTEMS : [selectedSystem];
const force = Boolean(args.force);
const dryRun = Boolean(args["dry-run"]);
const allowMutate = Boolean(args["allow-mutate"]);
const limit = args.limit ? Number(args.limit) : null;

if (!dryRun && systems.includes("SkillGuidedAgent") && !allowMutate) {
  console.error("Refusing to run SkillGuidedAgent without --allow-mutate. Use --dry-run for non-mutating validation.");
  process.exit(2);
}

let tasks = loadTasks(csv).filter((task) => taskMatches(task, args));
if (Number.isFinite(limit)) tasks = tasks.slice(0, limit);
if (!tasks.length) {
  console.error("No tasks matched the requested filters.");
  process.exit(1);
}

const written = [];
const skipped = [];
for (const systemName of systems) {
  if (!SYSTEMS.includes(systemName)) {
    console.error(`Unknown system: ${systemName}`);
    process.exit(2);
  }
  for (const task of tasks) {
    const outPath = resultPath(outDir, systemName, task.id);
    if (existsSync(outPath) && !force) {
      skipped.push(path.relative(ROOT, outPath));
      continue;
    }
    const result = await runSystem(systemName, task, { dryRun, allowMutate, model: args.model });
    writeJson(outPath, result);
    written.push(path.relative(ROOT, outPath));
    console.log(`${result.success ? "wrote" : "wrote-error"} ${path.relative(ROOT, outPath)}`);
  }
}

console.error(`Done. written=${written.length} skipped=${skipped.length} dry_run=${dryRun}`);
