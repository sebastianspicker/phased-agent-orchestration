/**
 * Integration tests for the runner.mjs CLI — specifically the run-stage command.
 * These tests spawn runner.mjs as a subprocess to exercise the real entrypoint.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PHASE_ORDER } from "../../lib/constants.mjs";

const REPO_ROOT = resolve(import.meta.dirname, "../../..");
const RUNNER = join(REPO_ROOT, "scripts/pipeline/runner.mjs");
const PIPELINE_DIR = join(REPO_ROOT, ".pipeline");
const STATE_PATH = join(PIPELINE_DIR, "pipeline-state.json");

const TEST_RUN_ID = "runner-stage-test";

/** Snapshot the existing pipeline-state.json (if any) so we can restore it. */
let originalState = null;

function runRunner(args) {
  return spawnSync("node", [RUNNER, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    timeout: 15_000,
  });
}

function initState() {
  mkdirSync(PIPELINE_DIR, { recursive: true });
  const state = {
    run_id: TEST_RUN_ID,
    created_at: new Date().toISOString(),
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
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf8");
}

beforeAll(() => {
  if (existsSync(STATE_PATH)) {
    originalState = readFileSync(STATE_PATH, "utf8");
  }
  initState();
});

afterAll(() => {
  // Clean up the test run directory
  const runDir = join(PIPELINE_DIR, "runs", TEST_RUN_ID);
  rmSync(runDir, { recursive: true, force: true });

  // Restore original state or clean up
  if (originalState !== null) {
    writeFileSync(STATE_PATH, originalState, "utf8");
  } else {
    rmSync(STATE_PATH, { force: true });
  }
});

describe("runner.mjs CLI", () => {
  describe("--help", () => {
    it("exits 0 and prints usage", () => {
      const result = runRunner(["--help"]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("run-stage");
      expect(result.stdout).toContain("start-phase");
    });
  });

  describe("unknown command", () => {
    it("exits non-zero for unrecognized command", () => {
      const result = runRunner(["bogus-command"]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("unknown command");
    });
  });
});

describe("run-stage", () => {
  describe("input validation", () => {
    it("rejects unknown phase", () => {
      const result = runRunner([
        "run-stage",
        "--run-id", TEST_RUN_ID,
        "--phase", "nonexistent",
        "--config-id", "phased_default",
      ]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("unsupported phase");
    });

    it("rejects unknown config-id", () => {
      const result = runRunner([
        "run-stage",
        "--run-id", TEST_RUN_ID,
        "--phase", "arm",
        "--config-id", "bogus_config",
      ]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("unsupported config-id");
    });

    it("rejects missing run-id", () => {
      const result = runRunner([
        "run-stage",
        "--phase", "arm",
        "--config-id", "phased_default",
      ]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("run-id");
    });
  });

  describe("happy path: arm phase", () => {
    it("produces brief.json and arm-gate.json", () => {
      // Re-initialize state to ensure clean run
      initState();

      const result = runRunner([
        "run-stage",
        "--run-id", TEST_RUN_ID,
        "--phase", "arm",
        "--config-id", "phased_default",
      ]);

      // The runner writes JSON to stdout
      expect(result.stdout).toBeTruthy();
      const output = JSON.parse(result.stdout);
      expect(output.success).toBe(true);
      expect(output.run_id).toBe(TEST_RUN_ID);
      expect(output.phase).toBe("arm");
      expect(output.config_id).toBe("phased_default");
      expect(output.gate).toBeDefined();
      expect(output.gate.status).toMatch(/^(pass|warn)$/);

      // Verify artifact file was written
      const runDir = join(PIPELINE_DIR, "runs", TEST_RUN_ID);
      const briefPath = join(runDir, "brief.json");
      expect(existsSync(briefPath)).toBe(true);
      const brief = JSON.parse(readFileSync(briefPath, "utf8"));
      expect(brief.requirements).toBeDefined();
      expect(Array.isArray(brief.requirements)).toBe(true);

      // Verify gate file was written
      const gatesDir = join(runDir, "gates");
      const gatePath = join(gatesDir, "arm-gate.json");
      expect(existsSync(gatePath)).toBe(true);
      const gate = JSON.parse(readFileSync(gatePath, "utf8"));
      expect(gate.gate_id).toBe("arm-gate");
      expect(gate.phase).toBe("arm");

      // Verify trace file has events
      const tracePath = join(runDir, "trace.jsonl");
      expect(existsSync(tracePath)).toBe(true);
      const traceLines = readFileSync(tracePath, "utf8")
        .split("\n")
        .filter((l) => l.trim().length > 0);
      expect(traceLines.length).toBeGreaterThanOrEqual(2); // at least run_start + phase_start

      // Exit code should be 0 for a passing gate
      if (output.gate.status === "pass") {
        expect(result.status).toBe(0);
      }
    });
  });
});
