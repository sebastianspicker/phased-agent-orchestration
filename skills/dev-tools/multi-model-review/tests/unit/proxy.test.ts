import { describe, it, expect } from "vitest";
import { buildReviewPrompt } from "../../src/lib/proxy.js";

describe("buildReviewPrompt", () => {
  it("produces a prompt containing required sections for design documents", () => {
    const prompt = buildReviewPrompt("design");

    expect(prompt).toContain("adversarial reviewer");
    expect(prompt).toContain("Design");
    expect(prompt).toContain("## Context");
    expect(prompt).toContain("## Instructions");
    expect(prompt).toContain("## Output Format");
    expect(prompt).toContain("correctness");
    expect(prompt).toContain("completeness");
    expect(prompt).toContain("consistency");
    expect(prompt).toContain("feasibility");
    expect(prompt).toContain("security");
    expect(prompt).toContain("performance");
    expect(prompt).toContain("JSON array");
  });

  it("produces a prompt for plan documents", () => {
    const prompt = buildReviewPrompt("plan");

    expect(prompt).toContain("Plan");
    expect(prompt).toContain("plan");
    expect(prompt).toContain("adversarial reviewer");
  });

  it("produces a prompt for implementation documents", () => {
    const prompt = buildReviewPrompt("implementation");

    expect(prompt).toContain("Implementation");
  });

  it("returns custom prompt when provided", () => {
    const custom = "You are a custom reviewer. Do your thing.";
    const prompt = buildReviewPrompt("design", custom);

    expect(prompt).toBe(custom);
  });

  it("includes severity levels in the output format", () => {
    const prompt = buildReviewPrompt("design");

    expect(prompt).toContain("critical");
    expect(prompt).toContain("high");
    expect(prompt).toContain("medium");
    expect(prompt).toContain("low");
    expect(prompt).toContain("info");
  });

  it("includes expected finding fields in the output format", () => {
    const prompt = buildReviewPrompt("design");

    expect(prompt).toContain('"id"');
    expect(prompt).toContain('"category"');
    expect(prompt).toContain('"description"');
    expect(prompt).toContain('"severity"');
    expect(prompt).toContain('"evidence"');
    expect(prompt).toContain('"suggestion"');
  });
});
