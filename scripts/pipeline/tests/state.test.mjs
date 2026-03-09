import { describe, it, expect } from "vitest";
import { existsSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import {
  phaseToArtifactKey,
  getRunDir,
  getRepoRoot,
  gateFileNameForPhase,
  parseBooleanFlag,
  readJson,
  readJsonStrict,
} from "../lib/state.mjs";

describe("phaseToArtifactKey", () => {
  it("maps arm to brief", () => {
    expect(phaseToArtifactKey("arm")).toBe("brief");
  });

  it("maps design to design", () => {
    expect(phaseToArtifactKey("design")).toBe("design");
  });

  it("maps adversarial-review to review", () => {
    expect(phaseToArtifactKey("adversarial-review")).toBe("review");
  });

  it("maps plan to plan", () => {
    expect(phaseToArtifactKey("plan")).toBe("plan");
  });

  it("maps pmatch to drift_reports", () => {
    expect(phaseToArtifactKey("pmatch")).toBe("drift_reports");
  });

  it("maps build to build", () => {
    expect(phaseToArtifactKey("build")).toBe("build");
  });

  it("maps release-readiness to release_readiness", () => {
    expect(phaseToArtifactKey("release-readiness")).toBe("release_readiness");
  });

  it("maps post-build to post_build", () => {
    expect(phaseToArtifactKey("post-build")).toBe("post_build");
  });

  it("maps quality-static to quality_reports", () => {
    expect(phaseToArtifactKey("quality-static")).toBe("quality_reports");
  });

  it("maps quality-tests to quality_reports", () => {
    expect(phaseToArtifactKey("quality-tests")).toBe("quality_reports");
  });

  it("maps security-review to quality_reports", () => {
    expect(phaseToArtifactKey("security-review")).toBe("quality_reports");
  });

  it("maps denoise to quality_reports", () => {
    expect(phaseToArtifactKey("denoise")).toBe("quality_reports");
  });

  it("returns null for unknown phase", () => {
    expect(phaseToArtifactKey("nonexistent")).toBeNull();
  });
});

describe("getRunDir", () => {
  it("rejects empty run_id", () => {
    expect(() => getRunDir("")).toThrow(/run_id is required/);
  });

  it("rejects null run_id", () => {
    expect(() => getRunDir(null)).toThrow(/run_id is required/);
  });

  it("rejects run_id with path separators", () => {
    expect(() => getRunDir("../escape")).toThrow();
  });

  it("rejects run_id with special characters", () => {
    expect(() => getRunDir("id with spaces")).toThrow();
  });

  it("accepts valid UUID run_id", () => {
    const dir = getRunDir("abc-123-def");
    expect(dir).toContain("abc-123-def");
  });
});

describe("gateFileNameForPhase", () => {
  it("returns postbuild-gate.json for post-build", () => {
    expect(gateFileNameForPhase("post-build")).toBe("postbuild-gate.json");
  });

  it("returns phase-gate.json for other phases", () => {
    expect(gateFileNameForPhase("arm")).toBe("arm-gate.json");
    expect(gateFileNameForPhase("plan")).toBe("plan-gate.json");
  });
});

describe("parseBooleanFlag", () => {
  it("returns true for boolean true", () => {
    expect(parseBooleanFlag(true)).toBe(true);
  });

  it("returns false for boolean false", () => {
    expect(parseBooleanFlag(false)).toBe(false);
  });

  it("parses string 'true' as true", () => {
    expect(parseBooleanFlag("true")).toBe(true);
    expect(parseBooleanFlag("1")).toBe(true);
    expect(parseBooleanFlag("yes")).toBe(true);
  });

  it("parses string 'false' as false", () => {
    expect(parseBooleanFlag("false")).toBe(false);
    expect(parseBooleanFlag("0")).toBe(false);
    expect(parseBooleanFlag("no")).toBe(false);
  });

  it("returns false for undefined/null", () => {
    expect(parseBooleanFlag(undefined)).toBe(false);
    expect(parseBooleanFlag(null)).toBe(false);
  });
});

describe("readJson", () => {
  it("returns fallback for non-existent file", () => {
    expect(readJson("/tmp/nonexistent-test-file.json")).toBeNull();
    expect(readJson("/tmp/nonexistent-test-file.json", { default: true })).toEqual({ default: true });
  });

  it("parses valid JSON file", () => {
    const path = "/tmp/test-readjson-valid.json";
    writeFileSync(path, '{"key": "value"}', "utf8");
    try {
      expect(readJson(path)).toEqual({ key: "value" });
    } finally {
      rmSync(path, { force: true });
    }
  });

  it("throws on malformed JSON", () => {
    const path = "/tmp/test-readjson-invalid.json";
    writeFileSync(path, "{broken json", "utf8");
    try {
      expect(() => readJson(path)).toThrow(/failed to parse JSON/);
    } finally {
      rmSync(path, { force: true });
    }
  });
});

describe("readJsonStrict", () => {
  it("throws for non-existent file", () => {
    expect(() => readJsonStrict("/tmp/nonexistent-strict.json")).toThrow(/file not found/);
  });

  it("throws on malformed JSON with context", () => {
    const path = "/tmp/test-readjsonstrict-invalid.json";
    writeFileSync(path, "not json", "utf8");
    try {
      expect(() => readJsonStrict(path, "test artifact")).toThrow(/test artifact/);
    } finally {
      rmSync(path, { force: true });
    }
  });

  it("returns parsed JSON for valid file", () => {
    const path = "/tmp/test-readjsonstrict-valid.json";
    writeFileSync(path, '{"ok": true}', "utf8");
    try {
      expect(readJsonStrict(path)).toEqual({ ok: true });
    } finally {
      rmSync(path, { force: true });
    }
  });
});
