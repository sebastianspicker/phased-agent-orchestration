#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { CONFIG_IDS as CONFIG_ID_LIST, PHASE_ORDER } from "../lib/constants.mjs";
import { badInput } from "./lib/errors.mjs";
import { toNumber, coalesce, mergeStageProfile } from "./lib/utils.mjs";
import {
  ensureRunDirs,
  gateFileNameForPhase,
  getRepoRoot,
  getRunDir,
  loadPipelineState,
  resolveWithinDirectory,
  resolveWithinRepo,
  savePipelineState,
  toWorkspaceRelative,
  writeJson,
} from "./lib/state.mjs";
import {
  appendTraceEvent,
  ensureTraceFile,
  hasEvent,
} from "./lib/trace.mjs";
import {
  buildArtifactForPhase,
  phaseArtifactDefaults,
} from "./lib/artifacts.mjs";
import {
  QUALITY_GATE_PHASES,
  emitGate,
  emitRetryEventIfNeeded,
  evaluateContextBudgetGate,
  evaluateTraceabilityGate,
  gateStatusFromPhaseAndProfile,
  runPolicyDecision,
  runQualityGate,
  stageGateInput,
  updateStateAfterArtifact,
  worstStatus,
} from "./lib/gates.mjs";
import {
  printUsage,
  runEndPhase,
  runRecordArtifact,
  runRecordGate,
  runStartPhase,
  runSummarizeRun,
} from "./lib/commands.mjs";

const PHASES = PHASE_ORDER;
const CONFIG_IDS = new Set(CONFIG_ID_LIST);

function parseOptions(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
      continue;
    }
    out._.push(token);
  }
  return out;
}

function requireOption(options, key) {
  const value = options[key];
  if (value === undefined || value === null || value === "") {
    throw badInput(`missing required option --${key}`);
  }
  return value;
}

function assertKnownPhase(phase, source = "phase") {
  if (!PHASES.includes(phase)) {
    throw badInput(`${source} must be one of: ${PHASES.join(", ")}`);
  }
}

function loadTasksetTask(tasksetRef, taskId) {
  if (!tasksetRef) return null;
  const root = getRepoRoot();
  const tasksetPath = resolveWithinRepo(tasksetRef, root);
  let data;
  try {
    data = JSON.parse(readFileSync(tasksetPath, "utf8"));
  } catch (parseErr) {
    throw badInput(`failed to read taskset ${tasksetRef}: ${parseErr.message}`);
  }
  if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
    throw badInput(`taskset has no tasks: ${tasksetRef}`);
  }

  const id = taskId || data.tasks[0].id;
  const task = data.tasks.find((entry) => entry.id === id);
  if (!task) {
    throw badInput(`task id not found in taskset: ${id}`);
  }
  return { taskset: data, task, taskset_path: toWorkspaceRelative(tasksetPath, root) };
}

function resolveCognitiveTier(phase, state) {
  const tiers = state?.config?.cognitive_tiers;
  if (!tiers || typeof tiers !== "object") return null;
  // Direct match (e.g., "arm", "design", "plan")
  const direct = tiers[phase];
  if (direct) return direct;
  // Hyphenated to underscored (e.g., "adversarial-review" -> "adversarial_review")
  const underscored = phase.replace(/-/g, "_");
  if (tiers[underscored]) return tiers[underscored];
  // Lead role suffix (e.g., "adversarial_review_lead", "build_lead")
  if (tiers[`${underscored}_lead`]) return tiers[`${underscored}_lead`];
  return null;
}

function contextBudgetForPhase(phase, state) {
  const budgets = state?.config?.context_budgets ?? {};
  const direct = budgets[phase];
  const fallbackKey = phase === "build" ? "build_lead" : phase;
  const value = coalesce(direct, budgets[fallbackKey]);
  if (value === undefined || value === null) return null;

  if (typeof value === "number") {
    return {
      token_max: value,
      files_max: 64,
    };
  }

  if (value && typeof value === "object") {
    return {
      token_max: toNumber(coalesce(value.token_max, value.max_tokens, value.token_estimate), 0),
      files_max: Math.max(1, Math.trunc(toNumber(coalesce(value.files_max, value.max_files), 64))),
    };
  }

  return null;
}

function stageProfileFromTask({ task, configId, phase }) {
  const base = task?.stage_overrides?.[phase] ?? {};
  const cfg = task?.config_overrides?.[configId]?.[phase] ?? {};
  return mergeStageProfile(base, cfg);
}

function ensureStateForRun(state, runId) {
  if (state.run_id !== runId) {
    state.run_id = runId;
  }
}

function phaseTokenForContextBudget(phase) {
  if (phase === "build") return "build_lead";
  return phase;
}

function resolveArtifactRefForRun(runId, artifactRef) {
  const runDir = getRunDir(runId);
  if (!artifactRef) {
    throw badInput("artifact reference is required");
  }
  if (artifactRef.startsWith(".pipeline/")) {
    return resolveWithinRepo(artifactRef);
  }
  if (artifactRef.startsWith("/")) {
    return resolveWithinRepo(artifactRef);
  }
  return resolveWithinDirectory(runDir, artifactRef, { baseLabel: "run directory" });
}

