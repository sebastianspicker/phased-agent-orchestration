import type { Input } from "../types.js";
import { isGatePhase } from "./phases.js";

const CRITERION_TYPES = new Set([
  "field-exists",
  "field-empty",
  "count-min",
  "count-max",
  "number-max",
  "coverage-min",
  "regex-match",
]);

export function validateInput(input: Input): void {
  if (!input?.artifact || typeof input.artifact !== "object" || Array.isArray(input.artifact)) {
    throw Object.assign(new Error("artifact must be a JSON object"), { code: "E_BAD_INPUT" });
  }
  if (!input.schema_ref || typeof input.schema_ref !== "string") {
    throw Object.assign(new Error("schema_ref is required"), { code: "E_BAD_INPUT" });
  }
  if (input.artifact_ref !== undefined && typeof input.artifact_ref !== "string") {
    throw Object.assign(new Error("artifact_ref must be a string when provided"), {
      code: "E_BAD_INPUT",
    });
  }
  if (!isGatePhase(input.phase)) {
    throw Object.assign(new Error("phase must be a valid pipeline phase"), { code: "E_BAD_INPUT" });
  }
  if (!Array.isArray(input.criteria)) {
    throw Object.assign(new Error("criteria must be an array"), { code: "E_BAD_INPUT" });
  }
  for (const c of input.criteria) {
    if (!c.name || typeof c.name !== "string") {
      throw Object.assign(new Error("Each criterion must have a name"), { code: "E_BAD_INPUT" });
    }
    if (!c.type || typeof c.type !== "string") {
      throw Object.assign(new Error("Each criterion must have a type"), { code: "E_BAD_INPUT" });
    }
    if (!CRITERION_TYPES.has(c.type)) {
      throw Object.assign(
        new Error(
          "Each criterion type must be one of: field-exists, field-empty, count-min, count-max, number-max, coverage-min, regex-match",
        ),
        {
          code: "E_BAD_INPUT",
        },
      );
    }
    if (!c.path || typeof c.path !== "string") {
      throw Object.assign(new Error("Each criterion must have a path"), { code: "E_BAD_INPUT" });
    }
    if (c.type === "count-min") {
      if (
        typeof c.value !== "number" ||
        !Number.isFinite(c.value) ||
        !Number.isInteger(c.value) ||
        c.value < 0
      ) {
        throw Object.assign(
          new Error("count-min criterion requires a non-negative integer value"),
          {
            code: "E_BAD_INPUT",
          },
        );
      }
    }
    if (c.type === "count-max") {
      if (
        typeof c.value !== "number" ||
        !Number.isFinite(c.value) ||
        !Number.isInteger(c.value) ||
        c.value < 0
      ) {
        throw Object.assign(
          new Error("count-max criterion requires a non-negative integer value"),
          {
            code: "E_BAD_INPUT",
          },
        );
      }
    }
    if (c.type === "number-max") {
      if (typeof c.value !== "number" || !Number.isFinite(c.value) || c.value < 0) {
        throw Object.assign(
          new Error("number-max criterion requires a non-negative number value"),
          {
            code: "E_BAD_INPUT",
          },
        );
      }
    }
    if (c.type === "coverage-min") {
      if (typeof c.value !== "number" || !Number.isFinite(c.value) || c.value < 0 || c.value > 1) {
        throw Object.assign(new Error("coverage-min criterion requires a value between 0 and 1"), {
          code: "E_BAD_INPUT",
        });
      }
      if (!c.source_path || typeof c.source_path !== "string") {
        throw Object.assign(new Error("coverage-min criterion requires source_path"), {
          code: "E_BAD_INPUT",
        });
      }
      if (!Array.isArray(c.target_paths) || c.target_paths.length === 0) {
        throw Object.assign(new Error("coverage-min criterion requires non-empty target_paths"), {
          code: "E_BAD_INPUT",
        });
      }
      for (const targetPath of c.target_paths) {
        if (typeof targetPath !== "string" || targetPath.length === 0) {
          throw Object.assign(
            new Error("coverage-min criterion target_paths must contain non-empty strings"),
            {
              code: "E_BAD_INPUT",
            },
          );
        }
      }
      if (c.source_filter_path !== undefined && typeof c.source_filter_path !== "string") {
        throw Object.assign(new Error("coverage-min source_filter_path must be a string"), {
          code: "E_BAD_INPUT",
        });
      }
    }
    if (c.type === "regex-match") {
      if (typeof c.value !== "string" || c.value.length === 0) {
        throw Object.assign(new Error("regex-match criterion requires non-empty string value"), {
          code: "E_BAD_INPUT",
        });
      }
    }
  }
}
