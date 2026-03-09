import { describe, it, expect } from "vitest";
import { PHASE_ORDER } from "../../lib/constants.mjs";
import {
  phaseArtifactDefaults,
  DEFAULT_SCHEMA_BY_PHASE,
} from "../lib/artifacts.mjs";

describe("phaseArtifactDefaults", () => {
  it("returns correct defaults for arm", () => {
    const { artifactRef, schemaRef } = phaseArtifactDefaults("arm");
    expect(artifactRef).toBe("brief.json");
    expect(schemaRef).toBe("contracts/artifacts/brief.schema.json");
  });

  it("returns correct defaults for design", () => {
    const { artifactRef, schemaRef } = phaseArtifactDefaults("design");
    expect(artifactRef).toBe("design.json");
    expect(schemaRef).toContain("design-document");
  });

  it("returns correct defaults for plan", () => {
    const { artifactRef, schemaRef } = phaseArtifactDefaults("plan");
    expect(artifactRef).toBe("plan.json");
    expect(schemaRef).toContain("execution-plan");
  });

  it("returns null schemaRef for build phase", () => {
    const { artifactRef, schemaRef } = phaseArtifactDefaults("build");
    expect(artifactRef).toBe("build.json");
    expect(schemaRef).toBeNull();
  });

  it("returns null artifactRef for post-build phase", () => {
    const { artifactRef, schemaRef } = phaseArtifactDefaults("post-build");
    expect(artifactRef).toBeNull();
    expect(schemaRef).toBeNull();
  });

  it("handles all phases in PHASE_ORDER without throwing", () => {
    for (const phase of PHASE_ORDER) {
      expect(() => phaseArtifactDefaults(phase)).not.toThrow();
    }
  });

  it("throws for unknown phases", () => {
    expect(() => phaseArtifactDefaults("nonexistent")).toThrow(/unknown phase/i);
    expect(() => phaseArtifactDefaults("")).toThrow(/unknown phase/i);
  });
});

describe("DEFAULT_SCHEMA_BY_PHASE", () => {
  it("has schema entries for phases that need them", () => {
    expect(DEFAULT_SCHEMA_BY_PHASE["arm"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["design"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["adversarial-review"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["plan"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["pmatch"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["quality-static"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["quality-tests"]).toBeDefined();
    expect(DEFAULT_SCHEMA_BY_PHASE["release-readiness"]).toBeDefined();
  });

  it("all schema paths point to contracts/artifacts/", () => {
    for (const [phase, schemaPath] of Object.entries(DEFAULT_SCHEMA_BY_PHASE)) {
      expect(schemaPath).toMatch(/^contracts\/artifacts\/.+\.schema\.json$/);
    }
  });
});
