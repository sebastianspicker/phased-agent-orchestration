import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import type { Input, RunResult } from "./types.js";
import { evaluateGate } from "./lib/engine.js";

function readStdin(): string {
  return readFileSync(0, "utf8");
}

async function main() {
  const t0 = performance.now();
  let logs: string[] = [];

  try {
    const raw = readStdin();
    if (!raw || !raw.trim()) {
      throw Object.assign(new Error("Empty input: expected JSON on stdin"), {
        code: "E_BAD_INPUT",
      });
    }
    const input = JSON.parse(raw) as Input;
    const evaluated = await evaluateGate(input);
    logs = evaluated.logs;

    const result: RunResult = {
      success: true,
      data: evaluated.data,
      metadata: {
        tool_version: "0.1.0",
        execution_time_ms: Math.round(performance.now() - t0),
      },
      logs,
    };

    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; stack?: string };
    const result: RunResult = {
      success: false,
      error: {
        code: error.code ?? "E_UNKNOWN",
        message: error.message ?? "Unknown error",
        details: error.stack,
      },
      metadata: {
        tool_version: "0.1.0",
        execution_time_ms: Math.round(performance.now() - t0),
      },
      logs,
    };
    process.stdout.write(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main();
