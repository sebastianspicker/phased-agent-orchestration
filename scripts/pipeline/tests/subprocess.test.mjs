import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolve } from "node:path";

// We test spawnSkillTool by mocking child_process.spawnSync
// and fs.existsSync to control subprocess behavior.

let spawnSyncMock;
let existsSyncOriginal;

describe("spawnSkillTool", () => {
  let spawnSkillTool;
  const toolOpts = {
    entrypoint: "skills/dev-tools/quality-gate/dist/index.js",
    input: { test: true },
    toolName: "quality-gate",
  };

  beforeEach(async () => {
    // Dynamic import to get a fresh module each time isn't practical with ESM,
    // so we mock at the child_process level.
    vi.mock("node:child_process", () => ({
      spawnSync: (...args) => spawnSyncMock(...args),
    }));
    vi.mock("node:fs", async (importOriginal) => {
      const orig = await importOriginal();
      return {
        ...orig,
        existsSync: (p) => {
          // Always say the entrypoint exists
          if (typeof p === "string" && p.includes("dist/index.js")) return true;
          return orig.existsSync(p);
        },
      };
    });

    const mod = await import("../lib/subprocess.mjs");
    spawnSkillTool = mod.spawnSkillTool;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed data on success", () => {
    spawnSyncMock = () => ({
      stdout: JSON.stringify({ success: true, data: { result: "ok" } }),
      stderr: "",
      status: 0,
      signal: null,
      error: null,
    });

    const result = spawnSkillTool(toolOpts);
    expect(result).toEqual({ result: "ok" });
  });

  it("throws on timeout with clear message", () => {
    spawnSyncMock = () => ({
      stdout: "",
      stderr: "",
      status: null,
      signal: null,
      error: Object.assign(new Error("timed out"), { code: "ETIMEDOUT" }),
    });

    expect(() => spawnSkillTool(toolOpts)).toThrow(/timed out/i);
    try {
      spawnSkillTool(toolOpts);
    } catch (err) {
      expect(err.code).toBe("E_QUALITY_GATE_TIMEOUT");
    }
  });

  it("throws on signal termination with signal name", () => {
    spawnSyncMock = () => ({
      stdout: "",
      stderr: "",
      status: null,
      signal: "SIGKILL",
      error: null,
    });

    expect(() => spawnSkillTool(toolOpts)).toThrow(/SIGKILL/);
    try {
      spawnSkillTool(toolOpts);
    } catch (err) {
      expect(err.code).toBe("E_QUALITY_GATE_SIGNAL");
    }
  });

  it("throws on spawn error with spawn code", () => {
    spawnSyncMock = () => ({
      stdout: "",
      stderr: "",
      status: null,
      signal: null,
      error: Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
    });

    expect(() => spawnSkillTool(toolOpts)).toThrow(/failed to spawn/i);
    try {
      spawnSkillTool(toolOpts);
    } catch (err) {
      expect(err.code).toBe("E_QUALITY_GATE_SPAWN");
    }
  });

  it("throws on empty output", () => {
    spawnSyncMock = () => ({
      stdout: "",
      stderr: "",
      status: 0,
      signal: null,
      error: null,
    });

    expect(() => spawnSkillTool(toolOpts)).toThrow(/empty output/i);
  });

  it("throws on invalid JSON output", () => {
    spawnSyncMock = () => ({
      stdout: "not json",
      stderr: "",
      status: 0,
      signal: null,
      error: null,
    });

    expect(() => spawnSkillTool(toolOpts)).toThrow(/invalid JSON/i);
  });

  it("throws on non-zero exit with error message from tool", () => {
    spawnSyncMock = () => ({
      stdout: JSON.stringify({ success: false, error: { message: "validation failed", code: "E_VALIDATE" } }),
      stderr: "",
      status: 1,
      signal: null,
      error: null,
    });

    expect(() => spawnSkillTool(toolOpts)).toThrow(/validation failed/);
  });

  it("preserves both tool error code and outer toolError code when tool returns custom code", () => {
    spawnSyncMock = () => ({
      stdout: JSON.stringify({ success: false, error: { message: "schema invalid", code: "E_SCHEMA_INVALID" } }),
      stderr: "",
      status: 1,
      signal: null,
      error: null,
    });

    try {
      spawnSkillTool(toolOpts);
      expect.unreachable("should have thrown");
    } catch (err) {
      // .code should be the tool-provided code (for ERROR_HINTS compatibility)
      expect(err.code).toBe("E_SCHEMA_INVALID");
      // .outerCode should preserve the original E_TOOL_FAILED code
      expect(err.outerCode).toBe("E_QUALITY_GATE_FAILED");
    }
  });

  it("falls back to stderr when stdout is empty", () => {
    spawnSyncMock = () => ({
      stdout: "",
      stderr: JSON.stringify({ success: true, data: { from: "stderr" } }),
      status: 0,
      signal: null,
      error: null,
    });

    const result = spawnSkillTool(toolOpts);
    expect(result).toEqual({ from: "stderr" });
  });
});
