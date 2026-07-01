#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_RESULTS_DIR, ROOT, parseArgs, safeError } from "./common.mjs";

function usage() {
  console.error("Usage: node scripts/bench/archive_subagent_result.mjs --system <name> --task-id <id> --class <class> --dataset <dataset> --agent-id <id> --input <json-file> [--out results/smoke-subagent]");
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("subagent output did not contain a JSON object");
    return JSON.parse(match[0]);
  }
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

for (const required of ["system", "task-id", "class", "dataset", "agent-id", "input"]) {
  if (!args[required]) {
    usage();
    process.exit(2);
  }
}

const inputPath = path.resolve(ROOT, args.input);
const outDir = args.out || DEFAULT_RESULTS_DIR;
const resultPath = path.resolve(ROOT, outDir, args.system, `${args["task-id"]}.json`);

let parsed;
let error = null;
try {
  parsed = parseMaybeJson(readFileSync(inputPath, "utf8"));
} catch (err) {
  parsed = null;
  error = safeError(err);
}

const result = {
  task_id: args["task-id"],
  system: args.system,
  task_class: args.class,
  dataset: args.dataset,
  success: !error,
  latency_ms: null,
  tokens_input: null,
  tokens_output: null,
  artifact: parsed?.artifact ?? null,
  sql: parsed?.sql ?? "",
  chart_spec: parsed?.chart_spec ?? parsed?.dashboard_spec ?? null,
  tool_calls: parsed?.tool_calls ?? [],
  error,
  raw_response: parsed,
  dry_run: false,
  executor: "codex_subagent",
  agent_id: args["agent-id"],
  token_notes: parsed?.token_notes ?? "Codex sub-agent token usage is visible to the Codex product, not to this local Node runner.",
  created_at: new Date().toISOString(),
};

mkdirSync(path.dirname(resultPath), { recursive: true });
writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(path.relative(ROOT, resultPath));
