import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ensureRunDirs,
  getRepoRoot,
  getRunDir,
  toWorkspaceRelative,
  writeJson,
} from "./state.mjs";

function badInput(message) {
  const err = new Error(message);
  err.code = "E_BAD_INPUT";
  return err;
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
  return event;
}

export function readTraceEvents(runId, root = getRepoRoot()) {
  const tracePath = ensureTraceFile(runId, root);
  const raw = readFileSync(tracePath, "utf8");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, idx) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      const err = new Error(`invalid trace JSONL at line ${idx + 1}: ${String(error)}`);
      err.code = "E_BAD_TRACE";
      throw err;
    }
  });
}

export function hasEvent(runId, eventType, root = getRepoRoot()) {
  const events = readTraceEvents(runId, root);
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
  const collectorEntry = resolve(root, "skills/dev-tools/trace-collector/dist/index.js");
  if (!existsSync(collectorEntry)) {
    const err = new Error(
      "trace-collector dist entrypoint missing. Run npm run build in skills/dev-tools/trace-collector.",
    );
    err.code = "E_COLLECTOR_MISSING";
    throw err;
  }

  const input = {
    run_id: runId,
    trace_path: toWorkspaceRelative(getTracePath(runId, root), root),
  };

  const proc = spawnSync("node", [collectorEntry], {
    cwd: root,
    input: JSON.stringify(input),
    encoding: "utf8",
    env: {
      ...process.env,
      WORKSPACE_ROOT: root,
    },
  });

  const rawOut = proc.stdout || proc.stderr;
  if (!rawOut) {
    const err = new Error("trace-collector returned empty output");
    err.code = "E_COLLECTOR_EMPTY";
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawOut);
  } catch (error) {
    const err = new Error(`trace-collector returned invalid JSON: ${String(error)}`);
    err.code = "E_COLLECTOR_PARSE";
    throw err;
  }

  if (proc.status !== 0 || !parsed.success) {
    const msg = parsed?.error?.message || rawOut;
    const err = new Error(`trace-collector failed: ${msg}`);
    err.code = parsed?.error?.code || "E_COLLECTOR_FAILED";
    throw err;
  }

  return parsed.data;
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
