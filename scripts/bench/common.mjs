import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

export const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
export const DEFAULT_SMOKE_CSV = "tasks/nl2bi-smoke-benchmark.csv";
export const DEFAULT_RESULTS_DIR = "results/smoke";
export const SYSTEMS = ["DirectLLM", "SchemaGroundedLLM", "SkillGuidedAgent"];
export const TAG = "nl2bi-bench-2026";

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      (args._ ||= []).push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows.filter((r) => r.some((cell) => cell !== ""));
  if (!headers) return [];
  return dataRows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

export function loadTasks(csvPath) {
  const abs = path.resolve(ROOT, csvPath);
  return parseCsv(readFileSync(abs, "utf8"));
}

export function taskMatches(task, args) {
  if (args["task-id"] && task.id !== args["task-id"]) return false;
  if (args["task-class"] && task.class !== args["task-class"]) return false;
  return true;
}

export function resultPath(outDir, systemName, taskId) {
  return path.resolve(ROOT, outDir, systemName, `${taskId}.json`);
}

export function writeJson(filePath, payload) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function truncate(text, max = 800) {
  const s = String(text ?? "");
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

export function splitSemi(value) {
  return String(value || "").split(";").map((v) => v.trim()).filter(Boolean);
}

export function runProcess(command, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: opts.cwd || ROOT,
      env: { ...process.env, ...(opts.env || {}) },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (err) => resolve({ code: 1, ok: false, stdout, stderr: String(err.message || err) }));
    child.on("close", (code) => resolve({ code, ok: code === 0, stdout, stderr }));
    if (opts.stdin) child.stdin.write(opts.stdin);
    child.stdin.end();
  });
}

export function safeError(err) {
  const msg = String(err?.message || err || "unknown error");
  return msg.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, "Bearer <redacted>");
}

export function artifactText(result) {
  if (!result) return "";
  if (typeof result.artifact === "string") return result.artifact;
  if (result.sql) return result.sql;
  if (result.chart_spec) return JSON.stringify(result.chart_spec);
  if (result.error) return result.error;
  return JSON.stringify(result.artifact || result.raw_response || "");
}
