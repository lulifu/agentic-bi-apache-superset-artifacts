#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ROOT,
  TAG,
  safeError,
  splitSemi,
  truncate,
} from "./common.mjs";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "";
const OPENAI_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/responses";

export function buildTaskBrief(task, schemaText = "") {
  return [
    `Task ID: ${task.id}`,
    `Class: ${task.class}`,
    `Dataset: ${task.dataset}`,
    `Request: ${task.nl_request}`,
    task.evidence ? `Evidence: ${task.evidence}` : null,
    task.expected_metrics ? `Expected metrics: ${task.expected_metrics}` : null,
    task.expected_dimensions ? `Expected dimensions: ${task.expected_dimensions}` : null,
    task.expected_filters ? `Expected filters: ${task.expected_filters}` : null,
    task.expected_time_range ? `Expected time range: ${task.expected_time_range}` : null,
    task.expected_viz_type ? `Expected viz type: ${task.expected_viz_type}` : null,
    schemaText ? `Schema:\n${schemaText}` : null,
  ].filter(Boolean).join("\n");
}

export function outputContract(task) {
  if (task.class === "query") {
    return "Return JSON with keys: artifact, sql. sql must be executable against the named dataset.";
  }
  if (task.class === "chart") {
    return "Return JSON with keys: artifact, chart_spec. chart_spec must include viz_type, dataset, metrics, dimensions, filters, and time_range.";
  }
  if (task.class === "dashboard") {
    return "Return JSON with keys: artifact, dashboard_spec. dashboard_spec must list charts, layout intent, filters, and verification notes.";
  }
  if (task.class === "analysis") {
    return "Return JSON with keys: artifact, sql, analysis_report. Use data-backed quantitative claims only.";
  }
  if (task.class === "rca") {
    return "Return JSON with keys: artifact, sql, rca_report. Identify anomaly direction, drill-downs, top contributors, and evidence.";
  }
  return "Return JSON with keys: artifact.";
}

function directSystemPrompt() {
  return "You are a BI assistant; translate the NL request into a SQL string, chart spec, dashboard spec, or analysis report.";
}

function schemaSystemPrompt() {
  return `${directSystemPrompt()} Use only the provided dataset schema and do not invent columns.`;
}

function skillSystemPrompt() {
  return [
    "You are a skill-guided Superset BI agent.",
    "Use the maintained Superset skill conventions: inspect dataset metadata before choosing fields, prefer relative or explicit benchmark-safe time filters, verify chart/dashboard payloads, and tag created artifacts with nl2bi-bench-2026.",
    "In this runner, return the intended tool plan and final artifact JSON. Do not claim an artifact was created unless a tool call actually created it.",
  ].join(" ");
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function callOpenAI({ system, user, model }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for non-dry-run LLM execution");
  }
  if (!model) {
    throw new Error("OPENAI_MODEL is required for non-dry-run LLM execution");
  }

  const started = Date.now();
  const body = {
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  const resp = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`OpenAI request failed (${resp.status}): ${truncate(JSON.stringify(data), 300)}`);
  }

  const outputText = data.output_text
    || (data.output || []).flatMap((item) => item.content || []).map((c) => c.text || "").join("\n").trim()
    || JSON.stringify(data);
  const parsed = tryParseJson(outputText);
  const usage = data.usage || {};
  return {
    parsed,
    outputText,
    raw: data,
    latency_ms: Date.now() - started,
    tokens_input: usage.input_tokens ?? usage.prompt_tokens ?? null,
    tokens_output: usage.output_tokens ?? usage.completion_tokens ?? null,
  };
}

export function codexSubagentNote() {
  return [
    "Primary non-dry-run mode for this project is interactive Codex sub-agents.",
    "The Node runner cannot spawn Codex session sub-agents directly; the parent Codex session spawns them with multi_agent_v1 and archives their final JSON with archive_subagent_result.mjs.",
    "The OpenAI API path below is retained only as an optional automation fallback for environments that explicitly provide OPENAI_API_KEY and OPENAI_MODEL.",
  ].join(" ");
}

function dryRunResult(task, systemName, prompt, schemaText = "") {
  const metrics = splitSemi(task.expected_metrics);
  const dimensions = splitSemi(task.expected_dimensions);
  const artifact = {
    mode: "dry-run",
    task_id: task.id,
    system: systemName,
    dataset: task.dataset,
    expected_artifact_type: task.expected_artifact_type,
    expected_viz_type: task.expected_viz_type || null,
    expected_metrics: metrics,
    expected_dimensions: dimensions,
    prompt_preview: truncate(prompt, 1200),
    schema_cached: Boolean(schemaText),
  };
  return {
    artifact,
    sql: task.ground_truth_sql_starrocks || "",
    chart_spec: task.class === "chart" ? {
      viz_type: task.expected_viz_type,
      dataset: task.dataset,
      metrics,
      dimensions,
      filters: task.expected_filters || "",
      time_range: task.expected_time_range || "",
    } : undefined,
    tokens_input: null,
    tokens_output: null,
    tool_calls: [],
    raw_response: artifact,
  };
}

