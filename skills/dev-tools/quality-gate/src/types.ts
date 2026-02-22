export type CriterionType = "field-exists" | "field-empty" | "count-min" | "regex-match";

export type GateStatus = "pass" | "fail" | "warn";
export type GatePhase =
  | "arm"
  | "design"
  | "adversarial-review"
  | "plan"
  | "pmatch"
  | "build"
  | "quality-static"
  | "quality-tests"
  | "denoise"
  | "quality-frontend"
  | "quality-backend"
  | "quality-docs"
  | "security-review"
  | "release-readiness";

export interface Criterion {
  name: string;
  type: CriterionType;
  path: string;
  value?: unknown;
}

export interface Input {
  artifact: Record<string, unknown>;
  artifact_ref?: string;
  schema_ref: string;
  phase: GatePhase;
  criteria: Criterion[];
}

export interface CriterionResult {
  name: string;
  passed: boolean;
  evidence: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

export interface GateResult {
  gate_id: string;
  phase: GatePhase;
  status: GateStatus;
  criteria: CriterionResult[];
  blocking_failures: string[];
  artifact_ref: string;
  schema_validation: SchemaValidationResult;
  timestamp?: string;
}

export interface RunResult {
  success: boolean;
  data?: GateResult;
  error?: { code: string; message: string; details?: unknown };
  metadata: { tool_version: string; execution_time_ms: number; [k: string]: unknown };
  logs: string[];
}
