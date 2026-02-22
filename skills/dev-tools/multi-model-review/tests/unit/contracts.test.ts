import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import type { Input } from "../../src/types.js";
import { runDriftDetect, runReview, validateInput } from "../../src/lib/engine.js";

function loadSchema(pathFromRepoRoot: string): Record<string, unknown> {
  const repoRoot = resolve(process.cwd(), "../../../");
  const fullPath = resolve(repoRoot, pathFromRepoRoot);
  return JSON.parse(readFileSync(fullPath, "utf8")) as Record<string, unknown>;
}

function validateWithSchema(schema: Record<string, unknown>, data: unknown): { valid: boolean; errors: unknown[] } {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: validate.errors ?? [] };
}

describe("contract integration", () => {
  it("review output conforms to contracts/artifacts/review-report.schema.json", () => {
    const input: Input = {
      action: { type: "review" },
      document: { content: "# Design\n- Must use JWT", type: "design" },
      reviewer_findings: [
        {
          reviewer_id: "architect-reviewer",
          role: "architect",
          findings: [
            {
              id: "a-1",
              category: "architecture",
              description: "Missing service boundary",
              severity: "high",
              evidence: "Single module contains orchestration + persistence logic",
              suggestion: "Split orchestrator and repository layers",
            },
          ],
        },
        {
          reviewer_id: "security-engineer",
          role: "security",
          findings: [
            {
              id: "s-1",
              category: "security",
              description: "JWT validation rules are underspecified",
              severity: "medium",
            },
          ],
        },
      ],
    };
    validateInput(input);
    const logs: string[] = [];
    const data = runReview(input, logs);
    const schema = loadSchema("contracts/artifacts/review-report.schema.json");
    const validated = validateWithSchema(schema, data);

    expect(validated.valid).toBe(true);
    expect(validated.errors).toEqual([]);
    expect(data.fact_checks.length).toBe(data.deduplicated_findings.length);
  });

  it("drift output conforms to contracts/artifacts/drift-report.schema.json", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "mmr-drift-contract-"));
    const targetPath = join(tempDir, "target.md");
    writeFileSync(targetPath, "# API\nREST only");

    const input: Input = {
      action: { type: "drift-detect" },
      document: {
        content: "# API\n- Must support GraphQL subscriptions",
        type: "plan",
      },
      drift_config: {
        source_ref: ".pipeline/runs/demo/plan.json",
        target_ref: targetPath,
      },
    };
    validateInput(input);
    const logs: string[] = [];
    const data = runDriftDetect(input, logs);
    const schema = loadSchema("contracts/artifacts/drift-report.schema.json");
    const validated = validateWithSchema(schema, data);

    expect(validated.valid).toBe(true);
    expect(validated.errors).toEqual([]);
    expect(data.adjudication.mode).toBe("heuristic");

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("dual-extractor drift mode resolves conflicts and matches drift contract", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "mmr-drift-dual-contract-"));
    const targetPath = join(tempDir, "target.md");
    writeFileSync(targetPath, "# API\nREST only");

    const input: Input = {
      action: { type: "drift-detect" },
      document: {
        content: "# API\n- Must support GraphQL subscriptions",
        type: "plan",
      },
      drift_config: {
        source_ref: ".pipeline/runs/demo/plan.json",
        target_ref: targetPath,
        mode: "dual-extractor",
        extractor_claim_sets: [
          {
            extractor: "extractor-a",
            claims: [
              {
                id: "claim-1",
                claim: "Must support GraphQL subscriptions",
                verification_status: "verified",
                evidence: "GraphQL service implementation found",
                confidence: 0.8,
              },
            ],
          },
          {
            extractor: "extractor-b",
            claims: [
              {
                id: "claim-1",
                claim: "Must support GraphQL subscriptions",
                verification_status: "violated",
                evidence: "Only REST endpoints documented",
                confidence: 0.9,
              },
            ],
          },
        ],
      },
    };

    validateInput(input);
    const data = runDriftDetect(input, []);
    const schema = loadSchema("contracts/artifacts/drift-report.schema.json");
    const validated = validateWithSchema(schema, data);

    expect(validated.valid).toBe(true);
    expect(validated.errors).toEqual([]);
    expect(data.adjudication.mode).toBe("dual-extractor");
    expect(data.adjudication.conflicts_resolved).toBeGreaterThan(0);
    expect(data.claims.some((claim) => claim.verification_status === "partial")).toBe(true);

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("rejects drift-detect without target_ref", () => {
    const input: Input = {
      action: { type: "drift-detect" },
      document: {
        content: "# API\n- Must support GraphQL subscriptions",
        type: "plan",
      },
      drift_config: {},
    };

    expect(() => validateInput(input)).toThrow("drift_config.target_ref is required");
  });

  it("fails drift-detect when target_ref cannot be read", () => {
    const input: Input = {
      action: { type: "drift-detect" },
      document: {
        content: "# API\n- Must support GraphQL subscriptions",
        type: "plan",
      },
      drift_config: {
        target_ref: "/definitely/missing/file.md",
      },
    };
    validateInput(input);

    expect(() => runDriftDetect(input, [])).toThrow("Could not read target_ref");
  });

  it("rejects dual-extractor mode without extractor claim sets", () => {
    const input: Input = {
      action: { type: "drift-detect" },
      document: {
        content: "# API\n- Must support GraphQL subscriptions",
        type: "plan",
      },
      drift_config: {
        mode: "dual-extractor",
        target_ref: "/tmp/placeholder.md",
      },
    };

    expect(() => validateInput(input)).toThrow("extractor_claim_sets");
  });
});
