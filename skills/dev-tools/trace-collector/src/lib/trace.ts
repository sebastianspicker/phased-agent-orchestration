import { readFileSync } from "node:fs";
import { resolveWithinWorkspace } from "@coding-agents-space/shared";
import type { Input, TraceEvent, TraceResult, TraceSummary } from "../types.js";

interface TraceOptions {
  workspaceRoot?: string;
}

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

function readJsonlEvents(tracePath: string): TraceEvent[] {
  const raw = readFileSync(tracePath, "utf8");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.map((line, idx) => {
    try {
      return JSON.parse(line) as TraceEvent;
    } catch (error) {
      throw Object.assign(new Error(`Invalid JSONL at line ${idx + 1}: ${String(error)}`), {
        code: "E_BAD_TRACE",
      });
    }
  });
}

function buildSummary(events: TraceEvent[], issues: string[]): TraceSummary {
  const eventsByType: Record<string, number> = {};
  const gateResults = { pass: 0, fail: 0, warn: 0 };
  const phaseStarts = new Map<string, number>();
  const phaseDurations: Record<string, number> = {};

  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalCostUsd = 0;
  let failures = 0;
  let retries = 0;

  for (const event of events) {
    eventsByType[event.event] = (eventsByType[event.event] ?? 0) + 1;

    if (event.event === "phase_start") {
      const ts = Date.parse(event.ts);
      if (!Number.isNaN(ts)) {
        phaseStarts.set(event.phase, ts);
      }
    }

    if (event.event === "phase_end") {
      const ts = Date.parse(event.ts);
      const start = phaseStarts.get(event.phase);
      if (start !== undefined && !Number.isNaN(ts) && ts >= start) {
        phaseDurations[event.phase] = (phaseDurations[event.phase] ?? 0) + (ts - start);
      } else {
        issues.push(`phase_end without matching phase_start: ${event.phase}`);
      }
    }

    if (event.event === "gate_result") {
      if (event.status === "pass") gateResults.pass++;
      else if (event.status === "fail") gateResults.fail++;
      else if (event.status === "warn") gateResults.warn++;
    }

    if (event.event === "error") failures++;
    if (event.event === "retry") retries++;

    if (typeof event.tokens_in === "number") totalTokensIn += Math.max(0, event.tokens_in);
    if (typeof event.tokens_out === "number") totalTokensOut += Math.max(0, event.tokens_out);
    if (typeof event.cost_usd === "number") totalCostUsd += Math.max(0, event.cost_usd);
  }

  for (const phase of phaseStarts.keys()) {
    if (!(phase in phaseDurations)) {
      issues.push(`phase_start without matching phase_end: ${phase}`);
    }
  }

  const totalDurationMs = Object.values(phaseDurations).reduce((acc, value) => acc + value, 0);

  return {
    total_events: events.length,
    events_by_type: eventsByType,
    gate_results: gateResults,
    phase_durations_ms: phaseDurations,
    total_tokens_in: totalTokensIn,
    total_tokens_out: totalTokensOut,
    total_cost_usd: Number(totalCostUsd.toFixed(6)),
    failure_count: failures,
    retry_count: retries,
    total_duration_s: Number((totalDurationMs / 1000).toFixed(3)),
    security_time_to_closure_s: Number(
      ((phaseDurations["security-review"] ?? 0) / 1000).toFixed(3),
    ),
  };
}

export async function collectTrace(
  input: Input,
  logs: string[],
  opts: TraceOptions = {},
): Promise<TraceResult> {
  const workspaceRoot = opts.workspaceRoot ?? "/workspace";
  const schemaRef = input.schema_ref ?? "contracts/artifacts/execution-trace.schema.json";
  const schemaPath = resolveWithinWorkspace(workspaceRoot, schemaRef, "Path", {
    rootLabel: "workspace root",
  });
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as Record<string, unknown>;

  let events: TraceEvent[];
  if (input.trace_path) {
    const tracePath = resolveWithinWorkspace(workspaceRoot, input.trace_path, "Path", {
      rootLabel: "workspace root",
    });
    logs.push(`Loaded trace events from ${tracePath}`);
    events = readJsonlEvents(tracePath);
  } else {
    events = input.events ?? [];
    logs.push(`Loaded inline trace events: ${events.length}`);
  }

  const AjvClass = await getAjv();
  const addFormats = await getAddFormats();
  const ajv = new AjvClass({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv, ["date-time", "uri"]);
  const validate = ajv.compile(schema);

  const issues: string[] = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const valid = validate(event);
    if (!valid) {
      const message = (validate.errors ?? [])
        .map(
          (error: { instancePath?: string; message?: string }) =>
            `${error.instancePath || "/"} ${error.message ?? "invalid"}`,
        )
        .join("; ");
      issues.push(`event[${i}] schema violation: ${message}`);
    }
    if (event.run_id !== input.run_id) {
      issues.push(`event[${i}] run_id mismatch: expected ${input.run_id}, got ${event.run_id}`);
    }
  }

  const summary = buildSummary(events, issues);
  return {
    run_id: input.run_id,
    valid: issues.length === 0,
    issues,
    summary,
  };
}
