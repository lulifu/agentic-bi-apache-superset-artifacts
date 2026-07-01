#!/usr/bin/env node

import { registerSupersetSkill } from "./register_skill.mjs";

const DEFAULT_TASK = "List the first three datasets registered in our Superset deployment.";

export async function buildSmokeProofPlan(skillDir) {
  const registration = registerSupersetSkill(skillDir, {
    env: {
      SUPERSET_TOKEN: process.env.SUPERSET_TOKEN,
      SUPERSET_DEV_TOKEN: process.env.SUPERSET_DEV_TOKEN,
      SUPERSET_BASE_URL: process.env.SUPERSET_BASE_URL,
    },
  });

  return {
    task: DEFAULT_TASK,
    manifest_loaded_at_startup: registration.manifest,
    progressive_steps_expected: [
      "Inspect skill frontmatter and decide Superset skill applies.",
      "Call load_skill_body to read SKILL.md body.",
      "Select the create_chart script tool for dataset search.",
      "Call superset_create_chart with args ['--search-dataset', '<keyword>'] or the nearest supported dataset-search command.",
      "Return the first three dataset records from stdout.",
    ],
    tools_available: registration.tools.map((tool) => tool.name),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const skillDir = process.argv[2];
  if (!skillDir) {
    console.error("Usage: node smoke_driver.mjs <skill_dir>");
    process.exit(2);
  }
  console.log(JSON.stringify(await buildSmokeProofPlan(skillDir), null, 2));
}
