import type { Criterion, CriterionResult } from "../types.js";

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = obj;
  for (const seg of segments) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[seg];
  }
  return current;
}

function checkFieldExists(artifact: Record<string, unknown>, path: string): CriterionResult {
  const val = resolvePath(artifact, path);
  const exists = val !== undefined && val !== null;
  return {
    name: "",
    passed: exists,
    evidence: exists
      ? `Field "${path}" exists with type ${typeof val}`
      : `Field "${path}" is missing or null`,
  };
}

function checkFieldEmpty(artifact: Record<string, unknown>, path: string): CriterionResult {
  const val = resolvePath(artifact, path);
  if (!Array.isArray(val)) {
    return {
      name: "",
      passed: false,
      evidence: `Field "${path}" is not an array`,
    };
  }
  const empty = val.length === 0;
  return {
    name: "",
    passed: empty,
    evidence: empty
      ? `Field "${path}" is an empty array`
      : `Field "${path}" has ${val.length} item(s), expected 0`,
  };
}

function checkCountMin(
  artifact: Record<string, unknown>,
  path: string,
  minValue: unknown,
): CriterionResult {
  const val = resolvePath(artifact, path);
  if (!Array.isArray(val)) {
    return {
      name: "",
      passed: false,
      evidence: `Field "${path}" is not an array`,
    };
  }
  const min = typeof minValue === "number" ? minValue : 0;
  const passed = val.length >= min;
  return {
    name: "",
    passed,
    evidence: `Field "${path}" has ${val.length} item(s), minimum required: ${min}`,
  };
}

function checkRegexMatch(
  artifact: Record<string, unknown>,
  path: string,
  pattern: unknown,
): CriterionResult {
  const val = resolvePath(artifact, path);
  if (typeof val !== "string") {
    return {
      name: "",
      passed: false,
      evidence: `Field "${path}" is not a string`,
    };
  }
  if (typeof pattern !== "string") {
    return {
      name: "",
      passed: false,
      evidence: `Regex pattern must be a string, got ${typeof pattern}`,
    };
  }
  let re: RegExp;
  try {
    re = new RegExp(pattern);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      name: "",
      passed: false,
      evidence: `Invalid regex pattern /${pattern}/: ${msg}`,
    };
  }
  const matched = re.test(val);
  return {
    name: "",
    passed: matched,
    evidence: matched
      ? `Field "${path}" matches pattern /${pattern}/`
      : `Field "${path}" value "${val}" does not match /${pattern}/`,
  };
}

export function evaluateCriteria(
  artifact: Record<string, unknown>,
  criteria: Criterion[],
): CriterionResult[] {
  return criteria.map((c) => {
    let result: CriterionResult;
    switch (c.type) {
      case "field-exists":
        result = checkFieldExists(artifact, c.path);
        break;
      case "field-empty":
        result = checkFieldEmpty(artifact, c.path);
        break;
      case "count-min":
        result = checkCountMin(artifact, c.path, c.value);
        break;
      case "regex-match":
        result = checkRegexMatch(artifact, c.path, c.value);
        break;
      default:
        result = { name: "", passed: false, evidence: `Unknown criterion type: ${c.type}` };
    }
    result.name = c.name;
    return result;
  });
}