function resolveOptionalArtifactRefForRun(runId, artifactRef) {
  if (!artifactRef) return null;
  try {
    return resolveArtifactRefForRun(runId, artifactRef);
  } catch {
    return null;
  }
}

function appendRunStartIfMissing(runId, state) {
  ensureTraceFile(runId);
  if (!hasEvent(runId, "run_start")) {
    appendTraceEvent(runId, {
      event: "run_start",
      phase: state?.current_phase ?? "arm",
      status: "ok",
      metadata: {
        source: "runner",
      },
    });
  }
}

function appendRunEndIfMissing(runId, state) {
  ensureTraceFile(runId);
  if (!hasEvent(runId, "run_end")) {
    appendTraceEvent(runId, {
      event: "run_end",
      phase: state?.current_phase ?? "release-readiness",
      status: "ok",
      metadata: {
        source: "runner",
      },
    });
  }
}

function runStage(options) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  if (!PHASES.includes(phase)) {
    throw badInput(`unsupported phase: ${phase}`);
  }

  const configId = options["config-id"] || "phased_default";
  if (!CONFIG_IDS.has(configId)) {
    throw badInput(`unsupported config-id: ${configId}`);
  }

  const state = loadPipelineState();
  ensureStateForRun(state, runId);
  ensureRunDirs(runId);
  appendRunStartIfMissing(runId, state);

  const taskContext = loadTasksetTask(options.taskset, options["task-id"]);
  const stageProfile = stageProfileFromTask({
    task: taskContext?.task,
    configId,
    phase,
  });

  if (taskContext?.taskset_path) {
    appendTraceEvent(runId, {
      event: "artifact_read",
      phase,
      artifact_ref: taskContext.taskset_path,
      status: "ok",
    });
  }
  emitRetryEventIfNeeded(runId, phase);

  const cognitiveTier = resolveCognitiveTier(phase, state);
  appendTraceEvent(runId, {
    event: "phase_start",
    phase,
    status: "ok",
    metadata: cognitiveTier ? { cognitive_tier: cognitiveTier } : undefined,
  });

  let policyDecision = null;
  if (phase === "adversarial-review" || phase === "build") {
    policyDecision = runPolicyDecision({
      runId,
      phase,
      state,
      stageProfile,
      requestedFanoutOverride: options["requested-fanout"],
    });
  }

  const defaults = phaseArtifactDefaults(phase);
  let artifactRef = options["artifact-ref"] || defaults.artifactRef;
  const schemaRef = options["schema-ref"] || defaults.schemaRef;
  let artifact = null;
  let wroteArtifact = false;

  if (artifactRef) {
    const artifactAbs = resolveArtifactRefForRun(runId, artifactRef);

    if (options["input-artifact"]) {
      const inputAbs = resolveWithinRepo(options["input-artifact"]);
      appendTraceEvent(runId, {
        event: "artifact_read",
        phase,
        artifact_ref: toWorkspaceRelative(inputAbs),
        status: "ok",
      });
      try {
        artifact = JSON.parse(readFileSync(inputAbs, "utf8"));
      } catch (parseErr) {
        throw badInput(`failed to read input artifact ${options["input-artifact"]}: ${parseErr.message}`);
      }
      writeJson(artifactAbs, artifact);
      wroteArtifact = true;
    } else {
      artifact = buildArtifactForPhase({
        phase,
        runId,
        configId,
        task: taskContext?.task,
        stageProfile,
        policyDecision,
        budget: contextBudgetForPhase(phaseTokenForContextBudget(phase), state),
      });
      if (artifact) {
        writeJson(artifactAbs, artifact);
        wroteArtifact = true;
      } else if (existsSync(artifactAbs)) {
        appendTraceEvent(runId, {
          event: "artifact_read",
          phase,
          artifact_ref: toWorkspaceRelative(artifactAbs),
          status: "ok",
        });
        try {
          artifact = JSON.parse(readFileSync(artifactAbs, "utf8"));
        } catch (parseErr) {
          throw badInput(`failed to read artifact ${artifactRef}: ${parseErr.message}`);
        }
      }
    }

    if (wroteArtifact) {
      appendTraceEvent(runId, {
        event: "artifact_write",
        phase,
        artifact_ref: toWorkspaceRelative(artifactAbs),
        status: "ok",
      });
    }

    artifactRef = toWorkspaceRelative(artifactAbs);
    if (artifact) {
      updateStateAfterArtifact(state, phase, artifactRef);
    }
  }

  const gateStatuses = [];
  const extraGates = [];

  const budget = contextBudgetForPhase(phaseTokenForContextBudget(phase), state);
  if (artifact && budget) {
    const budgetGate = evaluateContextBudgetGate({
      runId,
      phase,
      artifact,
      artifactRef: artifactRef || "n/a",
      schemaRef,
      state,
      budget,
    });
    if (budgetGate) {
      gateStatuses.push(budgetGate.status);
      extraGates.push(budgetGate);
    }
  }

  if (phase === "plan" || phase === "build") {
    const traceabilityGate = evaluateTraceabilityGate({
      runId,
      phase,
      state,
      resolveArtifactRef: resolveArtifactRefForRun,
      resolveOptionalArtifactRef: resolveOptionalArtifactRefForRun,
    });
    if (traceabilityGate) {
      if (traceabilityGate.status === "fail") {
        gateStatuses.push(traceabilityGate.status);
      }
      extraGates.push(traceabilityGate);
    }
  }

  const desiredStageStatus = options["gate-status"] || gateStatusFromPhaseAndProfile(phase, stageProfile);
  let primaryGate = null;

  if (artifact && schemaRef && QUALITY_GATE_PHASES.has(phase)) {
    const gate = runQualityGate(stageGateInput({ phase, artifact, artifactRef, schemaRef }));
    const stageStatus = worstStatus(gate.status, desiredStageStatus, ...gateStatuses);

    primaryGate = emitGate({
      runId,
      phase,
      gateId: `${phase}-gate`,
      status: stageStatus,
      artifactRef: artifactRef || gate.artifact_ref,
      criteria: gate.criteria,
      blockingFailures: stageStatus === "fail" ? gate.blocking_failures : [],
      schemaValidation: gate.schema_validation,
      metadata: {
        gate_type: "phase",
        schema_ref: schemaRef,
        config_id: configId,
        cognitive_tier: cognitiveTier,
      },
      gateFileOverride: gateFileNameForPhase(phase),
    });
  } else {
    const stageStatus = worstStatus(desiredStageStatus, ...gateStatuses);
    primaryGate = emitGate({
      runId,
      phase,
      gateId: `${phase}-gate`,
      status: stageStatus,
      artifactRef: artifactRef || "n/a",
      criteria: [],
      blockingFailures: stageStatus === "fail" ? ["phase-status"] : [],
      metadata: {
        gate_type: "phase",
        schema_ref: schemaRef,
        config_id: configId,
        cognitive_tier: cognitiveTier,
      },
      gateFileOverride: gateFileNameForPhase(phase),
    });
  }

  appendTraceEvent(runId, {
    event: "phase_end",
    phase,
    status: primaryGate.status === "fail" ? "error" : "ok",
    metadata: {
      gate_status: primaryGate.status,
    },
  });

  state.current_phase = phase;
  const completed = Array.isArray(state.completed_gates) ? state.completed_gates : [];
  completed.push(primaryGate.gate_id);
  state.completed_gates = [...new Set(completed)];
  savePipelineState(state);

  const result = {
    success: primaryGate.status !== "fail",
    run_id: runId,
    phase,
    config_id: configId,
    gate: primaryGate,
    auxiliary_gates: extraGates,
    policy_decision: policyDecision,
    artifact_ref: artifactRef,
    schema_ref: schemaRef,
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (primaryGate.status === "fail") {
    appendTraceEvent(runId, {
      event: "error",
      phase,
      status: "error",
      message: `${phase} gate failed`,
      gate_id: primaryGate.gate_id,
    });
    process.exitCode = 1;
  }
}

