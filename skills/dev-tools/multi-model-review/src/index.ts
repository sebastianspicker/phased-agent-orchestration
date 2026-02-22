import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import type { Input, RunResult, ReviewData, DriftData } from "./types.js";
import { runDriftDetect, runReview, validateInput } from "./lib/engine.js";

const TOOL_VERSION = "0.2.0";

function readStdin(): string {
  return readFileSync(0, "utf8");
}

function getErrorDetails(stack?: string): string | undefined {
  return process.env.DEBUG_ERROR_DETAILS === "1" ? stack : undefined;
}

async function main() {
  const t0 = performance.now();
  const logs: string[] = [];

  try {
    const raw = readStdin();
    if (!raw.trim()) {
      throw Object.assign(new Error("Empty input: expected JSON on stdin"), {
        code: "E_BAD_INPUT",
      });
    }

    const input = JSON.parse(raw) as Input;
    validateInput(input);

    let data: ReviewData | DriftData;

    if (input.action.type === "review") {
      data = runReview(input, logs);
    } else {
      data = runDriftDetect(input, logs, {
        workspaceRoot: process.env.WORKSPACE_ROOT ?? "/workspace",
      });
    }

    const result: RunResult = {
      success: true,
      data,
      metadata: {
        tool_version: TOOL_VERSION,
        execution_time_ms: Math.round(performance.now() - t0),
      },
      logs,
    };

    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; stack?: string };
    const result: RunResult = {
      success: false,
      error: {
        code: e.code ?? "E_UNKNOWN",
        message: e.message ?? "Unknown error",
        details: getErrorDetails(e.stack),
      },
      metadata: {
        tool_version: TOOL_VERSION,
        execution_time_ms: Math.round(performance.now() - t0),
      },
      logs,
    };
    process.stdout.write(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main();
