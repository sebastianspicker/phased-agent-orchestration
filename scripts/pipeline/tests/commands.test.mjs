import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import {
  runStartPhase,
  runEndPhase,
  runRecordArtifact,
  runRecordGate,
  printUsage,
} from "../lib/commands.mjs";
import { getRunDir, ensureRunDirs, loadPipelineState, savePipelineState } from "../lib/state.mjs";
import { ensureTraceFile, readTraceEvents } from "../lib/trace.mjs";
import { badInput } from "../lib/errors.mjs";
import { PHASE_ORDER } from "../../lib/constants.mjs";

const TEST_RUN_ID = "commands-test-run";

function makeCtx() {
  return {
    requireOption(options, key) {
      const value = options[key];
      if (value === undefined || value === null || value === "") {
        throw badInput(`missing required option --${key}`);
      }
      return value;
    },
    assertKnownPhase(phase, source = "phase") {
      if (!PHASE_ORDER.includes(phase)) {
        throw badInput(`${source} must be one of: ${PHASE_ORDER.join(", ")}`);
      }
    },
    ensureStateForRun(state, runId) {
      if (state.run_id !== runId) {
        state.run_id = runId;
      }
    },
    appendRunStartIfMissing(runId) {
      ensureTraceFile(runId);
    },
    appendRunEndIfMissing(runId) {
      ensureTraceFile(runId);
    },
  };
}

function initTestState() {
  const state = {
    run_id: TEST_RUN_ID,
    current_phase: "arm",
    phase_order: PHASE_ORDER,
    completed_gates: [],
    artifacts: {
      brief: null,
      design: null,
      review: null,
      plan: null,
      build: null,
      post_build: null,
      release_readiness: null,
      drift_reports: [],
      quality_reports: [],
    },
    config: {},
  };
  savePipelineState(state);
  return state;
}

describe("runStartPhase", () => {
  let stdoutSpy;

  beforeEach(() => {
    ensureRunDirs(TEST_RUN_ID);
    initTestState();
    ensureTraceFile(TEST_RUN_ID);
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    const runDir = getRunDir(TEST_RUN_ID);
    rmSync(runDir, { recursive: true, force: true });
  });

  it("emits phase_start trace event and outputs JSON", () => {
    runStartPhase({ "run-id": TEST_RUN_ID, phase: "arm" }, makeCtx());

    const events = readTraceEvents(TEST_RUN_ID);
    const phaseStart = events.find((e) => e.event === "phase_start" && e.phase === "arm");
    expect(phaseStart).toBeDefined();
    expect(phaseStart.status).toBe("ok");

    expect(stdoutSpy).toHaveBeenCalled();
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.success).toBe(true);
    expect(output.phase).toBe("arm");
  });

  it("updates pipeline state current_phase", () => {
    runStartPhase({ "run-id": TEST_RUN_ID, phase: "design" }, makeCtx());

    const state = loadPipelineState();
    expect(state.current_phase).toBe("design");
  });

  it("throws for unknown phase", () => {
    expect(() => runStartPhase({ "run-id": TEST_RUN_ID, phase: "nonexistent" }, makeCtx())).toThrow();
  });

  it("throws for missing run-id", () => {
    expect(() => runStartPhase({ phase: "arm" }, makeCtx())).toThrow(/run-id/);
  });
});

describe("runEndPhase", () => {
  let stdoutSpy;

  beforeEach(() => {
    ensureRunDirs(TEST_RUN_ID);
    initTestState();
    ensureTraceFile(TEST_RUN_ID);
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    const runDir = getRunDir(TEST_RUN_ID);
    rmSync(runDir, { recursive: true, force: true });
  });

  it("emits phase_end trace event", () => {
    runEndPhase({ "run-id": TEST_RUN_ID, phase: "arm" }, makeCtx());

    const events = readTraceEvents(TEST_RUN_ID);
    const phaseEnd = events.find((e) => e.event === "phase_end" && e.phase === "arm");
    expect(phaseEnd).toBeDefined();
    expect(phaseEnd.status).toBe("ok");
  });

  it("accepts error status", () => {
    runEndPhase({ "run-id": TEST_RUN_ID, phase: "arm", status: "error" }, makeCtx());

    const events = readTraceEvents(TEST_RUN_ID);
    const phaseEnd = events.find((e) => e.event === "phase_end");
    expect(phaseEnd.status).toBe("error");
  });

  it("rejects invalid status", () => {
    expect(() => runEndPhase({ "run-id": TEST_RUN_ID, phase: "arm", status: "bad" }, makeCtx())).toThrow(/status/);
  });
});

describe("runRecordArtifact", () => {
  let stdoutSpy;

  beforeEach(() => {
    ensureRunDirs(TEST_RUN_ID);
    initTestState();
    ensureTraceFile(TEST_RUN_ID);
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    const runDir = getRunDir(TEST_RUN_ID);
    rmSync(runDir, { recursive: true, force: true });
  });

  it("records artifact_write event by default", () => {
    runRecordArtifact({ "run-id": TEST_RUN_ID, phase: "arm", "artifact-ref": "brief.json" }, makeCtx());

    const events = readTraceEvents(TEST_RUN_ID);
    const write = events.find((e) => e.event === "artifact_write");
    expect(write).toBeDefined();
    expect(write.artifact_ref).toBe("brief.json");
  });

  it("records artifact_read event when action is read", () => {
    runRecordArtifact({ "run-id": TEST_RUN_ID, phase: "arm", "artifact-ref": "brief.json", action: "read" }, makeCtx());

    const events = readTraceEvents(TEST_RUN_ID);
    const read = events.find((e) => e.event === "artifact_read");
    expect(read).toBeDefined();
  });

  it("rejects invalid action", () => {
    expect(() =>
      runRecordArtifact({ "run-id": TEST_RUN_ID, phase: "arm", "artifact-ref": "brief.json", action: "delete" }, makeCtx()),
    ).toThrow(/action/);
  });
});

describe("runRecordGate", () => {
  let stdoutSpy;

  beforeEach(() => {
    ensureRunDirs(TEST_RUN_ID);
    initTestState();
    ensureTraceFile(TEST_RUN_ID);
    stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    const runDir = getRunDir(TEST_RUN_ID);
    rmSync(runDir, { recursive: true, force: true });
  });

  it("emits gate with pass status", () => {
    runRecordGate({ "run-id": TEST_RUN_ID, phase: "arm", status: "pass" }, makeCtx());

    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.success).toBe(true);
    expect(output.gate.status).toBe("pass");
    expect(output.gate.gate_id).toBe("arm-gate");
  });

  it("emits gate with fail status and blocking failures", () => {
    runRecordGate({ "run-id": TEST_RUN_ID, phase: "arm", status: "fail" }, makeCtx());

    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.gate.status).toBe("fail");
    expect(output.gate.blocking_failures).toContain("arm-gate");
  });

  it("uses custom gate-id when provided", () => {
    runRecordGate({ "run-id": TEST_RUN_ID, phase: "arm", status: "pass", "gate-id": "custom-gate" }, makeCtx());

    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.gate.gate_id).toBe("custom-gate");
  });

  it("rejects invalid status", () => {
    expect(() => runRecordGate({ "run-id": TEST_RUN_ID, phase: "arm", status: "invalid" }, makeCtx())).toThrow(/status/);
  });
});

describe("printUsage", () => {
  it("outputs usage text", () => {
    const spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    try {
      printUsage();
      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain("run-stage");
      expect(output).toContain("start-phase");
      expect(output).toContain("summarize-run");
    } finally {
      spy.mockRestore();
    }
  });
});
