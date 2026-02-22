import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateArtifact } from "../../src/lib/validate.js";

const testDir = join(tmpdir(), "quality-gate-test-validate");

function setup() {
  mkdirSync(testDir, { recursive: true });
}

function teardown() {
  rmSync(testDir, { recursive: true, force: true });
}

describe("validateArtifact", () => {
  it("returns valid for a conforming artifact", async () => {
    setup();
    const schemaPath = join(testDir, "schema.json");
    writeFileSync(
      schemaPath,
      JSON.stringify({
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
        },
      }),
    );

    const result = await validateArtifact({ title: "Hello" }, schemaPath);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    teardown();
  });

  it("returns errors for a non-conforming artifact", async () => {
    setup();
    const schemaPath = join(testDir, "schema.json");
    writeFileSync(
      schemaPath,
      JSON.stringify({
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        required: ["title", "version"],
        properties: {
          title: { type: "string" },
          version: { type: "number" },
        },
      }),
    );

    const result = await validateArtifact({ title: 123 } as unknown as Record<string, unknown>, schemaPath);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("title") || e.includes("version"))).toBe(true);
    teardown();
  });

  it("validates date-time and uri formats", async () => {
    setup();
    const schemaPath = join(testDir, "schema-formats.json");
    writeFileSync(
      schemaPath,
      JSON.stringify({
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        required: ["when", "url"],
        properties: {
          when: { type: "string", format: "date-time" },
          url: { type: "string", format: "uri" },
        },
      }),
    );

    const result = await validateArtifact({ when: "not-a-date", url: "not-a-url" }, schemaPath);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("date-time") || e.includes("uri"))).toBe(true);
    teardown();
  });

  it("returns an error when schema file is missing", async () => {
    const result = await validateArtifact({ title: "Hello" }, "/nonexistent/schema.json");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain("Failed to load schema");
  });
});
