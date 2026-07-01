#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./common.mjs";

const OUT_DIR = path.resolve(ROOT, "results/ablation");

function read(relPath) {
  return readFileSync(path.resolve(ROOT, relPath), "utf8");
}

function readJson(relPath) {
  return JSON.parse(read(relPath));
}

function number(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Expected numeric value, got ${value}`);
  return n;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pct(avgOver2) {
  return (avgOver2 / 2) * 100;
}

function fmt(value) {
  return `${value.toFixed(1)}%`;
}

function parseBirdFormal() {
  const text = read("results/bird-layer1-formal/summary.md");
  const rows = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\| (DirectLLM|SchemaGroundedLLM|SkillGuidedAgent) \| \d+ \| \d+ \| \d+ \| \d+ \| \d+ \| ([0-9.]+) \|/);
    if (m) rows[m[1]] = pct(number(m[2]));
  }
  return rows;
}

function parseBirdRepair() {
  const text = read("results/bird-layer1-repair/summary.md");
  const m = text.match(/^\| SkillGuidedAgentRepair \| \d+ \| \d+ \| \d+ \| \d+ \| \d+ \| ([0-9.]+) \|/m);
  if (!m) throw new Error("Could not parse SkillGuidedAgentRepair from BIRD repair summary.");
  return pct(number(m[1]));
}

function parseNvbench() {
  const text = read("results/nvbench-layer2-formal/summary.md");
  const rows = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\| (DirectLLM|SchemaGroundedLLM|SkillGuidedAgent) \| [^|]+ \| [^|]+ \| ([0-9.]+) \| ([0-9.]+) \| ([0-9.]+) \| ([0-9.]+) \|/);
    if (m) {
      rows[m[1]] = {
        viz: number(m[2]) * 100,
        metric: number(m[3]) * 100,
        dimension: number(m[4]) * 100,
        score: pct(number(m[5])),
        specOnly: mean([number(m[2]), number(m[3]), number(m[4])]) * 100,
      };
    }
  }
  return rows;
}

function parseFinancial() {
  const text = read("results/financial-formal/auto-grade-summary.md");
  const rows = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\| (DirectLLM|SchemaGroundedLLM|SkillGuidedAgent) \| (query|dashboard|analysis|rca) \| \d+ \| \d+ \| [0-9.]+ \| ([0-9.]+) \|/);
    if (m) {
      rows[m[1]] ||= {};
      rows[m[1]][m[2]] = number(m[3]);
    }
  }
  return rows;
}

function parseNvbenchSystem(summaryPath, systemName) {
  const text = read(summaryPath);
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split("|").map((cell) => cell.trim());
    if (cells[1] === systemName && cells.length >= 8) return pct(number(cells[7]));
  }
  throw new Error(`Could not parse ${systemName} from ${summaryPath}`);
}

function parseFinancialClass(summaryPath, systemName, klass) {
  const text = read(summaryPath);
  for (const line of text.split(/\r?\n/)) {
    const cells = line.split("|").map((cell) => cell.trim());
    if (cells[1] === systemName && cells[2] === klass && cells.length >= 7) return number(cells[6]);
  }
  throw new Error(`Could not parse ${systemName}/${klass} from ${summaryPath}`);
}

function parseDirectEvidenceClass(relPath, klass) {
  const payload = readJson(relPath);
  const value = payload?.class_scores?.[klass]?.normalized_pct;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Could not parse ${klass} normalized_pct from ${relPath}`);
  }
  return value;
}

function row({ variant, skill, repair, hybrid, values, status, evidence, caveat }) {
  const nl2QueryChart = mean([values.query, values.chart]);
  const nl2Bi = mean([values.dashboard, values.analysis, values.rca]);
  const aggregate = mean([values.query, values.chart, values.dashboard, values.analysis, values.rca]);
  return {
    variant,
    skill,
    repair,
    hybrid,
    nl2QueryChart,
    nl2Bi,
    aggregate,
    status,
    evidence,
    caveat,
    values,
  };
}

