/**
 * Phase-specific artifact builders and defaults.
 */
import { nowIso } from "./trace.mjs";
import { toNumber, coalesce } from "./utils.mjs";

export const DEFAULT_SCHEMA_BY_PHASE = {
  arm: "contracts/artifacts/brief.schema.json",
  design: "contracts/artifacts/design-document.schema.json",
  "adversarial-review": "contracts/artifacts/review-report.schema.json",
  plan: "contracts/artifacts/execution-plan.schema.json",
  pmatch: "contracts/artifacts/drift-report.schema.json",
  "quality-static": "contracts/artifacts/quality-report.schema.json",
  "quality-tests": "contracts/artifacts/quality-report.schema.json",
  "release-readiness": "contracts/artifacts/release-readiness.schema.json",
};

export function phaseArtifactDefaults(phase) {
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

export function buildContextManifest({ phase, stageProfile, budget }) {
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

export function defaultRequirementIds(task) {
  const ids = Array.isArray(task?.must_requirement_ids)
    ? task.must_requirement_ids.filter((id) => typeof id === "string" && id.length > 0)
    : [];
  return ids.length > 0 ? ids : ["REQ-001"];
}

export function driftStatusForConfig(configId, stageProfile) {
  if (stageProfile.drift_status) return stageProfile.drift_status;
  if (configId === "baseline_single_agent") return "violated";
  if (configId === "phased_plus_reviewers") return "partial";
  if (configId === "phased_with_context_budgets") return "partial";
  if (configId === "phased_dual_extractor_drift") return "verified";
  return "partial";
}

export function buildArtifactForPhase({
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
