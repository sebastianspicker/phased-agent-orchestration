import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ensureRunDirs,
  getRepoRoot,
  getRunDir,
  toWorkspaceRelative,
  writeJson,
} from "./state.mjs";
import { badInput, badTrace } from "./errors.mjs";
import { SKILL_ENTRYPOINTS } from "../../lib/constants.mjs";
import { spawnSkillTool } from "./subprocess.mjs";

/** Maximum number of trace events allowed per run. */
export const MAX_TRACE_EVENTS = 10000;

/** Module-level trace event cache. */
let _traceCache = { runId: null, events: null };

/** Invalidate the trace event cache (exported for testing). */
export function invalidateTraceCache() {
  _traceCache = { runId: null, events: null };
}

export function nowIso() {
  return new Date().toISOString();
}

export function getTracePath(runId, root = getRepoRoot()) {
  return resolve(getRunDir(runId, root), "trace.jsonl");
}

export function ensureTraceFile(runId, root = getRepoRoot()) {
  ensureRunDirs(runId, root);
  const tracePath = getTracePath(runId, root);
  if (!existsSync(tracePath)) {
    writeFileSync(tracePath, "", "utf8");
  }
  return tracePath;
}

export function appendTraceEvent(runId, payload, root = getRepoRoot()) {
  if (!payload || typeof payload !== "object") {
    throw badInput("trace payload must be an object");
  }
  if (!payload.event) {
    throw badInput("trace payload requires event");
  }
  if (!payload.phase) {
    throw badInput("trace payload requires phase");
  }

  const event = {
    ts: payload.ts ?? nowIso(),
    run_id: runId,
    ...payload,
  };

  const tracePath = ensureTraceFile(runId, root);
  appendFileSync(tracePath, `${JSON.stringify(event)}\n`, "utf8");
  invalidateTraceCache();
  return event;
}

export function readTraceEvents(runId, root = getRepoRoot()) {
  const tracePath = ensureTraceFile(runId, root);
  const raw = readFileSync(tracePath, "utf8");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const events = [];
  const warnings = [];

  for (let idx = 0; idx < lines.length; idx++) {
    try {
      events.push(JSON.parse(lines[idx]));
    } catch (error) {
      warnings.push(`skipped corrupt trace JSONL at line ${idx + 1}: ${String(error)}`);
    }
  }

  if (warnings.length > 0 && process.env.DEBUG_ERROR_DETAILS) {
    for (const w of warnings) {
      process.stderr.write(`[trace] ${w}\n`);
    }
  }

  if (events.length > MAX_TRACE_EVENTS) {
    throw badTrace(
      `trace file exceeds MAX_TRACE_EVENTS (${MAX_TRACE_EVENTS}): found ${events.length} events`,
    );
  }

  return events;
}

/**
 * Return cached trace events for the given runId, reading from disk only on miss.
 */
export function getCachedTraceEvents(runId, root = getRepoRoot()) {
  if (_traceCache.runId === runId && _traceCache.events !== null) {
    return _traceCache.events;
  }
  const events = readTraceEvents(runId, root);
  _traceCache = { runId, events };
  return events;
}

export function hasEvent(runId, eventType, root = getRepoRoot()) {
  const events = getCachedTraceEvents(runId, root);
  return events.some((event) => event.event === eventType);
}

export function summarizeEventsLocal(events) {
  const phaseStarts = new Map();
  const phaseDurations = {};
  let totalCost = 0;
  let tokensIn = 0;
  let tokensOut = 0;

  for (const event of events) {
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
      }
    }

    if (typeof event.cost_usd === "number") totalCost += Math.max(0, event.cost_usd);
    if (typeof event.tokens_in === "number") tokensIn += Math.max(0, event.tokens_in);
    if (typeof event.tokens_out === "number") tokensOut += Math.max(0, event.tokens_out);
  }

  const totalDurationMs = Object.values(phaseDurations).reduce((acc, cur) => acc + cur, 0);

  return {
    total_events: events.length,
    total_cost_usd: Number(totalCost.toFixed(6)),
    total_tokens_in: tokensIn,
    total_tokens_out: tokensOut,
    total_duration_s: Number((totalDurationMs / 1000).toFixed(3)),
    phase_durations_ms: phaseDurations,
  };
}

function runTraceCollector(runId, root = getRepoRoot()) {
  return spawnSkillTool({
    entrypoint: SKILL_ENTRYPOINTS.trace_collector,
    input: {
      run_id: runId,
      trace_path: toWorkspaceRelative(getTracePath(runId, root), root),
    },
    root,
    toolName: "trace-collector",
  });
}

export function summarizeRun(runId, root = getRepoRoot()) {
  ensureRunDirs(runId, root);
  const traceData = runTraceCollector(runId, root);
  const summaryPath = resolve(getRunDir(runId, root), "trace.summary.json");
  const output = {
    run_id: traceData.run_id,
    valid: traceData.valid,
    issues: traceData.issues,
    ...traceData.summary,
  };
  writeJson(summaryPath, output);
  return output;
}
