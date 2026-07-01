#!/usr/bin/env node

import { loadSkillManifest } from "./skill_manifest.mjs";
import { makeLoadSkillBodyTool } from "./load_skill_body.mjs";
import { makeReferenceTools } from "./read_reference_tool.mjs";
import { makeScriptTools } from "./wrap_script_as_tool.mjs";

export function registerSupersetSkill(skillDir, opts = {}) {
  const manifest = loadSkillManifest(skillDir);
  const tools = [
    makeLoadSkillBodyTool(skillDir),
    ...makeReferenceTools(skillDir),
    ...makeScriptTools(skillDir, opts.env || {}),
  ];

  return {
    manifest,
    instructions: [
      `A skill named "${manifest.name}" is available.`,
      "Use the skill only when the user asks for Superset, BI, dashboard, chart, analysis, monitoring, or benchmark work.",
      "Start from the manifest description. Call load_skill_body only after deciding this skill applies.",
      "Call list_references/read_reference only for the specific reference documents needed for the current task.",
      "Call superset_* script tools instead of inventing direct HTTP requests.",
    ].join("\n"),
    tools,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const skillDir = process.argv[2];
  if (!skillDir) {
    console.error("Usage: node register_skill.mjs <skill_dir>");
    process.exit(2);
  }
  const registration = registerSupersetSkill(skillDir);
  console.log(JSON.stringify({
    manifest: registration.manifest,
    tool_count: registration.tools.length,
    tool_names: registration.tools.map((tool) => tool.name),
    instructions: registration.instructions,
  }, null, 2));
}
