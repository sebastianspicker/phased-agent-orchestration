import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { getRepoRoot, resolveWithinRepo, toWorkspaceRelative } from "./state.mjs";

const REQUIRED_BY_PHASE = {
  plan: ["must-covered-by-plan-tasks", "must-covered-by-plan-tests"],
  build: [
    "must-covered-by-plan-tasks",
    "must-covered-by-plan-tests",
    "must-covered-by-drift-claims",
  ],
};

function badInput(message) {
  const err = new Error(message);
  err.code = "E_BAD_INPUT";
  return err;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueSortedStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))].sort();
}

function collectIdsFromList(entries, key) {
  const out = [];
  for (const entry of asArray(entries)) {
    const ids = asArray(entry?.[key]);
    for (const id of ids) {
      if (typeof id === "string" && id.length > 0) out.push(id);
    }
  }
  return out;
}

function extractMustRequirementIds(brief) {
  return uniqueSortedStrings(
    asArray(brief?.requirements)
      .filter((req) => req?.priority === "must")
      .map((req) => req?.id),
  );
}

function extractPlanTaskRequirementIds(plan) {
  const taskGroups = asArray(plan?.task_groups);
  const ids = [];
  for (const group of taskGroups) {
    const tasks = asArray(group?.tasks);
    for (const task of tasks) {
      ids.push(...collectIdsFromList([task], "covers_requirement_ids"));
    }
  }
  return uniqueSortedStrings(ids);
}

function extractPlanTestRequirementIds(plan) {
  const taskGroups = asArray(plan?.task_groups);
  const ids = [];
  for (const group of taskGroups) {
    const tasks = asArray(group?.tasks);
    for (const task of tasks) {
      ids.push(...collectIdsFromList(asArray(task?.test_cases), "covers_requirement_ids"));
    }
  }
  return uniqueSortedStrings(ids);
}

function extractDriftRequirementIds(drift) {
  return uniqueSortedStrings(collectIdsFromList(asArray(drift?.claims), "covers_requirement_ids"));
}

function extractDesignRequirementIds(design) {
  return uniqueSortedStrings(
    collectIdsFromList(asArray(design?.constraints_classification), "covers_requirement_ids"),
  );
}

function buildCoverageResult(name, sourceIds, targetIds, extra = {}) {
  const source = uniqueSortedStrings(sourceIds);
  const target = new Set(uniqueSortedStrings(targetIds));

  if (source.length === 0) {
    return {
      name,
      passed: true,
      evidence: "coverage=1.0000 threshold=1.0000 matched=0/0 missing=none",
      missing_ids: [],
      ...extra,
    };
  }

  const matched = source.filter((id) => target.has(id));
  const missing = source.filter((id) => !target.has(id)).sort();
  const coverage = matched.length / source.length;

  return {
    name,
    passed: missing.length === 0,
    evidence: `coverage=${coverage.toFixed(4)} threshold=1.0000 matched=${matched.length}/${source.length} missing=${missing.join(", ") || "none"}`,
    missing_ids: missing,
    ...extra,
  };
}

