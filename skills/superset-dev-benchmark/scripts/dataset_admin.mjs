#!/usr/bin/env node

/**
 * Superset Dataset Admin Helper
 *
 * Auth handled externally by the local token interceptor
 * (scripts/skill-adapter-codex/superset_token_interceptor.mjs). No auth code here.
 *
 * Modes:
 *   --list-databases
 *   --list-schemas --database-id <id>
 *   --list-tables --database-id <id> --schema <schema>
 *   --search-dataset <table> [--database-id <id>] [--schema <schema>]
 *   --ensure-physical --database-id <id> --schema <schema> --table <table>
 *   --ensure-virtual --database-id <id> --schema <schema> --table <name> --sql-file <path>
 *   --ensure-bird-financial --database-id <id> --schema <schema>
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { API_BASE, request } from "./http.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_BIRD_TABLES_PATH = path.join(REPO_ROOT, "tasks/datasets/bird/dev_20240627/dev_tables.json");
const BIRD_FINANCIAL_TABLES = ["account", "card", "client", "disp", "district", "loan", "order", "trans"];

function q(obj) {
  return encodeURIComponent(JSON.stringify(obj));
}

function asInt(value, label) {
  const parsed = parseInt(value, 10);
  if (!parsed) throw new Error(`${label} must be a positive integer`);
  return parsed;
}

async function listDatabases(pageSize = 100) {
  const query = q({ page: 0, page_size: pageSize, order_column: "database_name", order_direction: "asc" });
  return await request("GET", `${API_BASE}/api/v1/database/?q=${query}`);
}

async function listSchemas(databaseId, force = false) {
  const query = q({ force });
  return await request("GET", `${API_BASE}/api/v1/database/${databaseId}/schemas/?q=${query}`);
}

async function listTables(databaseId, schemaName, force = false) {
  const query = q({ schema_name: schemaName, force });
  return await request("GET", `${API_BASE}/api/v1/database/${databaseId}/tables/?q=${query}`);
}

async function searchDatasets(tableName, { databaseId, schemaName } = {}) {
  const query = q({
    filters: [{ col: "table_name", opr: "eq", value: tableName }],
    page: 0,
    page_size: 100,
    order_column: "changed_on_delta_humanized",
    order_direction: "desc",
  });
  const data = await request("GET", `${API_BASE}/api/v1/dataset/?q=${query}`);
  const rows = data.result || [];
  const filtered = rows.filter((row) => {
    const dbOk = databaseId ? row.database?.id === databaseId : true;
    const schemaOk = schemaName ? row.schema === schemaName : true;
    return dbOk && schemaOk;
  });
  return { ...data, result: filtered, count: filtered.length };
}

async function getDataset(datasetId) {
  return await request("GET", `${API_BASE}/api/v1/dataset/${datasetId}`);
}

async function createPhysicalDataset({ databaseId, schemaName, tableName }) {
  const payload = {
    database: databaseId,
    schema: schemaName,
    table_name: tableName,
    normalize_columns: false,
  };
  return await request("POST", `${API_BASE}/api/v1/dataset/`, payload);
}

async function createVirtualDataset({ databaseId, schemaName, tableName, sql }) {
  // Dataset POST does not accept `description`; create first, then PUT metadata.
  const payload = {
    database: databaseId,
    schema: schemaName,
    table_name: tableName,
    sql,
    normalize_columns: false,
  };
  return await request("POST", `${API_BASE}/api/v1/dataset/`, payload);
}

async function updateDataset(datasetId, payload) {
  return await request("PUT", `${API_BASE}/api/v1/dataset/${datasetId}`, payload);
}

function loadBirdFinancialMetadata(metadataPath = DEFAULT_BIRD_TABLES_PATH) {
  if (!existsSync(metadataPath)) {
    throw new Error(`metadata file not found: ${metadataPath}`);
  }
  const all = JSON.parse(readFileSync(metadataPath, "utf8"));
  const financial = all.find((entry) => entry.db_id === "financial");
  if (!financial) throw new Error(`financial metadata not found in ${metadataPath}`);

  const tables = {};
  for (let i = 0; i < financial.table_names_original.length; i++) {
    const original = financial.table_names_original[i];
    tables[original] = {
      table_name: original,
      semantic_name: financial.table_names?.[i] || original,
      columns: [],
    };
  }

  for (let i = 0; i < financial.column_names_original.length; i++) {
    const [tableIndex, columnName] = financial.column_names_original[i];
    if (tableIndex < 0) continue;
    const tableName = financial.table_names_original[tableIndex];
    const semanticName = financial.column_names?.[i]?.[1] || columnName;
    const type = financial.column_types?.[i] || "";
    tables[tableName]?.columns.push({
      column_name: columnName,
      semantic_name: semanticName,
      type,
    });
  }

  return tables;
}

function datasetDescription(tableMeta) {
  const columns = tableMeta.columns
    .map((col) => `${col.column_name}: ${col.semantic_name}${col.type ? ` (${col.type})` : ""}`)
    .join("; ");
  return [
    "BIRD financial benchmark physical dataset.",
    `Source table: ${tableMeta.table_name}.`,
    `Semantic table name: ${tableMeta.semantic_name}.`,
    `Column semantics: ${columns}.`,
  ].join(" ");
}

function buildColumnUpdates(datasetDetail, tableMeta) {
  const byName = new Map(tableMeta.columns.map((col) => [col.column_name, col]));
  return (datasetDetail.result?.columns || []).map((column) => {
    const meta = byName.get(column.column_name);
    if (!meta) return column;
    const semantic = meta.semantic_name === column.column_name ? null : meta.semantic_name;
    const isDate = meta.type === "date";
    return {
      id: column.id,
      column_name: column.column_name,
      type: column.type,
      verbose_name: semantic,
      description: semantic ? `BIRD semantic name: ${semantic}.` : null,
      expression: column.expression,
      filterable: column.filterable,
      groupby: column.groupby,
      is_active: column.is_active,
      is_dttm: isDate ? true : column.is_dttm,
      python_date_format: isDate ? "%Y-%m-%d" : column.python_date_format,
    };
  });
}

async function applyBirdMetadata(datasetId, tableMeta) {
  const detail = await getDataset(datasetId);
  const payload = {
    description: datasetDescription(tableMeta),
    columns: buildColumnUpdates(detail, tableMeta),
  };
  await updateDataset(datasetId, payload);
}

async function ensurePhysicalDataset({ databaseId, schemaName, tableName, metadataByTable, applyMetadata = false, dryRun = false }) {
  const existing = await searchDatasets(tableName, { databaseId, schemaName });
  const tableMeta = metadataByTable?.[tableName];
  if (existing.result.length) {
    const dataset = existing.result[0];
    if (applyMetadata && tableMeta && !dryRun) await applyBirdMetadata(dataset.id, tableMeta);
    return { table: tableName, dataset_id: dataset.id, created: false, metadata_applied: Boolean(applyMetadata && tableMeta && !dryRun) };
  }

  if (dryRun) {
    return { table: tableName, dataset_id: null, created: false, would_create: true, metadata_available: Boolean(tableMeta) };
  }

  const created = await createPhysicalDataset({ databaseId, schemaName, tableName });
  const datasetId = created.id;
  if (applyMetadata && tableMeta) await applyBirdMetadata(datasetId, tableMeta);
  return { table: tableName, dataset_id: datasetId, created: true, metadata_applied: Boolean(applyMetadata && tableMeta) };
}

async function ensureVirtualDataset({ databaseId, schemaName, tableName, sql, description, dryRun = false }) {
  const existing = await searchDatasets(tableName, { databaseId, schemaName });
  if (existing.result.length) {
    const dataset = existing.result[0];
    if (!dryRun) {
      const payload = { sql, is_sqllab_view: true };
      if (description) payload.description = description;
      await updateDataset(dataset.id, payload);
      return { table: tableName, dataset_id: dataset.id, created: false, updated: true };
    }
    return { table: tableName, dataset_id: dataset.id, created: false, updated: false };
  }

  if (dryRun) {
    return { table: tableName, dataset_id: null, created: false, would_create: true, sql };
  }

  const created = await createVirtualDataset({ databaseId, schemaName, tableName, sql });
  if (description) await updateDataset(created.id, { description, is_sqllab_view: true });
  return { table: tableName, dataset_id: created.id, created: true, updated: Boolean(description) };
}

function printListDatabases(data, rawJson) {
  if (rawJson) { console.log(JSON.stringify(data, null, 2)); return; }
  console.log(`Found ${data.count ?? data.result?.length ?? 0} database(s):\n`);
  for (const db of data.result || []) {
    console.log(`  #${db.id}  ${db.database_name}`);
    console.log(`        backend: ${db.backend || "-"}  allow_file_upload: ${db.allow_file_upload}`);
  }
}

function printList(title, items, rawJson) {
  if (rawJson) { console.log(JSON.stringify(items, null, 2)); return; }
  console.log(`${title} (${items.length}):\n`);
  for (const item of items) console.log(`  ${typeof item === "string" ? item : `${item.value} (${item.type})`}`);
}

if (process.argv[1]?.endsWith("dataset_admin.mjs")) {
  const { values } = parseArgs({
    options: {
      "list-databases": { type: "boolean", default: false },
      "list-schemas": { type: "boolean", default: false },
      "list-tables": { type: "boolean", default: false },
      "search-dataset": { type: "string" },
      "ensure-physical": { type: "boolean", default: false },
      "ensure-virtual": { type: "boolean", default: false },
      "ensure-bird-financial": { type: "boolean", default: false },
      "database-id": { type: "string" },
      schema: { type: "string" },
      table: { type: "string" },
      "sql-file": { type: "string" },
      description: { type: "string" },
      force: { type: "boolean", default: false },
      "apply-bird-metadata": { type: "boolean", default: false },
      "metadata-file": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  (async () => {
    try {
      const rawJson = values.json;
      const databaseId = values["database-id"] ? asInt(values["database-id"], "--database-id") : null;
      const schemaName = values.schema;

      if (values["list-databases"]) {
        printListDatabases(await listDatabases(), rawJson);
        return;
      }

      if (values["list-schemas"]) {
        if (!databaseId) throw new Error("--database-id is required for --list-schemas");
        const data = await listSchemas(databaseId, values.force);
        printList(`Schemas for database #${databaseId}`, data.result || [], rawJson);
        return;
      }

      if (values["list-tables"]) {
        if (!databaseId || !schemaName) throw new Error("--database-id and --schema are required for --list-tables");
        const data = await listTables(databaseId, schemaName, values.force);
        printList(`Tables for database #${databaseId}, schema ${schemaName}`, data.result || [], rawJson);
        return;
      }

      if (values["search-dataset"]) {
        const data = await searchDatasets(values["search-dataset"], { databaseId, schemaName });
        if (rawJson) { console.log(JSON.stringify(data, null, 2)); return; }
        console.log(`Found ${data.count} matching dataset(s):\n`);
        for (const ds of data.result || []) {
          console.log(`  #${ds.id}  ${ds.table_name}`);
          console.log(`        schema: ${ds.schema || "-"}  database: ${ds.database?.database_name || ds.database?.name || "-"}  changed: ${ds.changed_on_delta_humanized || ""}`);
        }
        return;
      }

      if (values["ensure-physical"]) {
        if (!databaseId || !schemaName || !values.table) throw new Error("--database-id, --schema, and --table are required for --ensure-physical");
        const metadataByTable = values["apply-bird-metadata"] ? loadBirdFinancialMetadata(values["metadata-file"]) : null;
        const result = await ensurePhysicalDataset({
          databaseId,
          schemaName,
          tableName: values.table,
          metadataByTable,
          applyMetadata: values["apply-bird-metadata"],
          dryRun: values["dry-run"],
        });
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (values["ensure-virtual"]) {
        if (!databaseId || !schemaName || !values.table || !values["sql-file"]) {
          throw new Error("--database-id, --schema, --table, and --sql-file are required for --ensure-virtual");
        }
        const sqlPath = path.resolve(process.cwd(), values["sql-file"]);
        const sql = readFileSync(sqlPath, "utf8").trim();
        if (!sql) throw new Error(`SQL file is empty: ${sqlPath}`);
        const result = await ensureVirtualDataset({
          databaseId,
          schemaName,
          tableName: values.table,
          sql,
          description: values.description,
          dryRun: values["dry-run"],
        });
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (values["ensure-bird-financial"]) {
        if (!databaseId || !schemaName) throw new Error("--database-id and --schema are required for --ensure-bird-financial");
        const metadataByTable = loadBirdFinancialMetadata(values["metadata-file"]);
        const tables = await listTables(databaseId, schemaName, values.force);
        const available = new Set((tables.result || []).filter((t) => t.type === "table").map((t) => t.value));
        const missing = BIRD_FINANCIAL_TABLES.filter((table) => !available.has(table));
        if (missing.length) throw new Error(`schema ${schemaName} is missing BIRD financial table(s): ${missing.join(", ")}`);
        const results = [];
        for (const table of BIRD_FINANCIAL_TABLES) {
          results.push(await ensurePhysicalDataset({
            databaseId,
            schemaName,
            tableName: table,
            metadataByTable,
            applyMetadata: values["apply-bird-metadata"],
            dryRun: values["dry-run"],
          }));
        }
        console.log(JSON.stringify({ database_id: databaseId, schema: schemaName, results }, null, 2));
        return;
      }

      console.error("Usage:");
      console.error("  node dataset_admin.mjs --list-databases");
      console.error("  node dataset_admin.mjs --list-schemas --database-id <id>");
      console.error("  node dataset_admin.mjs --list-tables --database-id <id> --schema <schema>");
      console.error("  node dataset_admin.mjs --search-dataset <table> [--database-id <id>] [--schema <schema>]");
      console.error("  node dataset_admin.mjs --ensure-physical --database-id <id> --schema <schema> --table <table> [--dry-run] [--apply-bird-metadata]");
      console.error("  node dataset_admin.mjs --ensure-virtual --database-id <id> --schema <schema> --table <name> --sql-file <path> [--dry-run]");
      console.error("  node dataset_admin.mjs --ensure-bird-financial --database-id <id> --schema <schema> [--dry-run] [--apply-bird-metadata]");
      process.exitCode = 1;
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
    }
  })();
}

export {
  listDatabases,
  listSchemas,
  listTables,
  searchDatasets,
  ensurePhysicalDataset,
  ensureVirtualDataset,
  loadBirdFinancialMetadata,
};
