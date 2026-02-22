import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectTrace } from "../../src/lib/trace.js";

describe("collectTrace", () => {
  it("validates events and aggregates summary", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-"));
    const schemaDir = join(workspaceRoot, "contracts", "artifacts");
    const traceDir = join(workspaceRoot, ".pipeline", "runs", "run-1");

    mkdirSync(schemaDir, { recursive: true });
    mkdirSync(traceDir, { recursive: true });

    const schema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      additionalProperties: true,
      required: ["ts", "run_id", "event", "phase"],
      properties: {
        ts: { type: "string" },
        run_id: { type: "string" },
        event: { type: "string" },
        phase: { type: "string" },
      },
    };
    writeFileSync(join(schemaDir, "execution-trace.schema.json"), JSON.stringify(schema), "utf8");

    const trace = [
      {
        ts: "2026-02-22T12:00:00Z",
        run_id: "run-1",
        event: "phase_start",
        phase: "design",
      },
      {
        ts: "2026-02-22T12:00:02Z",
        run_id: "run-1",
        event: "gate_result",
        phase: "design",
        status: "pass",
      },
      {
        ts: "2026-02-22T12:00:05Z",
        run_id: "run-1",
        event: "phase_end",
        phase: "design",
        tokens_in: 100,
        tokens_out: 50,
        cost_usd: 0.25,
      },
    ];

    writeFileSync(
      join(traceDir, "trace.jsonl"),
      trace.map((event) => JSON.stringify(event)).join("\n"),
      "utf8",
    );

    const logs: string[] = [];
    const result = await collectTrace(
      {
        run_id: "run-1",
        trace_path: ".pipeline/runs/run-1/trace.jsonl",
        schema_ref: "contracts/artifacts/execution-trace.schema.json",
      },
      logs,
      { workspaceRoot },
    );

    expect(result.valid).toBe(true);
    expect(result.summary.total_events).toBe(3);
    expect(result.summary.gate_results.pass).toBe(1);
    expect(result.summary.total_tokens_in).toBe(100);
    expect(result.summary.total_tokens_out).toBe(50);
    expect(result.summary.total_cost_usd).toBe(0.25);
    expect(result.summary.phase_durations_ms.design).toBe(5000);

    rmSync(workspaceRoot, { recursive: true, force: true });
  });

  it("reports unmatched phase starts/ends as issues", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-issue-"));
    const schemaDir = join(workspaceRoot, "contracts", "artifacts");
    mkdirSync(schemaDir, { recursive: true });
    writeFileSync(
      join(schemaDir, "execution-trace.schema.json"),
      JSON.stringify({
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        required: ["ts", "run_id", "event", "phase"],
        properties: {
          ts: { type: "string" },
          run_id: { type: "string" },
          event: { type: "string" },
          phase: { type: "string" },
        },
      }),
      "utf8",
    );

    const result = await collectTrace(
      {
        run_id: "run-2",
        schema_ref: "contracts/artifacts/execution-trace.schema.json",
        events: [
          {
            ts: "2026-02-22T12:00:00Z",
            run_id: "run-2",
            event: "phase_start",
            phase: "plan",
          },
        ],
      },
      [],
      { workspaceRoot },
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes("phase_start without matching phase_end"))).toBe(
      true,
    );

    rmSync(workspaceRoot, { recursive: true, force: true });
  });
});