// Shared context passed to command functions
const ctx = {
  requireOption,
  assertKnownPhase,
  ensureStateForRun,
  appendRunStartIfMissing,
  appendRunEndIfMissing,
};

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  const options = parseOptions(rest);

  if (command === "start-phase") {
    runStartPhase(options, ctx);
    return;
  }
  if (command === "end-phase") {
    runEndPhase(options, ctx);
    return;
  }
  if (command === "record-artifact") {
    runRecordArtifact(options, ctx);
    return;
  }
  if (command === "record-gate") {
    runRecordGate(options, ctx);
    return;
  }
  if (command === "summarize-run") {
    runSummarizeRun(options, ctx);
    return;
  }
  if (command === "run-stage") {
    runStage(options);
    return;
  }

  throw badInput(`unknown command: ${command}`);
}

const ERROR_HINTS = {
  E_QUALITY_GATE_MISSING: "Hint: Run 'npm run build' in skills/dev-tools/quality-gate/",
  E_QUALITY_GATE_TIMEOUT: "Hint: Quality-gate subprocess timed out. Check for large artifacts or increase timeout.",
  E_QUALITY_GATE_SIGNAL: "Hint: Quality-gate subprocess was killed. Check system resources.",
  E_TRACE_COLLECTOR_MISSING: "Hint: Run 'npm run build' in skills/dev-tools/trace-collector/",
  E_TRACE_COLLECTOR_TIMEOUT: "Hint: Trace-collector subprocess timed out. Check trace.jsonl size.",
  E_BAD_INPUT: "Hint: Run 'node scripts/pipeline/runner.mjs --help' for usage",
  E_BAD_TRACE: "Hint: Check trace.jsonl for malformed lines.",
};

try {
  main();
} catch (error) {
  const code = error?.code || "E_UNKNOWN";
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${code}: ${message}\n`);
  const hint = ERROR_HINTS[code];
  if (hint) {
    process.stderr.write(`${hint}\n`);
  }
  process.exit(1);
}