function buildRows() {
  const bird = parseBirdFormal();
  const birdRepair = parseBirdRepair();
  const nv = parseNvbench();
  const fin = parseFinancial();
  const noChartParamChart = parseNvbenchSystem(
    "results/ablation/direct-reruns/no-chart-param-layer2/summary.md",
    "NoChartParamRefsAgent"
  );
  const noChartParamDashboard = parseFinancialClass(
    "results/ablation/direct-reruns/no-chart-param-layer3-dashboard/auto-grade-summary.md",
    "NoChartParamRefsAgent",
    "dashboard"
  );
  const noRcaPlanningRca = parseFinancialClass(
    "results/ablation/direct-reruns/no-rca-drill-planning/auto-grade-summary.md",
    "NoRcaDrillPlanningAgent",
    "rca"
  );
  const noVerifyEvidence = "results/ablation/direct-reruns/no-verify-repair/evidence.json";
  const screenshotEvidence = "results/ablation/direct-reruns/screenshot-only-monitoring/signal-limited-score.json";
  const apiEvidence = "results/ablation/direct-reruns/api-only-monitoring/signal-limited-score.json";

  const full = {
    query: birdRepair,
    chart: nv.SkillGuidedAgent.score,
    dashboard: fin.SkillGuidedAgent.dashboard,
    analysis: fin.SkillGuidedAgent.analysis,
    rca: fin.SkillGuidedAgent.rca,
  };

  const noVerify = {
    query: parseDirectEvidenceClass(noVerifyEvidence, "query"),
    chart: parseDirectEvidenceClass(noVerifyEvidence, "chart"),
    dashboard: parseDirectEvidenceClass(noVerifyEvidence, "dashboard"),
    analysis: parseDirectEvidenceClass(noVerifyEvidence, "analysis"),
    rca: parseDirectEvidenceClass(noVerifyEvidence, "rca"),
  };

  const noSkill = {
    query: bird.SchemaGroundedLLM,
    chart: nv.SchemaGroundedLLM.score,
    dashboard: fin.SchemaGroundedLLM.dashboard,
    analysis: fin.SchemaGroundedLLM.analysis,
    rca: fin.SchemaGroundedLLM.rca,
  };

  const noChartRefs = {
    query: full.query,
    chart: noChartParamChart,
    dashboard: noChartParamDashboard,
    analysis: full.analysis,
    rca: full.rca,
  };

  const noRcaPlanning = {
    query: full.query,
    chart: full.chart,
    dashboard: full.dashboard,
    analysis: full.analysis,
    rca: noRcaPlanningRca,
  };

  const apiOnly = {
    query: full.query,
    chart: full.chart,
    dashboard: parseDirectEvidenceClass(apiEvidence, "dashboard"),
    analysis: parseDirectEvidenceClass(apiEvidence, "analysis"),
    rca: parseDirectEvidenceClass(apiEvidence, "rca"),
  };

  const screenshotOnly = {
    query: full.query,
    chart: full.chart,
    dashboard: parseDirectEvidenceClass(screenshotEvidence, "dashboard"),
    analysis: parseDirectEvidenceClass(screenshotEvidence, "analysis"),
    rca: parseDirectEvidenceClass(screenshotEvidence, "rca"),
  };

  return [
    row({
      variant: "Full system",
      skill: "yes",
      repair: "yes",
      hybrid: "yes",
      values: full,
      status: "direct",
      evidence: "BIRD repair summary + NVBench SkillGuided artifact summary + financial prefilled rubric.",
      caveat: "Layer-2/Layer-3 values remain spot-check pending before final submission.",
    }),
    row({
      variant: "Skill, no verify-repair",
      skill: "yes",
      repair: "no",
      hybrid: "yes",
      values: noVerify,
      status: "direct",
      evidence: "Archived first-pass/no-retry SkillGuided outputs under `results/bird-layer1-formal/`, `results/nvbench-layer2-formal/`, and `results/financial-formal/`, summarized in `results/ablation/direct-reruns/no-verify-repair/evidence.json`.",
      caveat: "Layer-3 formal SkillGuided outputs did not archive a separate post-verdict retry arm, so their no-verify values equal the one-shot formal outputs.",
    }),
    row({
      variant: "Skill, screenshot only (no API)",
      skill: "yes",
      repair: "yes",
      hybrid: "screenshot only",
      values: screenshotOnly,
      status: "direct",
      evidence: "Fresh signal-limited no-context `ScreenshotOnlyMonitoringAgent` scoring stored in `results/ablation/direct-reruns/screenshot-only-monitoring/signal-limited-score.json`.",
      caveat: "Screenshots can judge rendered dashboard presence and label alignment, but not SQL correctness; analysis/RCA receive conservative zero because no screenshot artifact was allowed for those text/report tasks.",
    }),
    row({
      variant: "Skill, API only (no screenshot)",
      skill: "yes",
      repair: "yes",
      hybrid: "API only",
      values: apiOnly,
      status: "direct",
      evidence: "Fresh signal-limited no-context `ApiOnlyMonitoringAgent` scoring stored in `results/ablation/direct-reruns/api-only-monitoring/signal-limited-score.json`.",
      caveat: "API evidence supports SQL/query-data correctness, but cannot fully judge rendered layout or screenshot-only visual failures.",
    }),
    row({
      variant: "No skill (schema-grounded), hybrid",
      skill: "no",
      repair: "yes",
      hybrid: "yes",
      values: noSkill,
      status: "direct",
      evidence: "SchemaGroundedLLM rows from BIRD, NVBench, and financial formal summaries.",
      caveat: "Layer-2 is spec-only and does not prove Superset artifact creation.",
    }),
    row({
      variant: "No chart-param references",
      skill: "partial",
      repair: "yes",
      hybrid: "yes",
      values: noChartRefs,
      status: "direct",
      evidence: "Fresh no-context NoChartParamRefsAgent reruns for 30 NVBench chart specs and 10 financial dashboards under `results/ablation/direct-reruns/`; Layer-2 scoring requires artifact execution and therefore records 0/30 verified artifacts.",
      caveat: "Layer-2 chart semantics remain strong as specs, but the ablation does not materialize Superset charts without the chart-param reference/tool layer.",
    }),
    row({
      variant: "No RCA drill-planning",
      skill: "partial",
      repair: "yes",
      hybrid: "yes",
      values: noRcaPlanning,
      status: "direct",
      evidence: "Fresh no-context NoRcaDrillPlanningAgent rerun for the 10 financial RCA tasks under `results/ablation/direct-reruns/`.",
      caveat: "The no-RCA-drill-planning sub-agent could not authenticate to SQL Lab and therefore produced planned SQL plus inconclusive reports; this is counted as missing executed-evidence rather than repaired by the parent.",
    }),
  ];
}

