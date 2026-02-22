import type { Input } from "../types.js";
import { isGatePhase } from "./phases.js";

export function validateInput(input: Input): void {
  if (!input?.artifact || typeof input.artifact !== "object" || Array.isArray(input.artifact)) {
    throw Object.assign(new Error("artifact must be a JSON object"), { code: "E_BAD_INPUT" });
  }
  if (!input.schema_ref || typeof input.schema_ref !== "string") {
    throw Object.assign(new Error("schema_ref is required"), { code: "E_BAD_INPUT" });
  }
  if (input.artifact_ref !== undefined && typeof input.artifact_ref !== "string") {
    throw Object.assign(new Error("artifact_ref must be a string when provided"), { code: "E_BAD_INPUT" });
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
    if (!c.path || typeof c.path !== "string") {
      throw Object.assign(new Error("Each criterion must have a path"), { code: "E_BAD_INPUT" });
    }
  }
}
