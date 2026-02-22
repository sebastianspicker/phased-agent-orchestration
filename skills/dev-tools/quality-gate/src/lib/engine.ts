import { randomUUID } from "node:crypto";
import { realpathSync } from "node:fs";
import path from "node:path";
import type { GateResult, GateStatus, Input } from "../types.js";
import { evaluateCriteria } from "./criteria.js";
import { validateInput } from "./input.js";
import { validateArtifact } from "./validate.js";

interface EvaluateGateOptions {
  workspaceRoot?: string;
  now?: Date;
}

function badInput(message: string): Error {
  return Object.assign(new Error(message), { code: "E_BAD_INPUT" });
}

function resolveSchemaPath(workspaceRoot: string, schemaRef: string): string {
  if (path.isAbsolute(schemaRef)) {
    throw badInput("schema_ref must resolve within workspaceRoot");
  }

  const root = realpathSync(path.resolve(workspaceRoot));
  const resolved = path.resolve(root, schemaRef);
  const rel = path.relative(root, resolved);

  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw badInput("schema_ref must resolve within workspaceRoot");
  }

  try {
    const resolvedReal = realpathSync(resolved);
    const resolvedRel = path.relative(root, resolvedReal);
    if (resolvedRel.startsWith("..") || path.isAbsolute(resolvedRel)) {
      throw badInput("schema_ref must resolve within workspaceRoot");
    }
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code !== "ENOENT") {
      throw err;
    }
  }

  return resolved;
}

export async function evaluateGate(
  input: Input,
  opts: EvaluateGateOptions = {},
): Promise<{ data: GateResult; logs: string[] }> {
  validateInput(input);

  const workspaceRoot = opts.workspaceRoot ?? "/workspace";
  const logs: string[] = [];
  const schemaPath = resolveSchemaPath(workspaceRoot, input.schema_ref);
  logs.push(`Validating artifact against schema: ${schemaPath}`);

  const schemaValidation = await validateArtifact(input.artifact, schemaPath);
  logs.push(`Schema validation: ${schemaValidation.valid ? "passed" : "failed"}`);
  if (schemaValidation.errors.length > 0) {
    logs.push(`Schema errors: ${schemaValidation.errors.join("; ")}`);
  }

  const criteriaResults = evaluateCriteria(input.artifact, input.criteria);
  const blockingFailures = criteriaResults.filter((r) => !r.passed).map((r) => r.name);

  logs.push(`Criteria evaluated: ${criteriaResults.length}, failures: ${blockingFailures.length}`);

  const status: GateStatus =
    !schemaValidation.valid || blockingFailures.length > 0 ? "fail" : "pass";

  return {
    data: {
      gate_id: randomUUID(),
      phase: input.phase,
      status,
      criteria: criteriaResults,
      blocking_failures: blockingFailures,
      artifact_ref: input.artifact_ref ?? "inline:artifact",
      schema_validation: schemaValidation,
      timestamp: (opts.now ?? new Date()).toISOString(),
    },
    logs,
  };
}