function writeSummary(rows) {
  const lines = [];
  lines.push("# Combined Ablation Table Values");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("This file aggregates existing formal benchmark evidence and direct signal-limited ablation reruns into the paper's combined ablation table.");
  lines.push("");
  lines.push("## Table Values");
  lines.push("");
  lines.push("| Variant | Skill SOP+refs | Verify-repair | Hybrid monitor | NL2Query/NL2Chart | NL2Dash/NL2Anal/NL2RCA | Aggregate | Evidence status |");
  lines.push("|---|---|---|---|---:|---:|---:|---|");
  for (const r of rows) {
    lines.push(`| ${r.variant} | ${r.skill} | ${r.repair} | ${r.hybrid} | ${fmt(r.nl2QueryChart)} | ${fmt(r.nl2Bi)} | ${fmt(r.aggregate)} | ${r.status} |`);
  }
  lines.push("");
  lines.push("## Per-Class Inputs");
  lines.push("");
  lines.push("| Variant | NL2Query | NL2Chart | NL2Dashboard | NL2Analysis | NL2RCA |");
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const r of rows) {
    lines.push(`| ${r.variant} | ${fmt(r.values.query)} | ${fmt(r.values.chart)} | ${fmt(r.values.dashboard)} | ${fmt(r.values.analysis)} | ${fmt(r.values.rca)} |`);
  }
  lines.push("");
  lines.push("## Evidence Notes");
  lines.push("");
  for (const r of rows) {
    lines.push(`### ${r.variant}`);
    lines.push("");
    lines.push(`- Evidence status: ${r.status}`);
    lines.push(`- Evidence: ${r.evidence}`);
    lines.push(`- Caveat: ${r.caveat}`);
    lines.push("");
  }
  lines.push("## Recommended Manuscript Footnote");
  lines.push("");
  lines.push("Rows marked `direct` are computed from archived benchmark outputs or fresh direct-rerun ablation outputs under `results/ablation/direct-reruns/`. Signal-limited monitoring rows are direct scorer reruns with restricted evidence scopes, not diagnostic proxy estimates.");

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "summary.md"), `${lines.join("\n")}\n`);
}

const rows = buildRows();
writeSummary(rows);
console.log(`wrote ${path.relative(ROOT, path.join(OUT_DIR, "summary.md"))}`);
