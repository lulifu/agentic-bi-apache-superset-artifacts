#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const CLI_EXTENSIONS = new Set([".mjs", ".py"]);
const HELPER_FILES = new Set(["http.mjs", "superset.mjs"]);

export function discoverSkillScripts(skillDir) {
  const scriptsDir = path.join(skillDir, "scripts");
  return readdirSync(scriptsDir)
    .filter((name) => CLI_EXTENSIONS.has(path.extname(name)))
    .filter((name) => !HELPER_FILES.has(name))
    .sort()
    .map((name) => describeScript(path.join(scriptsDir, name)));
}

function describeScript(scriptPath) {
  const text = readFileSync(scriptPath, "utf8");
  const header = extractHeader(text);
  const options = [...new Set([...text.matchAll(/["']--([A-Za-z0-9_-]+)["']/g)].map((m) => m[1]))].sort();
  const ext = path.extname(scriptPath);
  return {
    name: path.basename(scriptPath, ext).replace(/[^A-Za-z0-9_]/g, "_"),
    scriptPath,
    command: ext === ".py" ? "python3" : "node",
    description: header.split(/\r?\n/).slice(0, 8).join(" ").replace(/\s+/g, " ").trim(),
    options,
  };
}

function extractHeader(text) {
  const block = text.match(/\/\*\*([\s\S]*?)\*\//);
  if (block) {
    return block[1].replace(/^\s*\*\s?/gm, "").trim();
  }
  const doc = text.match(/^"""([\s\S]*?)"""/m);
  return doc ? doc[1].trim() : "";
}

export function makeScriptTool(descriptor, baseEnv = {}) {
  return {
    type: "function",
    name: `superset_${descriptor.name}`,
    description: descriptor.description || `Run ${path.basename(descriptor.scriptPath)}`,
    parameters: {
      type: "object",
      properties: {
        args: {
          type: "array",
          items: { type: "string" },
          description: `Raw CLI arguments for ${path.basename(descriptor.scriptPath)}. Known flags: ${descriptor.options.map((o) => `--${o}`).join(", ")}`,
        },
        stdin: { type: "string", description: "Optional stdin payload for scripts that read JSON from stdin." },
      },
      required: ["args"],
      additionalProperties: false,
    },
    execute: async ({ args = [], stdin = "" }) => runScript(descriptor, args, stdin, baseEnv),
  };
}

export function runScript(descriptor, args, stdin, baseEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(descriptor.command, [descriptor.scriptPath, ...args], {
      cwd: path.dirname(descriptor.scriptPath),
      env: { ...process.env, ...baseEnv },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (code) => {
      resolve({ code, ok: code === 0, stdout, stderr });
    });
    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
}

export function makeScriptTools(skillDir, baseEnv = {}) {
  return discoverSkillScripts(skillDir).map((descriptor) => makeScriptTool(descriptor, baseEnv));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const skillDir = process.argv[2];
  if (!skillDir) {
    console.error("Usage: node wrap_script_as_tool.mjs <skill_dir>");
    process.exit(2);
  }
  console.log(JSON.stringify(discoverSkillScripts(skillDir), null, 2));
}
