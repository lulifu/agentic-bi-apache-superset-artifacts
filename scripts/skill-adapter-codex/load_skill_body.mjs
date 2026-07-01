#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./skill_manifest.mjs";

export function loadSkillBody(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  const text = readFileSync(skillPath, "utf8");
  return parseFrontmatter(text).body.trim();
}

export function makeLoadSkillBodyTool(skillDir) {
  return {
    type: "function",
    name: "load_skill_body",
    description: "Load the full SKILL.md body for the selected skill after frontmatter discovery indicates it is relevant.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    execute: async () => ({ body: loadSkillBody(skillDir) }),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const skillDir = process.argv[2];
  if (!skillDir) {
    console.error("Usage: node load_skill_body.mjs <skill_dir>");
    process.exit(2);
  }
  console.log(loadSkillBody(skillDir));
}
