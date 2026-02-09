import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Input, RunResult, Metrics, Finding, Patch, Action } from "./types.js";
import { loadProject } from "./lib/loadProject.js";
import { runDiagnostics } from "./lib/diagnostics.js";
import { runLint } from "./lib/lint.js";
import { runRefactor } from "./lib/refactor.js";
import { runMigrate } from "./lib/migrate.js";
import { runCodegen } from "./lib/codegen.js";
import { runRecommend } from "./lib/recommend.js";

function readStdin(): string {
  return readFileSync(0, "utf8");
}

function isUnderWorkspace(p: string): boolean {
  return p === "/workspace" || p.startsWith("/workspace/");
}

function validateInput(input: Input): void {
  if (!input?.project?.root || typeof input.project.root !== "string") {
    throw Object.assign(new Error("project.root is required"), { code: "E_BAD_INPUT" });
  }
  if (!isUnderWorkspace(input.project.root)) {
    throw Object.assign(new Error("project.root must be under /workspace"), { code: "E_BAD_ROOT" });
  }
  if (!Array.isArray(input.actions) || input.actions.length === 0) {
    throw Object.assign(new Error("actions must be a non-empty array"), { code: "E_BAD_INPUT" });
  }
  if (input.actions.length > 20) {
    throw Object.assign(new Error("actions too many (max 20)"), { code: "E_BAD_INPUT" });
  }
  for (const a of input.actions) {
    if (!a || typeof a.type !== "string") {
      throw Object.assign(new Error("action.type is required"), { code: "E_BAD_INPUT" });
    }
    const paths = a.targets?.paths;
    if (paths?.length) {
      for (const p of paths) {
        const resolved = path.resolve(input.project.root, p);
        if (!isUnderWorkspace(resolved)) {
          throw Object.assign(new Error("targets.paths must resolve under /workspace"), { code: "E_BAD_ROOT" });
        }
      }
    }
  }
  const modulePaths = input.project.modulePaths ?? [];
  for (const p of modulePaths) {
    if (typeof p !== "string" || !isUnderWorkspace(path.resolve(input.project.root, p))) {
      throw Object.assign(new Error("project.modulePaths must be under /workspace"), { code: "E_BAD_ROOT" });
    }
  }
}

async function main() {
  const t0 = performance.now();
  const logs: string[] = [];

  try {
    const raw = readStdin();
    if (!raw || !raw.trim()) {
      throw Object.assign(new Error("Empty input: expected JSON on stdin"), { code: "E_BAD_INPUT" });
    }
    const input = JSON.parse(raw) as Input;
    validateInput(input);

    const ctx = await loadProject(input, logs);

    const findings: Finding[] = [];
    const patches: Patch[] = [];
    const metrics: Metrics = {
      filesAnalyzed: ctx.sourceFilePaths.length,
      diagnostics: 0,
      lintIssues: 0,
      patchesGenerated: 0,
      filesModified: 0
    };

    for (const action of input.actions) {
      if (action.targets?.changedOnly) {
        logs.push(`Action '${action.type}': targets.changedOnly is not supported; using explicit paths only.`);
      }

      if (action.type === "debug") {
        const r = await runDiagnostics(ctx, action.debugLevel ?? "quick", logs);
        findings.push(...r.findings);
        metrics.diagnostics += r.metrics.diagnostics;
      } else if (action.type === "lint") {
        const r = await runLint(ctx, action.lintRules, !!action.applyFixes, logs, action.targets);
        findings.push(...r.findings);
        patches.push(...r.patches);
        metrics.patchesGenerated += r.patches.length;
        metrics.filesModified += r.filesModified;
        metrics.lintIssues += r.findings.length;
      } else if (action.type === "refactor") {
        const r = await runRefactor(ctx, action.refactorGoals ?? ["format-whitespace"], !!action.applyFixes, logs, action.targets);
        findings.push(...r.findings);
        patches.push(...r.patches);
        metrics.patchesGenerated += r.patches.length;
        metrics.filesModified += r.filesModified;
      } else if (action.type === "migrate") {
        const r = await runMigrate(ctx, action.migrate, !!action.applyFixes, logs, action.targets);
        findings.push(...r.findings);
        patches.push(...r.patches);
        metrics.patchesGenerated += r.patches.length;
        metrics.filesModified += r.filesModified;
      } else if (action.type === "codegen") {
        const r = await runCodegen(ctx, action.codegen, !!action.applyFixes, logs, action.targets);
        findings.push(...r.findings);
        patches.push(...r.patches);
        metrics.patchesGenerated += r.patches.length;
        metrics.filesModified += r.filesModified;
      } else if (action.type === "recommend") {
        const r = await runRecommend(ctx, action.recommendFocus ?? ["security", "compat"], logs);
        findings.push(...r.findings);
      } else {
        throw Object.assign(new Error(`Unsupported action type: ${action.type}`), { code: "E_BAD_ACTION" });
      }
    }

    const result: RunResult = {
      success: true,
      data: { findings, patches, metrics },
      metadata: {
        tool_version: "0.1.0",
        execution_time_ms: Math.round(performance.now() - t0)
      },
      logs
    };

    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (err: any) {
    const result: RunResult = {
      success: false,
      error: {
        code: err?.code ?? "E_UNKNOWN",
        message: err?.message ?? "Unknown error",
        details: err?.stack
      },
      metadata: {
        tool_version: "0.1.0",
        execution_time_ms: Math.round(performance.now() - t0)
      },
      logs
    };
    process.stdout.write(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main();
