#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { CONFIG_IDS as CONFIG_ID_LIST, PHASE_ORDER } from "../lib/constants.mjs";
import {
  ensureRunDirs,
  gateFileNameForPhase,
  getRepoRoot,
  getRunDir,
  loadPipelineState,
  parseBooleanFlag,
  phaseToArtifactKey,
  readJson,
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
  nowIso,
  readTraceEvents,
  summarizeEventsLocal,
  summarizeRun,
} from "./lib/trace.mjs";
import { decideFanout } from "./lib/policy.mjs";
import { evaluateMustTraceability } from "./lib/traceability.mjs";

const PHASES = PHASE_ORDER;

const QUALITY_GATE_PHASES = new Set([
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

const CONFIG_IDS = new Set(CONFIG_ID_LIST);
const SUMMARY_FORMATS = new Set(["json", "text", "markdown"]);
const GATE_STATUS_SET = new Set(["pass", "warn", "fail"]);
const GATE_FILE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.json$/;
const PHASE_END_STATUS_SET = new Set(["ok", "error"]);
const ARTIFACT_ACTION_SET = new Set(["read", "write"]);

const DEFAULT_SCHEMA_BY_PHASE = {
  arm: "contracts/artifacts/brief.schema.json",
  design: "contracts/artifacts/design-document.schema.json",
  "adversarial-review": "contracts/artifacts/review-report.schema.json",
  plan: "contracts/artifacts/execution-plan.schema.json",
  pmatch: "contracts/artifacts/drift-report.schema.json",
  "quality-static": "contracts/artifacts/quality-report.schema.json",
  "quality-tests": "contracts/artifacts/quality-report.schema.json",
  "release-readiness": "contracts/artifacts/release-readiness.schema.json",
};

function badInput(message) {
  const err = new Error(message);
  err.code = "E_BAD_INPUT";
  return err;
}

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

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function coalesce(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function mergeStageProfile(base, next) {
  return {
    ...(base || {}),
    ...(next || {}),
  };
}

function loadTasksetTask(tasksetRef, taskId) {
  if (!tasksetRef) return null;
  const root = getRepoRoot();
  const tasksetPath = resolveWithinRepo(tasksetRef, root);
  const data = JSON.parse(readFileSync(tasksetPath, "utf8"));
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

function phaseArtifactDefaults(phase) {
  switch (phase) {
    case "arm":
      return { artifactRef: "brief.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "design":
      return { artifactRef: "design.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "adversarial-review":
      return { artifactRef: "review.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "plan":
      return { artifactRef: "plan.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "pmatch":
      return { artifactRef: "drift-reports/pmatch.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "build":
      return { artifactRef: "build.json", schemaRef: null };
    case "quality-static":
      return { artifactRef: "quality-reports/static.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "quality-tests":
      return { artifactRef: "quality-reports/tests.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    case "post-build":
      return { artifactRef: null, schemaRef: null };
    case "release-readiness":
      return { artifactRef: "release-readiness.json", schemaRef: DEFAULT_SCHEMA_BY_PHASE[phase] };
    default:
      return { artifactRef: `${phase}.json`, schemaRef: null };
  }
}

function buildContextManifest({ phase, stageProfile, budget }) {
  if (stageProfile.context_manifest_present === false) {
    return undefined;
  }

  const filesLoaded = Math.max(0, Math.trunc(toNumber(stageProfile.files_loaded, 3)));
  const tokenEstimate = Math.max(
    0,
    Math.trunc(
      toNumber(stageProfile.token_estimate, budget?.token_max ? Math.min(4000, budget.token_max) : 2000),
    ),
  );
  const charEstimate = Math.max(
    0,
    Math.trunc(toNumber(stageProfile.char_count_estimate, tokenEstimate * 4)),
  );

  return {
    selection_policy: "taskset-default-minimal",
    ordering_policy: "requirements-first-then-recent-artifacts",
    files_loaded: Array.from({ length: filesLoaded }, (_, idx) => ({
      path: `docs/task/${phase}/source-${idx + 1}.md`,
      bytes: 400 + idx * 20,
    })),
    docs_loaded: [
      {
        url: "https://example.com/reference",
        retrieved_at: nowIso(),
      },
    ],
    token_estimate: tokenEstimate,
    char_count_estimate: charEstimate,
  };
}

function defaultRequirementIds(task) {
  const ids = Array.isArray(task?.must_requirement_ids)
    ? task.must_requirement_ids.filter((id) => typeof id === "string" && id.length > 0)
    : [];
  return ids.length > 0 ? ids : ["REQ-001"];
}

function driftStatusForConfig(configId, stageProfile) {
  if (stageProfile.drift_status) return stageProfile.drift_status;
  if (configId === "baseline_single_agent") return "violated";
  if (configId === "phased_plus_reviewers") return "partial";
  if (configId === "phased_with_context_budgets") return "partial";
  if (configId === "phased_dual_extractor_drift") return "verified";
  return "partial";
}

function buildArtifactForPhase({
  phase,
  runId,
  configId,
  task,
  stageProfile,
  policyDecision,
  budget,
}) {
  const requirements = defaultRequirementIds(task);
  const contextManifest = buildContextManifest({ phase, stageProfile, budget });
  const reviewedBy = Math.max(1, policyDecision?.chosen_fanout ?? 1);
  const now = nowIso();

  const withContext = (artifact) => (contextManifest ? { ...artifact, context_manifest: contextManifest } : artifact);

  if (phase === "arm") {
    return withContext({
      requirements: requirements.map((id, idx) => ({
        id,
        trace_id: id,
        description: `Requirement ${idx + 1} for ${task?.id ?? "task"}`,
        priority: "must",
      })),
      constraints: [{ type: "hard", description: "Must keep contracts valid", source: "taskset" }],
      non_goals: [{ description: "No external deployment", reason: "Out of scope for evaluation" }],
      style: {
        tone: "technical",
        patterns: ["phase-scoped"],
        conventions: ["typed-artifacts"],
      },
      key_concepts: [{ term: "traceability", definition: "Requirement linkage across artifacts" }],
      decisions: [{ decision: "Use phased orchestration", rationale: "Deterministic gate control" }],
      open_questions: [],
    });
  }

  if (phase === "design") {
    return withContext({
      analysis: {
        summary: "Design is constrained by contracts and gateability.",
        principles: [{ principle: "Minimize context noise", implication: "Phase-local manifests" }],
      },
      constraints_classification: [
        {
          constraint: "Contracts must remain valid",
          trace_id: "constraint-contracts",
          covers_requirement_ids: [requirements[0]],
          original_type: "hard",
          validated_type: "hard",
          evaluation: "Required for deterministic gates",
          flagged: false,
        },
      ],
      approach: {
        description: "Generate artifacts per phase and enforce gates.",
        rationale: "Keeps runner deterministic.",
        components: [{ name: "runner", responsibility: "Phase transitions", interfaces: ["CLI"] }],
      },
      research: [{ source: "repo-docs", url: "https://example.com/research", finding: "Phase scoping is beneficial.", verified_at: now }],
      codebase_alignment: [{ pattern: "scripts/pipeline/*", file_paths: ["scripts/pipeline/runner.mjs"], alignment_status: "new", notes: "runtime orchestration" }],
      iteration_history: [{ iteration: 1, changes: "Initial design", rationale: "Enable runtime gates" }],
    });
  }

  if (phase === "adversarial-review") {
    const reviewerCount = Math.max(1, reviewedBy);
    const reviewers = Array.from({ length: reviewerCount }, (_, idx) => ({
      model_id: `reviewer-${idx + 1}`,
      findings: [
        {
          id: `finding-${idx + 1}`,
          trace_id: `finding-trace-${idx + 1}`,
          category: "robustness",
          description: "Check requirement linkage remains intact.",
          severity: "medium",
          covers_requirement_ids: [requirements[0]],
          evidence: "review signal",
          suggestion: "Keep coverage-min enforced",
        },
      ],
    }));

    return withContext({
      reviewers,
      deduplicated_findings: [
        {
          id: "dedup-1",
          trace_id: "dedup-trace-1",
          category: "robustness",
          description: "Ensure requirement coverage gates are active.",
          severity: "medium",
          source_models: reviewers.map((entry) => entry.model_id),
          covers_requirement_ids: [requirements[0]],
          evidence: "deduplicated",
          suggestion: "Use traceability gate",
        },
      ],
      fact_checks: [
        {
          finding_id: "dedup-1",
          status: "confirmed",
          evidence: "coverage-min criterion validates linkage",
        },
      ],
      cost_benefit: [
        {
          finding_id: "dedup-1",
          severity: "medium",
          fix_cost: "low",
          risk_of_ignoring: "moderate",
          recommendation: "fix-before-ship",
        },
      ],
      mitigations: [{ finding_id: "dedup-1", status: "mitigated", action: "Gate added" }],
      iteration: { loop_count: 1, remaining_unmitigated: [] },
    });
  }

  if (phase === "plan") {
    const missingTraceability = stageProfile.traceability_gap === true;
    const requirementCoverage = [...requirements];
    const testCoverage = missingTraceability ? requirements.slice(0, 1) : [...requirements];

    return withContext({
      task_groups: [
        {
          group_id: "group-1",
          builder_tier: "fast",
          tasks: [
            {
              id: "task-1",
              trace_id: "task-trace-1",
              description: "Implement orchestrated runner flow",
              covers_requirement_ids: requirementCoverage,
              covers_constraint_ids: ["constraint-contracts"],
              file_paths: ["scripts/pipeline/runner.mjs"],
              code_patterns: [
                {
                  file: "scripts/pipeline/runner.mjs",
                  pattern: "run-stage",
                  description: "runtime stage execution",
                },
              ],
              test_cases: [
                {
                  name: "runner-stage-smoke",
                  trace_id: "test-trace-1",
                  covers_requirement_ids: testCoverage,
                  setup: "Initialize pipeline",
                  assertion: "Run stage completes",
                  expected: "gate passes",
                },
              ],
              acceptance_criteria: ["trace events emitted", "gate output persisted"],
              dependencies: [],
            },
          ],
        },
      ],
      file_ownership: {
        "scripts/pipeline/runner.mjs": "group-1",
      },
      verification_commands: [
        {
          command: "node scripts/pipeline/runner.mjs run-stage --help",
          description: "Ensure runner CLI is available",
          working_directory: ".",
        },
      ],
    });
  }

  if (phase === "pmatch") {
    const status = driftStatusForConfig(configId, stageProfile);
    const mode =
      configId === "phased_dual_extractor_drift" || stageProfile.drift_mode === "dual-extractor"
        ? "dual-extractor"
        : "heuristic";

    return withContext({
      source_document: { type: "plan", ref: ".pipeline/runs/${run_id}/plan.json".replace("${run_id}", runId) },
      target_document: { type: "implementation", ref: "scripts/pipeline/runner.mjs" },
      claims: [
        {
          id: "drift-1",
          trace_id: "drift-trace-1",
          claim: "Runner must emit phase gate events",
          claim_type: "invariant",
          covers_requirement_ids: requirements,
          verification_status: status,
          evidence: status === "verified" ? "events observed" : "simulated benchmark signal",
          extractor: mode === "dual-extractor" ? "dual-adjudicator:a+b" : "rule-based-drift-detector",
          drift_score: status === "verified" ? 0 : status === "partial" ? 0.5 : status === "violated" ? 1 : 0.75,
          confidence: 0.8,
        },
      ],
      findings:
        status === "verified"
          ? []
          : [
              {
                description: `Drift status is ${status} for runner gate emission`,
                claim_type: "invariant",
                severity: status === "violated" ? "high" : "medium",
                claim_ids: ["drift-1"],
                mitigation: "Reconcile implementation with plan coverage",
              },
            ],
      adjudication: {
        mode,
        extractors: mode === "dual-extractor" ? ["extractor-a", "extractor-b"] : ["rule-based-drift-detector"],
        conflicts_resolved: mode === "dual-extractor" ? 1 : 0,
        resolution_policy:
          mode === "dual-extractor"
            ? "adjudicated dual extractor conflict policy"
            : "keyword overlap deterministic thresholds",
      },
    });
  }

  if (phase === "build") {
    return withContext({
      trace_id: "build-trace-1",
      summary: "Build phase executed by runner",
      outputs: ["scripts/pipeline/runner.mjs", "scripts/pipeline/lib/policy.mjs"],
      covers_requirement_ids: [requirements[0]],
    });
  }

  if (phase === "quality-static") {
    return withContext({
      audit_type: "static",
      violations: [],
      summary: { pass: 1, warn: 0, fail: 0, open: 0, fixed: 0, accepted_risk: 0 },
    });
  }

  if (phase === "quality-tests") {
    return withContext({
      audit_type: "tests",
      violations: [],
      summary: { pass: 1, warn: 0, fail: 0, open: 0, fixed: 0, accepted_risk: 0 },
    });
  }

  if (phase === "release-readiness") {
    return withContext({
      release_decision: "go",
      semver_impact: "minor",
      changelog: {
        updated: true,
        path: "README.md",
        entries: ["Runner and evaluation harness upgraded"],
      },
      migration: {
        required: false,
        validated: true,
      },
      rollback: {
        strategy: "revert runner changes",
        owner: "platform",
        tested: true,
      },
      open_risks: [],
      approvals: [{ owner: "release-lead", approved_at: now, notes: "automated taskset run" }],
    });
  }

  return null;
}

function runQualityGate(input) {
  const root = getRepoRoot();
  const gateEntry = resolve(root, "skills/dev-tools/quality-gate/dist/index.js");
  if (!existsSync(gateEntry)) {
    const err = new Error(
      "quality-gate dist entrypoint missing. Run npm run build in skills/dev-tools/quality-gate.",
    );
    err.code = "E_QUALITY_GATE_MISSING";
    throw err;
  }

  const proc = spawnSync("node", [gateEntry], {
    cwd: root,
    input: JSON.stringify(input),
    encoding: "utf8",
    env: {
      ...process.env,
      WORKSPACE_ROOT: root,
    },
  });

  const rawOut = proc.stdout || proc.stderr;
  if (!rawOut) {
    const err = new Error("quality-gate returned empty output");
    err.code = "E_QUALITY_GATE_EMPTY";
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawOut);
  } catch (error) {
    const err = new Error(`quality-gate returned invalid JSON: ${String(error)}`);
    err.code = "E_QUALITY_GATE_PARSE";
    throw err;
  }

  if (proc.status !== 0 || !parsed.success) {
    const err = new Error(parsed?.error?.message || "quality-gate execution failed");
    err.code = parsed?.error?.code || "E_QUALITY_GATE_FAILED";
    throw err;
  }

  return parsed.data;
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

function gateStatusRank(status) {
  if (status === "fail") return 3;
  if (status === "warn") return 2;
  return 1;
}

function assertGateStatus(status, source = "status") {
  if (!GATE_STATUS_SET.has(status)) {
    throw badInput(`${source} must be one of: pass, warn, fail`);
  }
}

function resolveGateOutputPath(runDir, gateFileName) {
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

function worstStatus(...statuses) {
  return [...statuses]
    .filter(Boolean)
    .sort((a, b) => gateStatusRank(b) - gateStatusRank(a))[0] ?? "pass";
}

function emitGate({
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

function updateStateAfterArtifact(state, phase, artifactRef) {
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

function readPhaseGate(runId, phase) {
  const gatePath = resolve(getRunDir(runId), "gates", gateFileNameForPhase(phase));
  return readJson(gatePath, null);
}

function emitRetryEventIfNeeded(runId, phase) {
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

function evaluateContextBudgetGate({ runId, phase, artifact, artifactRef, schemaRef, state }) {
  const budget = contextBudgetForPhase(phaseTokenForContextBudget(phase), state);
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

function evaluateTraceabilityGate({ runId, phase, state }) {
  const flags = state?.config?.feature_flags ?? {};
  const enforce = parseBooleanFlag(flags.traceability_v1);

  const briefRef = state?.artifacts?.brief ?? "brief.json";
  const planRef = state?.artifacts?.plan ?? "plan.json";
  const designRef = state?.artifacts?.design ?? "design.json";
  const driftRef = Array.isArray(state?.artifacts?.drift_reports)
    ? state.artifacts.drift_reports[state.artifacts.drift_reports.length - 1]
    : null;
  const briefAbs = resolveArtifactRefForRun(runId, briefRef);
  const planAbs = resolveArtifactRefForRun(runId, planRef);
  const designAbs = resolveOptionalArtifactRefForRun(runId, designRef);
  const driftAbs = resolveOptionalArtifactRefForRun(runId, driftRef);

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

function runPolicyDecision({ runId, phase, state, stageProfile, requestedFanoutOverride }) {
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

function stageGateInput({ phase, artifact, artifactRef, schemaRef }) {
  return {
    artifact,
    artifact_ref: artifactRef,
    schema_ref: schemaRef,
    phase,
    criteria: [],
  };
}

function gateStatusFromPhaseAndProfile(phase, stageProfile) {
  if (typeof stageProfile.gate_status === "string") {
    return stageProfile.gate_status;
  }
  if (phase === "post-build") {
    return "pass";
  }
  return "pass";
}

function runStartPhase(options) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");

  const state = loadPipelineState();
  ensureStateForRun(state, runId);
  appendRunStartIfMissing(runId, state);
  emitRetryEventIfNeeded(runId, phase);

  appendTraceEvent(runId, {
    event: "phase_start",
    phase,
    status: "ok",
  });

  state.current_phase = phase;
  savePipelineState(state);

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, phase, event: "phase_start" }, null, 2)}\n`);
}

function runEndPhase(options) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");
  const status = options.status || "ok";
  if (!PHASE_END_STATUS_SET.has(status)) {
    throw badInput("--status must be one of: ok, error");
  }

  appendTraceEvent(runId, {
    event: "phase_end",
    phase,
    status,
  });

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, phase, event: "phase_end", status }, null, 2)}\n`);
}

function runRecordArtifact(options) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");
  const artifactRef = requireOption(options, "artifact-ref");
  const requestedAction = options.action || "write";
  if (!ARTIFACT_ACTION_SET.has(requestedAction)) {
    throw badInput("--action must be one of: read, write");
  }
  const action = requestedAction === "read" ? "artifact_read" : "artifact_write";

  appendTraceEvent(runId, {
    event: action,
    phase,
    artifact_ref: artifactRef,
    status: "ok",
  });

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, phase, event: action, artifact_ref: artifactRef }, null, 2)}\n`);
}

function runRecordGate(options) {
  const runId = requireOption(options, "run-id");
  const phase = requireOption(options, "phase");
  assertKnownPhase(phase, "--phase");
  const status = requireOption(options, "status");
  assertGateStatus(status, "--status");
  const gateId = options["gate-id"] || `${phase}-gate`;
  const artifactRef = options["artifact-ref"] || "n/a";

  const gate = emitGate({
    runId,
    phase,
    gateId,
    status,
    artifactRef,
    criteria: [],
    blockingFailures: status === "fail" ? [gateId] : [],
    metadata: {
      source: "record-gate",
    },
    gateFileOverride: options["gate-file"],
  });

  process.stdout.write(`${JSON.stringify({ success: true, run_id: runId, gate }, null, 2)}\n`);
}

function runSummarizeRun(options) {
  const runId = requireOption(options, "run-id");
  const format = options.format || "json";
  if (!SUMMARY_FORMATS.has(format)) {
    throw badInput("--format must be one of: json, text, markdown");
  }
  const outputRef = options.output;
  const root = getRepoRoot();
  const state = loadPipelineState();
  ensureStateForRun(state, runId);
  appendRunStartIfMissing(runId, state);
  appendRunEndIfMissing(runId, state);
  const summary = summarizeRun(runId, root);
  savePipelineState(state);

  const jsonPayload = { success: true, run_id: runId, summary };

  const renderText = () => {
    const gatePass = summary.gate_results?.pass ?? 0;
    const gateFail = summary.gate_results?.fail ?? 0;
    const gateWarn = summary.gate_results?.warn ?? 0;
    const issues = Array.isArray(summary.issues) ? summary.issues : [];
    const phaseDurations = summary.phase_durations_ms ?? {};
    const phaseLines = PHASES.filter((phase) => phaseDurations[phase] !== undefined).map(
      (phase) => `  - ${phase}: ${phaseDurations[phase]} ms`,
    );

    return [
      `Run summary: ${runId}`,
      `valid: ${summary.valid ? "true" : "false"}`,
      `events: ${summary.total_events ?? 0}`,
      `gates: pass=${gatePass} warn=${gateWarn} fail=${gateFail}`,
      `duration_s: ${summary.total_duration_s ?? 0}`,
      `cost_usd: ${summary.total_cost_usd ?? 0}`,
      `tokens: in=${summary.total_tokens_in ?? 0} out=${summary.total_tokens_out ?? 0}`,
      issues.length > 0 ? `issues (${issues.length}):` : "issues: none",
      ...(issues.length > 0 ? issues.map((issue) => `  - ${issue}`) : []),
      phaseLines.length > 0 ? "phase_durations_ms:" : "phase_durations_ms: none",
      ...phaseLines,
      "",
    ].join("\n");
  };

  const renderMarkdown = () => {
    const gatePass = summary.gate_results?.pass ?? 0;
    const gateFail = summary.gate_results?.fail ?? 0;
    const gateWarn = summary.gate_results?.warn ?? 0;
    const issues = Array.isArray(summary.issues) ? summary.issues : [];
    const phaseDurations = summary.phase_durations_ms ?? {};
    const phaseRows = PHASES.filter((phase) => phaseDurations[phase] !== undefined).map(
      (phase) => `| ${phase} | ${phaseDurations[phase]} |`,
    );

    return [
      `# Run Summary: ${runId}`,
      "",
      `- Valid: \`${summary.valid ? "true" : "false"}\``,
      `- Total events: \`${summary.total_events ?? 0}\``,
      `- Gates: pass=\`${gatePass}\`, warn=\`${gateWarn}\`, fail=\`${gateFail}\``,
      `- Duration (s): \`${summary.total_duration_s ?? 0}\``,
      `- Cost (USD): \`${summary.total_cost_usd ?? 0}\``,
      `- Tokens: in=\`${summary.total_tokens_in ?? 0}\`, out=\`${summary.total_tokens_out ?? 0}\``,
      "",
      "## Phase Durations",
      "",
      "| Phase | Duration (ms) |",
      "| --- | ---: |",
      ...(phaseRows.length > 0 ? phaseRows : ["| (none) | 0 |"]),
      "",
      "## Issues",
      "",
      ...(issues.length > 0 ? issues.map((issue) => `- ${issue}`) : ["- None"]),
      "",
    ].join("\n");
  };

  let rendered = "";
  if (format === "text") {
    rendered = renderText();
  } else if (format === "markdown") {
    rendered = renderMarkdown();
  }

  let outputPath;
  if (outputRef) {
    const outputAbs = resolveWithinRepo(outputRef, root);
    mkdirSync(dirname(outputAbs), { recursive: true });
    if (format === "json") {
      writeFileSync(outputAbs, `${JSON.stringify(jsonPayload, null, 2)}\n`, "utf8");
    } else {
      writeFileSync(outputAbs, rendered, "utf8");
    }
    outputPath = toWorkspaceRelative(outputAbs, root);
  }

  if (format === "json") {
    const payload = outputPath ? { ...jsonPayload, format, output_ref: outputPath } : jsonPayload;
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (outputPath) {
    process.stdout.write(
      `${JSON.stringify({ success: true, run_id: runId, format, output_ref: outputPath }, null, 2)}\n`,
    );
    return;
  }

  process.stdout.write(rendered);
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

  appendTraceEvent(runId, {
    event: "phase_start",
    phase,
    status: "ok",
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
      artifact = JSON.parse(readFileSync(inputAbs, "utf8"));
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
        artifact = JSON.parse(readFileSync(artifactAbs, "utf8"));
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

  if (artifact && contextBudgetForPhase(phaseTokenForContextBudget(phase), state)) {
    const budgetGate = evaluateContextBudgetGate({
      runId,
      phase,
      artifact,
      artifactRef: artifactRef || "n/a",
      schemaRef,
      state,
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

function printUsage() {
  process.stdout.write(`Usage: node scripts/pipeline/runner.mjs <command> [options]\n\n`);
  process.stdout.write(`Commands:\n`);
  process.stdout.write(`  start-phase   --run-id <id> --phase <phase>\n`);
  process.stdout.write(`  end-phase     --run-id <id> --phase <phase> [--status <ok|error>]\n`);
  process.stdout.write(`  record-artifact --run-id <id> --phase <phase> --artifact-ref <path> [--action <read|write>]\n`);
  process.stdout.write(`  record-gate   --run-id <id> --phase <phase> --status <pass|fail|warn> [--gate-id <id>]\n`);
  process.stdout.write(`  summarize-run --run-id <id> [--format <json|text|markdown>] [--output <path>]\n`);
  process.stdout.write(`  run-stage     --run-id <id> --phase <phase> [--taskset <path> --task-id <id> --config-id <id>]\n`);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  const options = parseOptions(rest);

  if (command === "start-phase") {
    runStartPhase(options);
    return;
  }
  if (command === "end-phase") {
    runEndPhase(options);
    return;
  }
  if (command === "record-artifact") {
    runRecordArtifact(options);
    return;
  }
  if (command === "record-gate") {
    runRecordGate(options);
    return;
  }
  if (command === "summarize-run") {
    runSummarizeRun(options);
    return;
  }
  if (command === "run-stage") {
    runStage(options);
    return;
  }

  throw badInput(`unknown command: ${command}`);
}

try {
  main();
} catch (error) {
  const code = error?.code || "E_UNKNOWN";
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${code}: ${message}\n`);
  process.exit(1);
}
