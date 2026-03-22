import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
    expect(result.summary.total_duration_s).toBe(5);
    expect(result.summary.summed_phase_duration_s).toBe(result.summary.total_duration_s);

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

  it("rejects trace_path symlinks that resolve outside workspaceRoot", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-symlink-trace-"));
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

    const outsideRoot = mkdtempSync(join(tmpdir(), "trace-collector-outside-trace-"));
    const outsideTrace = join(outsideRoot, "trace.jsonl");
    writeFileSync(
      outsideTrace,
      JSON.stringify({
        ts: "2026-02-22T12:00:00Z",
        run_id: "run-3",
        event: "phase_start",
        phase: "arm",
      }),
      "utf8",
    );

    const symlinkPath = join(workspaceRoot, "trace-link.jsonl");
    try {
      symlinkSync(outsideTrace, symlinkPath);
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "EPERM") {
        rmSync(workspaceRoot, { recursive: true, force: true });
        rmSync(outsideRoot, { recursive: true, force: true });
        return;
      }
      throw err;
    }

    await expect(
      collectTrace(
        {
          run_id: "run-3",
          trace_path: "trace-link.jsonl",
          schema_ref: "contracts/artifacts/execution-trace.schema.json",
        },
        [],
        { workspaceRoot },
      ),
    ).rejects.toThrow("Path must resolve within workspace root");

    rmSync(workspaceRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  });

  it("rejects schema_ref symlinks that resolve outside workspaceRoot", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-symlink-schema-"));
    const traceDir = join(workspaceRoot, ".pipeline", "runs", "run-4");
    mkdirSync(traceDir, { recursive: true });
    writeFileSync(
      join(traceDir, "trace.jsonl"),
      JSON.stringify({
        ts: "2026-02-22T12:00:00Z",
        run_id: "run-4",
        event: "phase_start",
        phase: "arm",
      }),
      "utf8",
    );

    const outsideRoot = mkdtempSync(join(tmpdir(), "trace-collector-outside-schema-"));
    const outsideSchema = join(outsideRoot, "execution-trace.schema.json");
    writeFileSync(
      outsideSchema,
      JSON.stringify({
        type: "object",
      }),
      "utf8",
    );

    const contractsDir = join(workspaceRoot, "contracts", "artifacts");
    mkdirSync(contractsDir, { recursive: true });
    const symlinkSchema = join(contractsDir, "execution-trace.schema.json");
    try {
      symlinkSync(outsideSchema, symlinkSchema);
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "EPERM") {
        rmSync(workspaceRoot, { recursive: true, force: true });
        rmSync(outsideRoot, { recursive: true, force: true });
        return;
      }
      throw err;
    }

    await expect(
      collectTrace(
        {
          run_id: "run-4",
          trace_path: ".pipeline/runs/run-4/trace.jsonl",
          schema_ref: "contracts/artifacts/execution-trace.schema.json",
        },
        [],
        { workspaceRoot },
      ),
    ).rejects.toThrow("Path must resolve within workspace root");

    rmSync(workspaceRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  });

  it("computes total_wall_clock_s from run_start and run_end events", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-wallclock-"));
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
        run_id: "run-wc",
        schema_ref: "contracts/artifacts/execution-trace.schema.json",
        events: [
          {
            ts: "2026-02-22T12:00:00Z",
            run_id: "run-wc",
            event: "run_start",
            phase: "",
          },
          {
            ts: "2026-02-22T12:00:01Z",
            run_id: "run-wc",
            event: "phase_start",
            phase: "design",
          },
          {
            ts: "2026-02-22T12:00:04Z",
            run_id: "run-wc",
            event: "phase_end",
            phase: "design",
          },
          {
            ts: "2026-02-22T12:00:10Z",
            run_id: "run-wc",
            event: "run_end",
            phase: "",
          },
        ],
      },
      [],
      { workspaceRoot },
    );

    expect(result.summary.total_wall_clock_s).toBe(10);
    expect(result.summary.summed_phase_duration_s).toBe(3);
    expect(result.summary.total_duration_s).toBe(3);

    rmSync(workspaceRoot, { recursive: true, force: true });
  });

  it("returns undefined for total_wall_clock_s when run_start/run_end are absent", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-nowc-"));
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
        run_id: "run-nowc",
        schema_ref: "contracts/artifacts/execution-trace.schema.json",
        events: [
          {
            ts: "2026-02-22T12:00:00Z",
            run_id: "run-nowc",
            event: "phase_start",
            phase: "design",
          },
          {
            ts: "2026-02-22T12:00:05Z",
            run_id: "run-nowc",
            event: "phase_end",
            phase: "design",
          },
        ],
      },
      [],
      { workspaceRoot },
    );

    expect(result.summary.total_wall_clock_s).toBeUndefined();

    rmSync(workspaceRoot, { recursive: true, force: true });
  });

  it("returns undefined for security_time_to_closure_s when no security-review phase exists", async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), "trace-collector-nosec-"));
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
        run_id: "run-nosec",
        schema_ref: "contracts/artifacts/execution-trace.schema.json",
        events: [
          {
            ts: "2026-02-22T12:00:00Z",
            run_id: "run-nosec",
            event: "phase_start",
            phase: "design",
          },
          {
            ts: "2026-02-22T12:00:05Z",
            run_id: "run-nosec",
            event: "phase_end",
            phase: "design",
          },
        ],
      },
      [],
      { workspaceRoot },
    );

    expect(result.summary.security_time_to_closure_s).toBeUndefined();

    rmSync(workspaceRoot, { recursive: true, force: true });
  });
});