class System {
  constructor(options = {}) {
    this.options = options;
    this.model = options.model || DEFAULT_MODEL;
  }

  schemaFor(task) {
    const schemaPath = path.resolve(ROOT, "cache/schema", `${task.dataset}.txt`);
    try {
      return readFileSync(schemaPath, "utf8");
    } catch {
      return "";
    }
  }

  async complete({ task, system, user, dryRun, schemaText = "" }) {
    if (dryRun) return dryRunResult(task, this.name, `${system}\n\n${user}`, schemaText);
    const response = await callOpenAI({ system, user, model: this.model });
    return {
      artifact: response.parsed?.artifact ?? response.outputText,
      sql: response.parsed?.sql ?? "",
      chart_spec: response.parsed?.chart_spec ?? response.parsed?.dashboard_spec ?? null,
      latency_ms: response.latency_ms,
      tokens_input: response.tokens_input,
      tokens_output: response.tokens_output,
      tool_calls: [],
      raw_response: response.raw,
    };
  }
}

export class DirectLLM extends System {
  name = "DirectLLM";

  async run(task, context = {}) {
    const user = `${buildTaskBrief(task)}\n\n${outputContract(task)}`;
    return this.complete({ task, system: directSystemPrompt(), user, dryRun: context.dryRun });
  }
}

export class SchemaGroundedLLM extends System {
  name = "SchemaGroundedLLM";

  async run(task, context = {}) {
    const schemaText = this.schemaFor(task);
    const user = `${buildTaskBrief(task, schemaText)}\n\n${outputContract(task)}`;
    return this.complete({ task, system: schemaSystemPrompt(), user, dryRun: context.dryRun, schemaText });
  }
}

export class SkillGuidedAgent extends System {
  name = "SkillGuidedAgent";

  async run(task, context = {}) {
    const schemaText = this.schemaFor(task);
    const toolPlan = [
      "Available local tools:",
      "- create_chart.mjs --search-dataset / --dataset-info / --preview / --create",
      "- query_chart.mjs for chart data and dataset queries",
      "- create_dashboard.mjs / verify_dashboard.mjs for dashboard tasks",
      "- read_reference_tool.mjs for maintained skill references",
      `Artifact tag: ${TAG}`,
      context.allowMutate ? "Mutation mode: allowed by runner flag." : "Mutation mode: disabled; produce a plan/spec only.",
    ].join("\n");
    const user = `${buildTaskBrief(task, schemaText)}\n\n${toolPlan}\n\n${outputContract(task)}`;
    const result = await this.complete({ task, system: skillSystemPrompt(), user, dryRun: context.dryRun, schemaText });
    result.tool_calls ||= [];
    if (context.dryRun) {
      result.tool_calls.push({ name: "dry_run_tool_plan", status: "planned_only" });
    }
    return result;
  }
}

export function makeSystem(name, options = {}) {
  if (name === "DirectLLM") return new DirectLLM(options);
  if (name === "SchemaGroundedLLM") return new SchemaGroundedLLM(options);
  if (name === "SkillGuidedAgent") return new SkillGuidedAgent(options);
  throw new Error(`Unknown system: ${name}`);
}

export async function runSystem(systemName, task, context = {}) {
  const system = makeSystem(systemName, context);
  const started = Date.now();
  try {
    const result = await system.run(task, context);
    return {
      task_id: task.id,
      system: systemName,
      task_class: task.class,
      dataset: task.dataset,
      success: !result.error,
      latency_ms: result.latency_ms ?? (Date.now() - started),
      tokens_input: result.tokens_input ?? null,
      tokens_output: result.tokens_output ?? null,
      artifact: result.artifact ?? null,
      sql: result.sql ?? "",
      chart_spec: result.chart_spec ?? null,
      tool_calls: result.tool_calls ?? [],
      error: result.error ?? null,
      raw_response: result.raw_response ?? null,
      dry_run: Boolean(context.dryRun),
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      task_id: task.id,
      system: systemName,
      task_class: task.class,
      dataset: task.dataset,
      success: false,
      latency_ms: Date.now() - started,
      tokens_input: null,
      tokens_output: null,
      artifact: null,
      sql: "",
      chart_spec: null,
      tool_calls: [],
      error: safeError(err),
      raw_response: null,
      dry_run: Boolean(context.dryRun),
      created_at: new Date().toISOString(),
    };
  }
}
