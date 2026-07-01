#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_RESULTS_DIR, ROOT, parseArgs, safeError } from "./common.mjs";

function usage() {
  console.error("Usage: node scripts/bench/archive_subagent_batch.mjs --system <name> --class <class> --dataset <dataset> --agent-id <id> --input <json-file> [--out results/bird-layer1-formal]");
  console.error("Use --input - to read the sub-agent JSON from stdin.");
  console.error("");
  console.error("Input JSON must be either an array or an object with a `results` array. Each item must include `task_id` and `sql`.");
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text).match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch { /* fall through to NDJSON */ }
    }
    const lines = String(text).split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
    if (lines.length) {
      try {
        return lines.map((line) => JSON.parse(line));
      } catch { /* fall through */ }
    }
    throw new Error("subagent output did not contain a JSON array/object or NDJSON lines");
  }
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

for (const required of ["system", "class", "dataset", "agent-id", "input"]) {
  if (!args[required]) {
    usage();
    process.exit(2);
  }
}

const inputPath = args.input === "-" ? null : path.resolve(ROOT, args.input);
const outDir = args.out || DEFAULT_RESULTS_DIR;
let payload;
let parseError = null;
try {
  const inputText = inputPath ? readFileSync(inputPath, "utf8") : readFileSync(0, "utf8");
  payload = parseMaybeJson(inputText);
} catch (err) {
  parseError = safeError(err);
  payload = null;
}

const items = Array.isArray(payload) ? payload : payload?.results;
if (parseError || !Array.isArray(items)) {
  console.error(`Error: ${parseError || "input did not contain a results array"}`);
  process.exit(1);
}

const written = [];
for (const item of items) {
  if (!item?.task_id) throw new Error("Each result item must include task_id");
  const chartSpec = item.chart_spec ?? (
    item.viz_type || item.metrics || item.dimensions
      ? {
          viz_type: item.viz_type ?? null,
          dataset_ids: item.dataset_ids ?? null,
          metrics: item.metrics ?? [],
          dimensions: item.dimensions ?? [],
          filters: item.filters ?? [],
          time_range: item.time_range ?? null,
        }
      : null
  );
  const outPath = path.resolve(ROOT, outDir, args.system, `${item.task_id}.json`);
  const result = {
    task_id: item.task_id,
    system: args.system,
    task_class: args.class,
    dataset: args.dataset,
    success: !item.error,
    latency_ms: null,
    tokens_input: null,
    tokens_output: null,
    artifact: item.artifact ?? null,
    sql: item.sql ?? "",
    chart_spec: chartSpec,
    tool_calls: item.tool_calls ?? [],
    error: item.error ?? null,
    raw_response: item,
    dry_run: false,
    executor: "codex_subagent_batch",
    agent_id: args["agent-id"],
    token_notes: item.token_notes ?? "Codex sub-agent token usage is visible to the Codex product, not to this local Node runner.",
    created_at: new Date().toISOString(),
  };
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
  written.push(path.relative(ROOT, outPath));
}

console.log(`written=${written.length}`);
for (const file of written) console.log(file);
