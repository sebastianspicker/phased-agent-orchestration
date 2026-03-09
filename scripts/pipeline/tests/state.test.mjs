import { describe, it, expect } from "vitest";
import {
  phaseToArtifactKey,
  getRunDir,
  gateFileNameForPhase,
  parseBooleanFlag,
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