function runQualityGate(input, root) {
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
    encoding: "utf8",
    input: JSON.stringify(input),
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

function loadOptionalJson(ref, root) {
  if (!ref) {
    return { exists: false, data: null, rel: null };
  }
  const abs = resolveWithinRepo(ref, root);
  if (!existsSync(abs)) {
    return { exists: false, data: null, rel: toWorkspaceRelative(abs, root) };
  }
  return {
    exists: true,
    data: JSON.parse(readFileSync(abs, "utf8")),
    rel: toWorkspaceRelative(abs, root),
  };
}

function normalizeTraceabilityInput({
  mustRequirementIds,
  planTaskRequirementIds,
  planTestRequirementIds,
  driftRequirementIds,
  designRequirementIds,
  refs,
}) {
  const sources = {};
  if (typeof refs.brief_ref === "string" && refs.brief_ref.length > 0) {
    sources.brief_ref = refs.brief_ref;
  }
  if (typeof refs.plan_ref === "string" && refs.plan_ref.length > 0) {
    sources.plan_ref = refs.plan_ref;
  }
  if (typeof refs.drift_ref === "string" && refs.drift_ref.length > 0) {
    sources.drift_ref = refs.drift_ref;
  }
  if (typeof refs.design_ref === "string" && refs.design_ref.length > 0) {
    sources.design_ref = refs.design_ref;
  }

  return {
    must_requirement_ids: uniqueSortedStrings(mustRequirementIds),
    plan_task_requirement_ids: uniqueSortedStrings(planTaskRequirementIds),
    plan_test_requirement_ids: uniqueSortedStrings(planTestRequirementIds),
    drift_requirement_ids: uniqueSortedStrings(driftRequirementIds),
    design_requirement_ids: uniqueSortedStrings(designRequirementIds),
    sources,
  };
}

function parseRequiredCriteria(phase) {
  return REQUIRED_BY_PHASE[phase] ?? REQUIRED_BY_PHASE.plan;
}

export function evaluateMustTraceability({
  phase,
  enforce,
  briefRef,
  planRef,
  driftRef,
  designRef,
}) {
  const root = getRepoRoot();
  const briefPath = resolveWithinRepo(briefRef, root);
  const planPath = resolveWithinRepo(planRef, root);

  if (!existsSync(briefPath)) {
    throw badInput(`brief artifact not found: ${briefRef}`);
  }
  if (!existsSync(planPath)) {
    throw badInput(`plan artifact not found: ${planRef}`);
  }

  const brief = JSON.parse(readFileSync(briefPath, "utf8"));
  const executionPlan = JSON.parse(readFileSync(planPath, "utf8"));
  const drift = loadOptionalJson(driftRef, root);
  const design = loadOptionalJson(designRef, root);

  const normalized = normalizeTraceabilityInput({
    mustRequirementIds: extractMustRequirementIds(brief),
    planTaskRequirementIds: extractPlanTaskRequirementIds(executionPlan),
    planTestRequirementIds: extractPlanTestRequirementIds(executionPlan),
    driftRequirementIds: extractDriftRequirementIds(drift.data),
    designRequirementIds: extractDesignRequirementIds(design.data),
    refs: {
      brief_ref: toWorkspaceRelative(briefPath, root),
      plan_ref: toWorkspaceRelative(planPath, root),
      drift_ref: drift.rel,
      design_ref: design.rel,
    },
  });

  const schemaGate = runQualityGate(
    {
      artifact: normalized,
      artifact_ref: toWorkspaceRelative(planPath, root),
      schema_ref: "contracts/artifacts/traceability-check.schema.json",
      phase,
      criteria: [],
    },
    root,
  );

  const criteria = [
    buildCoverageResult(
      "must-covered-by-plan-tasks",
      normalized.must_requirement_ids,
      normalized.plan_task_requirement_ids,
    ),
    buildCoverageResult(
      "must-covered-by-plan-tests",
      normalized.must_requirement_ids,
      normalized.plan_test_requirement_ids,
    ),
    buildCoverageResult(
      "must-covered-by-drift-claims",
      normalized.must_requirement_ids,
      normalized.drift_requirement_ids,
      {
        evidence_suffix: drift.exists ? undefined : " (drift artifact missing)",
      },
    ),
    buildCoverageResult(
      "must-covered-by-design",
      normalized.must_requirement_ids,
      normalized.design_requirement_ids,
      {
        evidence_suffix: design.exists ? undefined : " (design artifact missing)",
      },
    ),
  ].map((entry) => ({
    name: entry.name,
    passed: entry.passed,
    evidence:
      typeof entry.evidence_suffix === "string" && entry.evidence_suffix.length > 0
        ? `${entry.evidence}${entry.evidence_suffix}`
        : entry.evidence,
    missing_ids: entry.missing_ids,
  }));

  const requiredCriteria = new Set(parseRequiredCriteria(phase));
  const requiredFailures = criteria
    .filter((criterion) => requiredCriteria.has(criterion.name) && !criterion.passed)
    .map((criterion) => criterion.name);

  const warningFailures = criteria
    .filter((criterion) => !requiredCriteria.has(criterion.name) && !criterion.passed)
    .map((criterion) => criterion.name);

  const schemaInvalid = !schemaGate.schema_validation.valid;

  let status = "pass";
  if (enforce) {
    if (schemaInvalid || requiredFailures.length > 0) status = "fail";
    else if (warningFailures.length > 0) status = "warn";
  } else {
    if (schemaInvalid || requiredFailures.length > 0 || warningFailures.length > 0) status = "warn";
  }

  const blockingFailures =
    enforce && status === "fail"
      ? [
          ...(schemaInvalid ? ["traceability-schema-valid"] : []),
          ...requiredFailures,
        ]
      : [];

  const missingByCriterion = criteria
    .filter((criterion) => criterion.missing_ids.length > 0)
    .reduce((acc, criterion) => {
      acc[criterion.name] = [...criterion.missing_ids].sort();
      return acc;
    }, {});

  const missingRequirementIds = uniqueSortedStrings(
    Object.values(missingByCriterion)
      .flatMap((ids) => ids)
      .filter((id) => typeof id === "string"),
  );

  return {
    gate: {
      gate_id: `${phase}-traceability-gate`,
      phase,
      status,
      criteria: criteria.map(({ name, passed, evidence }) => ({ name, passed, evidence })),
      blocking_failures: blockingFailures,
      artifact_ref: toWorkspaceRelative(planPath, root),
      schema_validation: schemaGate.schema_validation,
    },
    normalized,
    required_failures: requiredFailures,
    warning_failures: warningFailures,
    missing_by_criterion: missingByCriterion,
    missing_requirement_ids: missingRequirementIds,
    refs: {
      brief_ref: toWorkspaceRelative(briefPath, root),
      plan_ref: toWorkspaceRelative(planPath, root),
      drift_ref: drift.rel,
      design_ref: design.rel,
    },
  };
}
