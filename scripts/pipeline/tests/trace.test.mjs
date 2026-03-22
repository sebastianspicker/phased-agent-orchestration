import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendTraceEvent,
  readTraceEvents,
  ensureTraceFile,
  summarizeEventsLocal,
  MAX_TRACE_EVENTS,
  getTracePath,
} from "../lib/trace.mjs";
import { getRunDir, getRepoRoot, ensureRunDirs } from "../lib/state.mjs";

const root = getRepoRoot();
const testRunId = "test-trace-unit";

describe("appendTraceEvent and readTraceEvents", () => {
  beforeEach(() => {
    const runDir = getRunDir(testRunId, root);
    mkdirSync(resolve(runDir, "gates"), { recursive: true });
  });

  afterEach(() => {
    const runDir = getRunDir(testRunId, root);
    if (existsSync(runDir)) {
      rmSync(runDir, { recursive: true, force: true });
    }
  });

  it("appends and reads trace events", () => {
    appendTraceEvent(testRunId, {
      event: "phase_start",
      phase: "arm",
      status: "ok",
    });

    const events = readTraceEvents(testRunId);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("phase_start");
    expect(events[0].phase).toBe("arm");
    expect(events[0].run_id).toBe(testRunId);
    expect(events[0].ts).toBeDefined();
  });

  it("appends multiple events", () => {
    appendTraceEvent(testRunId, { event: "phase_start", phase: "arm" });
    appendTraceEvent(testRunId, { event: "phase_end", phase: "arm", status: "ok" });

    const events = readTraceEvents(testRunId);
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe("phase_start");
    expect(events[1].event).toBe("phase_end");
  });

  it("rejects payload without event field", () => {
    expect(() => appendTraceEvent(testRunId, { phase: "arm" })).toThrow(/requires event/);
  });

  it("rejects payload without phase field", () => {
    expect(() => appendTraceEvent(testRunId, { event: "phase_start" })).toThrow(/requires phase/);
  });

  it("rejects non-object payload", () => {
    expect(() => appendTraceEvent(testRunId, "string")).toThrow(/must be an object/);
    expect(() => appendTraceEvent(testRunId, null)).toThrow(/must be an object/);
  });
});

describe("ensureTraceFile", () => {
  const ensureRunId = "test-ensure-trace";

  afterEach(() => {
    const runDir = getRunDir(ensureRunId, root);
    if (existsSync(runDir)) {
      rmSync(runDir, { recursive: true, force: true });
    }
  });

  it("creates trace file if it does not exist", () => {
    const tracePath = ensureTraceFile(ensureRunId);
    expect(existsSync(tracePath)).toBe(true);
    expect(readFileSync(tracePath, "utf8")).toBe("");
  });
});

describe("summarizeEventsLocal", () => {
  it("returns zeroed summary for empty events", () => {
    const summary = summarizeEventsLocal([]);
    expect(summary.total_events).toBe(0);
    expect(summary.total_cost_usd).toBe(0);
    expect(summary.total_tokens_in).toBe(0);
    expect(summary.total_tokens_out).toBe(0);
    expect(summary.total_duration_s).toBe(0);
  });

  it("computes phase durations from start/end pairs", () => {
    const events = [
      { event: "phase_start", phase: "arm", ts: "2026-01-01T00:00:00.000Z" },
      { event: "phase_end", phase: "arm", ts: "2026-01-01T00:00:05.000Z" },
    ];
    const summary = summarizeEventsLocal(events);
    expect(summary.total_duration_s).toBe(5);
    expect(summary.phase_durations_ms.arm).toBe(5000);
  });

  it("accumulates token and cost totals", () => {
    const events = [
      { event: "agent_call", phase: "arm", tokens_in: 100, tokens_out: 50, cost_usd: 0.01 },
      { event: "agent_call", phase: "arm", tokens_in: 200, tokens_out: 75, cost_usd: 0.02 },
    ];
    const summary = summarizeEventsLocal(events);
    expect(summary.total_tokens_in).toBe(300);
    expect(summary.total_tokens_out).toBe(125);
    expect(summary.total_cost_usd).toBeCloseTo(0.03);
  });

  it("ignores negative cost and token values", () => {
    const events = [
      { event: "agent_call", phase: "arm", tokens_in: -10, cost_usd: -1 },
    ];
    const summary = summarizeEventsLocal(events);
    expect(summary.total_tokens_in).toBe(0);
    expect(summary.total_cost_usd).toBe(0);
  });
});

describe("readTraceEvents with corrupt JSONL", () => {
  const corruptRunId = "test-trace-corrupt";

  beforeEach(() => {
    ensureRunDirs(corruptRunId, root);
  });

  afterEach(() => {
    const runDir = getRunDir(corruptRunId, root);
    if (existsSync(runDir)) {
      rmSync(runDir, { recursive: true, force: true });
    }
  });

  it("skips corrupt JSONL lines and returns only valid events", () => {
    const tracePath = getTracePath(corruptRunId, root);
    const content = [
      JSON.stringify({ ts: "2026-01-01T00:00:00.000Z", run_id: corruptRunId, event: "phase_start", phase: "arm" }),
      "NOT VALID JSON {{{",
      "",
      JSON.stringify({ ts: "2026-01-01T00:00:01.000Z", run_id: corruptRunId, event: "phase_end", phase: "arm", status: "ok" }),
      "also broken",
    ].join("\n");
    writeFileSync(tracePath, content, "utf8");

    const events = readTraceEvents(corruptRunId, root);
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe("phase_start");
    expect(events[1].event).toBe("phase_end");
  });
});

describe("readTraceEvents MAX_TRACE_EVENTS limit", () => {
  const overflowRunId = "test-trace-overflow";

  beforeEach(() => {
    ensureRunDirs(overflowRunId, root);
  });

  afterEach(() => {
    const runDir = getRunDir(overflowRunId, root);
    if (existsSync(runDir)) {
      rmSync(runDir, { recursive: true, force: true });
    }
  });

  it("throws when events exceed MAX_TRACE_EVENTS", () => {
    expect(MAX_TRACE_EVENTS).toBe(10000);

    const tracePath = getTracePath(overflowRunId, root);
    const event = JSON.stringify({ ts: "2026-01-01T00:00:00.000Z", run_id: overflowRunId, event: "phase_start", phase: "arm" });
    // Write MAX_TRACE_EVENTS + 1 lines
    const lines = new Array(MAX_TRACE_EVENTS + 1).fill(event).join("\n") + "\n";
    writeFileSync(tracePath, lines, "utf8");

    expect(() => readTraceEvents(overflowRunId, root)).toThrow(/exceeds MAX_TRACE_EVENTS/);
  });
});
