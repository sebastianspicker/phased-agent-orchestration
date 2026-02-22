export interface TraceEvent {
  ts: string;
  run_id: string;
  event: string;
  phase: string;
  status?: "pass" | "fail" | "warn" | "ok" | "error" | "retry";
  tokens_in?: number;
  tokens_out?: number;
  cost_usd?: number;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}

export interface Input {
  run_id: string;
  trace_path?: string;
  schema_ref?: string;
  events?: TraceEvent[];
}

export interface TraceSummary {
  total_events: number;
  events_by_type: Record<string, number>;
  gate_results: { pass: number; fail: number; warn: number };
  phase_durations_ms: Record<string, number>;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
  failure_count: number;
  retry_count: number;
  total_duration_s?: number;
  security_time_to_closure_s?: number;
}

export interface TraceResult {
  run_id: string;
  valid: boolean;
  issues: string[];
  summary: TraceSummary;
}

export interface RunResult {
  success: boolean;
  data?: TraceResult;
  error?: { code: string; message: string; details?: unknown };
  metadata: { tool_version: string; execution_time_ms: number; [k: string]: unknown };
  logs: string[];
}
