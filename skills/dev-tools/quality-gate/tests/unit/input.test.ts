import { describe, it, expect } from "vitest";
import type { Input } from "../../src/types.js";
import { validateInput } from "../../src/lib/input.js";

function makeInput(overrides: Partial<Input> = {}): Input {
  return {
    artifact: { summary: "ok" },
    schema_ref: "contracts/artifacts/brief.schema.json",
    phase: "arm",
    criteria: [{ name: "has-summary", type: "field-exists", path: "summary" }],
    ...overrides,
  };
}

describe("validateInput", () => {
  it("accepts valid pipeline phase values", () => {
    expect(() => validateInput(makeInput({ phase: "security-review" }))).not.toThrow();
  });

  it("rejects unknown phases", () => {
    const input = makeInput({ phase: "quality-gate" as Input["phase"] });
    expect(() => validateInput(input)).toThrow("phase must be a valid pipeline phase");
  });

  it("rejects missing criteria", () => {
    const input = makeInput({ criteria: undefined as unknown as Input["criteria"] });
    expect(() => validateInput(input)).toThrow("criteria must be an array");
  });

  it("rejects non-string artifact_ref values", () => {
    const input = makeInput({ artifact_ref: 123 as unknown as Input["artifact_ref"] });
    expect(() => validateInput(input)).toThrow("artifact_ref must be a string when provided");
  });
});
