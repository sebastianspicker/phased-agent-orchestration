/**
 * Gate evaluation, emission, and quality-gate subprocess runner.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { badInput } from "./errors.mjs";
import { spawnSkillTool } from "./subprocess.mjs";
import { coalesce } from "./utils.mjs";
import {
  gateFileNameForPhase,
  getRunDir,
  parseBooleanFlag,
  phaseToArtifactKey,
  readJson,
  resolveWithinDirectory,
  toWorkspaceRelative,
  writeJson,
} from "./state.mjs";
import {
  appendTraceEvent,
  nowIso,
  readTraceEvents,
  summarizeEventsLocal,
} from "./trace.mjs";
import { decideFanout } from "./policy.mjs";
import { evaluateMustTraceability } from "./traceability.mjs";

export const QUALITY_GATE_PHASES = new Set([
  "arm",
  "design",
  "adversarial-review",
  "plan",
  "pmatch",
  "build",
  "quality-static",
  "quality-tests",
  "release-readiness",
]);

const GATE_STATUS_SET = new Set(["pass", "warn", "fail"]);
const GATE_FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.json$/;

export function gateStatusRank(status) {
  if (status === "fail") return 3;
  if (status === "warn") return 2;
  return 1;
}

export function assertGateStatus(status, source = "status") {
  if (!GATE_STATUS_SET.has(status)) {
    throw badInput(`${source} must be one of: pass, warn, fail`);
  }
}

export function resolveGateOutputPath(runDir, gateFileName) {
  if (typeof gateFileName !== "string" || gateFileName.length === 0) {
    throw badInput("gate file name must be a non-empty string");
  }
  if (!GATE_FILE_PATTERN.test(gateFileName)) {
    throw badInput(`invalid gate file name: ${gateFileName}`);
  }
  return resolveWithinDirectory(resolve(runDir, "gates"), gateFileName, {
    baseLabel: "gates directory",
  });
}

export function worstStatus(...statuses) {
  return [...statuses]
    .filter(Boolean)
    .sort((a, b) => gateStatusRank(b) - gateStatusRank(a))[0] ?? "pass";
}

export function emitGate({
  runId,
  phase,
  gateId,
  status,
  artifactRef = "n/a",
  criteria = [],
  blockingFailures = [],
  metadata = {},
  gateFileOverride,
  schemaValidation,
}) {
  assertGateStatus(status, "gate status");
  const gate = {
    gate_id: gateId,
    phase,
    status,
    criteria,
    blocking_failures: blockingFailures,
    artifact_ref: artifactRef,
    schema_validation: schemaValidation ?? {
      valid: true,
      errors: [],
    },
    timestamp: nowIso(),
    metadata,
  };

  const runDir = getRunDir(runId);
  const gateFile = gateFileOverride || gateFileNameForPhase(phase);
  const gatePath = resolveGateOutputPath(runDir, gateFile);
  writeJson(gatePath, gate);

  appendTraceEvent(runId, {
    event: "gate_result",
    phase,
    gate_id: gateId,
    status,
    artifact_ref: artifactRef,
    metadata,
  });

  return gate;
}

export function updateStateAfterArtifact(state, phase, artifactRef) {
  const key = phaseToArtifactKey(phase);
  if (!key) return;

  if (key === "drift_reports") {
    state.artifacts.drift_reports = Array.isArray(state.artifacts.drift_reports)
      ? [...state.artifacts.drift_reports, artifactRef]
      : [artifactRef];
    return;
  }

  if (key === "quality_reports") {
    state.artifacts.quality_reports = Array.isArray(state.artifacts.quality_reports)
      ? [...state.artifacts.quality_reports, artifactRef]
      : [artifactRef];
    return;
  }

  state.artifacts[key] = artifactRef;
}

export function readPhaseGate(runId, phase) {
  const gatePath = resolve(getRunDir(runId), "gates", gateFileNameForPhase(phase));
  return readJson(gatePath, null);
}

export function emitRetryEventIfNeeded(runId, phase) {
  const previousGate = readPhaseGate(runId, phase);
  if (!previousGate || previousGate.status !== "fail") {
    return null;
  }

  const retryCount =
    readTraceEvents(runId).filter((event) => event.event === "retry" && event.phase === phase).length + 1;

  return appendTraceEvent(runId, {
    event: "retry",
    phase,
    status: "retry",
    gate_id: previousGate.gate_id,
    metadata: {
      retry_count: retryCount,
      previous_gate_id: previousGate.gate_id,
      previous_status: previousGate.status,
    },
  });
}

export function runQualityGate(input) {
  return spawnSkillTool({
    entrypoint: "skills/dev-tools/quality-gate/dist/index.js",
    input,
    toolName: "quality-gate",
  });
}

export function stageGateInput({ phase, artifact, artifactRef, schemaRef }) {
  return {
    artifact,
    artifact_ref: artifactRef,
    schema_ref: schemaRef,
    phase,
    criteria: [],
  };
}

export function gateStatusFromPhaseAndProfile(phase, stageProfile) {
  if (typeof stageProfile.gate_status === "string") {
    return stageProfile.gate_status;
  }
  if (phase === "post-build") {
    return "pass";
  }
  return "pass";
}

export function evaluateContextBudgetGate({ runId, phase, artifact, artifactRef, schemaRef, state, budget }) {
  if (!budget) return null;

  const flags = state?.config?.feature_flags ?? {};
  const enforce = parseBooleanFlag(flags.context_budget_v1);

  if (!artifact.context_manifest) {
    const status = enforce ? "fail" : "warn";
    return emitGate({
      runId,
      phase,
      gateId: `${phase}-context-budget-gate`,
      status,
      artifactRef,
      criteria: [
        {
          name: "context-manifest-present",
          passed: false,
          evidence: "context_manifest is missing",
        },
      ],
      blockingFailures: status === "fail" ? ["context-manifest-present"] : [],
      metadata: {
        gate_type: "context_budget",
        mode: enforce ? "enforce" : "shadow",
      },
      gateFileOverride: `${phase}-context-budget-gate.json`,
    });
  }

  const gateResult = runQualityGate({
    artifact,
    artifact_ref: artifactRef,
    schema_ref: "contracts/artifacts/context-manifest-gate.schema.json",
    phase,
    criteria: [
      {
        name: "context-files-max",
        type: "count-max",
        path: "context_manifest.files_loaded",
        value: budget.files_max,
      },
      {
        name: "context-token-max",
        type: "number-max",
        path: "context_manifest.token_estimate",
        value: budget.token_max,
      },
    ],
  });

  const mappedStatus =
    gateResult.status === "fail" && !enforce
      ? "warn"
      : gateResult.status;

  return emitGate({
    runId,
    phase,
    gateId: `${phase}-context-budget-gate`,
    status: mappedStatus,
    artifactRef,
    criteria: gateResult.criteria,
    blockingFailures: mappedStatus === "fail" ? gateResult.blocking_failures : [],
    schemaValidation: gateResult.schema_validation,
    metadata: {
      gate_type: "context_budget",
      mode: enforce ? "enforce" : "shadow",
      token_max: budget.token_max,
      files_max: budget.files_max,
      schema_ref: schemaRef,
    },
    gateFileOverride: `${phase}-context-budget-gate.json`,
  });
}

export function evaluateTraceabilityGate({ runId, phase, state, resolveArtifactRef, resolveOptionalArtifactRef }) {
  const flags = state?.config?.feature_flags ?? {};
  const enforce = parseBooleanFlag(flags.traceability_v1);

  const briefRef = state?.artifacts?.brief ?? "brief.json";
  const planRef = state?.artifacts?.plan ?? "plan.json";
  const designRef = state?.artifacts?.design ?? "design.json";
  const driftRef =
    Array.isArray(state?.artifacts?.drift_reports) && state.artifacts.drift_reports.length > 0
      ? state.artifacts.drift_reports[state.artifacts.drift_reports.length - 1]
      : null;
  const briefAbs = resolveArtifactRef(runId, briefRef);
  const planAbs = resolveArtifactRef(runId, planRef);
  const designAbs = resolveOptionalArtifactRef(runId, designRef);
  const driftAbs = resolveOptionalArtifactRef(runId, driftRef);

  if (!existsSync(briefAbs) || !existsSync(planAbs)) {
    return emitGate({
      runId,
      phase,
      gateId: `${phase}-traceability-gate`,
      status: enforce ? "fail" : "warn",
      artifactRef: `${toWorkspaceRelative(briefAbs)}|${toWorkspaceRelative(planAbs)}`,
      criteria: [
        {
          name: "traceability-inputs-present",
          passed: false,
          evidence: `brief_exists=${existsSync(briefAbs)} plan_exists=${existsSync(planAbs)}`,
        },
      ],
      blockingFailures: enforce ? ["traceability-inputs-present"] : [],
      metadata: {
        gate_type: "traceability",
        mode: enforce ? "enforce" : "shadow",
      },
      gateFileOverride: `${phase}-traceability-gate.json`,
    });
  }

  appendTraceEvent(runId, {
    event: "artifact_read",
    phase,
    artifact_ref: toWorkspaceRelative(briefAbs),
    status: "ok",
  });
  appendTraceEvent(runId, {
    event: "artifact_read",
    phase,
    artifact_ref: toWorkspaceRelative(planAbs),
    status: "ok",
  });
  if (designAbs && existsSync(designAbs)) {
    appendTraceEvent(runId, {
      event: "artifact_read",
      phase,
      artifact_ref: toWorkspaceRelative(designAbs),
      status: "ok",
    });
  }
  if (driftAbs && existsSync(driftAbs)) {
    appendTraceEvent(runId, {
      event: "artifact_read",
      phase,
      artifact_ref: toWorkspaceRelative(driftAbs),
      status: "ok",
    });
  }

  const outcome = evaluateMustTraceability({
    phase,
    enforce,
    briefRef: toWorkspaceRelative(briefAbs),
    planRef: toWorkspaceRelative(planAbs),
    designRef: designAbs ? toWorkspaceRelative(designAbs) : null,
    driftRef: driftAbs ? toWorkspaceRelative(driftAbs) : null,
  });

  return emitGate({
    runId,
    phase,
    gateId: `${phase}-traceability-gate`,
    status: outcome.gate.status,
    artifactRef: outcome.gate.artifact_ref,
    criteria: outcome.gate.criteria,
    blockingFailures: outcome.gate.status === "fail" ? outcome.gate.blocking_failures : [],
    schemaValidation: outcome.gate.schema_validation,
    metadata: {
      gate_type: "traceability",
      mode: enforce ? "enforce" : "shadow",
      required_hops: phase === "build" ? ["plan-tasks", "plan-tests", "drift-claims"] : ["plan-tasks", "plan-tests"],
      warning_hops: ["design"],
      required_failures: outcome.required_failures,
      warning_failures: outcome.warning_failures,
      missing_by_criterion: outcome.missing_by_criterion,
      missing_requirement_ids: outcome.missing_requirement_ids,
      refs: outcome.refs,
    },
    gateFileOverride: `${phase}-traceability-gate.json`,
  });
}

export function runPolicyDecision({ runId, phase, state, stageProfile, requestedFanoutOverride }) {
  const summaryPath = resolve(getRunDir(runId), "trace.summary.json");
  const summaryFromDisk = readJson(summaryPath, null);
  const summary = summaryFromDisk ?? summarizeEventsLocal(readTraceEvents(runId));

  const requestedFanout = coalesce(
    requestedFanoutOverride,
    stageProfile.requested_fanout,
    phase === "adversarial-review"
      ? state?.config?.orchestration_policy?.max_reviewers
      : state?.config?.orchestration_policy?.max_builders,
    1,
  );

  const decision = decideFanout({
    phase,
    policy: state?.config?.orchestration_policy ?? {},
    traceSummary: summary,
    requestedFanout,
    qualityGainEstimate: stageProfile.quality_gain,
    costPerAgentUsd: stageProfile.cost_per_agent_usd,
    coordinationCost: stageProfile.coordination_cost,
  });

  appendTraceEvent(runId, {
    event: "agent_call",
    phase,
    status: "ok",
    tool_name: "policy-engine",
    metadata: {
      policy_decision: decision,
    },
  });

  return decision;
}
