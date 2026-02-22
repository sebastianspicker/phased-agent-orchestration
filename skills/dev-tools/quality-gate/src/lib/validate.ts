import { readFileSync } from "node:fs";
import type { SchemaValidationResult } from "../types.js";

interface AjvErrorObject {
  instancePath: string;
  message?: string;
}

interface AjvValidateFunction {
  (data: unknown): boolean;
  errors?: AjvErrorObject[] | null;
}

interface AjvInstance {
  compile(schema: Record<string, unknown>): AjvValidateFunction;
}

type AjvConstructor = new (opts: Record<string, unknown>) => AjvInstance;
type AjvFormatsFn = (ajv: AjvInstance, formats?: string[]) => void;

let _AjvClass: AjvConstructor | undefined;
let _addFormats: AjvFormatsFn | undefined;

async function getAjv(): Promise<AjvConstructor> {
  if (_AjvClass) return _AjvClass;
  const mod: Record<string, unknown> = await import("ajv");
  const candidate = mod.default ?? mod;
  const inner =
    typeof candidate === "function"
      ? candidate
      : ((candidate as Record<string, unknown>).default ?? candidate);
  _AjvClass = inner as AjvConstructor;
  return _AjvClass;
}

async function getAddFormats(): Promise<AjvFormatsFn> {
  if (_addFormats) return _addFormats;
  const mod: Record<string, unknown> = await import("ajv-formats");
  const candidate = mod.default ?? mod;
  const inner =
    typeof candidate === "function"
      ? candidate
      : ((candidate as Record<string, unknown>).default ?? candidate);
  _addFormats = inner as AjvFormatsFn;
  return _addFormats;
}

export async function validateArtifact(
  artifact: Record<string, unknown>,
  schemaPath: string,
): Promise<SchemaValidationResult> {
  let schemaText: string;
  try {
    schemaText = readFileSync(schemaPath, "utf8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { valid: false, errors: [`Failed to load schema: ${msg}`] };
  }

  let schema: unknown;
  try {
    schema = JSON.parse(schemaText);
  } catch {
    return { valid: false, errors: ["Schema file is not valid JSON"] };
  }

  const AjvClass = await getAjv();
  const addFormats = await getAddFormats();
  const ajv = new AjvClass({
    allErrors: true,
    strict: false,
    validateSchema: false,
  });

  // Enforce standard JSON Schema string formats used by repo contracts.
  addFormats(ajv, ["date-time", "uri"]);

  let validateFn: AjvValidateFunction;
  try {
    validateFn = ajv.compile(schema as Record<string, unknown>);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { valid: false, errors: [`Schema compilation failed: ${msg}`] };
  }

  const valid = validateFn(artifact);
  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validateFn.errors ?? []).map((e) => {
    const path = e.instancePath || "/";
    return `${path}: ${e.message ?? "unknown error"}`;
  });

  return { valid: false, errors };
}
