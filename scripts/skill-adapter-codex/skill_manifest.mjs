#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    throw new Error("SKILL.md does not start with YAML frontmatter");
  }
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) {
    throw new Error("SKILL.md frontmatter terminator not found");
  }
  const yaml = text.slice(4, end);
  const body = text.slice(end + "\n---\n".length);
  return { yaml, fields: parseSimpleYaml(yaml), body };
}

function parseSimpleYaml(yaml) {
  const fields = {};
  let currentKey = null;
  let collectingBlock = false;
  const blockLines = [];

  function flushBlock() {
    if (currentKey && collectingBlock) {
      fields[currentKey] = blockLines.join("\n").trim();
    }
    collectingBlock = false;
    blockLines.length = 0;
  }

  for (const rawLine of yaml.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      flushBlock();
      currentKey = kv[1];
      const value = kv[2];
      if (value === ">-" || value === "|" || value === ">") {
        collectingBlock = true;
      } else {
        fields[currentKey] = value.replace(/^["']|["']$/g, "");
      }
      continue;
    }
    if (collectingBlock) {
      blockLines.push(line.replace(/^ {2}/, ""));
    }
  }
  flushBlock();
  return fields;
}

export function loadSkillManifest(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  const text = readFileSync(skillPath, "utf8");
  const parsed = parseFrontmatter(text);
  return {
    name: parsed.fields.name,
    description: parsed.fields.description,
    version: parsed.fields.version,
    tags: parsed.fields.tags,
    skillPath,
    skillDir,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const skillDir = process.argv[2];
  if (!skillDir) {
    console.error("Usage: node skill_manifest.mjs <skill_dir>");
    process.exit(2);
  }
  console.log(JSON.stringify(loadSkillManifest(skillDir), null, 2));
}
