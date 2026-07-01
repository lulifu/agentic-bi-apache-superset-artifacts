#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function walkMarkdown(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdown(abs, base));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(path.relative(base, abs));
    }
  }
  return out.sort();
}

export function listReferences(skillDir) {
  const refDir = path.join(skillDir, "references");
  return walkMarkdown(refDir);
}

export function readReference(skillDir, name) {
  const refs = new Set(listReferences(skillDir));
  if (!refs.has(name)) {
    throw new Error(`Unknown reference "${name}". Use list_references first.`);
  }
  const abs = path.join(skillDir, "references", name);
  const size = statSync(abs).size;
  return { name, bytes: size, content: readFileSync(abs, "utf8") };
}

export function makeReferenceTools(skillDir) {
  return [
    {
      type: "function",
      name: "list_references",
      description: "List reference documents available for the loaded Superset skill.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      execute: async () => ({ references: listReferences(skillDir) }),
    },
    {
      type: "function",
      name: "read_reference",
      description: "Read one allowlisted Superset skill reference document by relative path.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Reference path, e.g. viz_params/table.md" },
        },
        required: ["name"],
        additionalProperties: false,
      },
      execute: async ({ name }) => readReference(skillDir, name),
    },
  ];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [skillDir, name] = process.argv.slice(2);
  if (!skillDir) {
    console.error("Usage: node read_reference_tool.mjs <skill_dir> [reference_name]");
    process.exit(2);
  }
  if (!name) {
    console.log(JSON.stringify(listReferences(skillDir), null, 2));
  } else {
    console.log(readReference(skillDir, name).content);
  }
}
