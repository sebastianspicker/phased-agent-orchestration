import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import type {
  DedupFinding,
  DriftConfig,
  DriftData,
  DriftMode,
  FactCheckEntry,
  Input,
  ExtractorClaimSet,
  MitigationEntry,
  ReviewData,
  ReviewerSummary,
} from "../types.js";
import type { ReviewerFindings } from "./models/types.js";
import { deduplicateFindings, type TaggedFinding } from "./dedup.js";
import { analyzeCostBenefit } from "./cost-benefit.js";
import { detectDrift, detectDriftFromExtractorClaims } from "./drift.js";

const REVIEW_SEVERITIES = new Set(["critical", "high", "medium", "low", "info"]);
const DRIFT_VERIFICATION_STATUSES = new Set(["verified", "violated", "partial", "unverifiable"]);
const DRIFT_CLAIM_TYPES = new Set(["interface", "invariant", "security", "performance", "docs"]);

function badInput(message: string): Error {
  return Object.assign(new Error(message), { code: "E_BAD_INPUT" });
}

interface RunDriftDetectOptions {
  workspaceRoot?: string;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNoUnexpectedProperties(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  context: string,
): void {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw badInput(`Unexpected property "${key}" in ${context}`);
    }
  }
}

function validateExtractorClaimSets(claimSets: unknown): void {
  if (!Array.isArray(claimSets) || claimSets.length !== 2) {
    throw badInput(
      "drift_config.extractor_claim_sets must contain exactly 2 claim sets in dual-extractor mode",
    );
  }
  for (const claimSet of claimSets) {
    if (!isObjectRecord(claimSet)) {
      throw badInput("Each extractor_claim_set must be an object");
    }
    assertNoUnexpectedProperties(claimSet, ["extractor", "claims"], "extractor_claim_set");
    if (typeof claimSet.extractor !== "string" || claimSet.extractor.length === 0) {
      throw badInput("Each extractor_claim_set requires a non-empty extractor string");
    }
    if (!Array.isArray(claimSet.claims) || claimSet.claims.length === 0) {
      throw badInput("Each extractor_claim_set requires a non-empty claims array");
    }
    for (const claim of claimSet.claims) {
      if (!isObjectRecord(claim)) {
        throw badInput("Each extractor claim must be an object");
      }
      assertNoUnexpectedProperties(
        claim,
        ["id", "claim", "claim_type", "verification_status", "evidence", "confidence"],
        "extractor claim",
      );
      if (typeof claim.id !== "string" || claim.id.length === 0) {
        throw badInput("Each extractor claim must include a non-empty id");
      }
      if (typeof claim.claim !== "string" || claim.claim.length === 0) {
        throw badInput("Each extractor claim must include a non-empty claim");
      }
      if (
        typeof claim.verification_status !== "string" ||
        !DRIFT_VERIFICATION_STATUSES.has(claim.verification_status)
      ) {
        throw badInput(
          "Each extractor claim verification_status must be one of: verified, violated, partial, unverifiable",
        );
      }
      if (
        claim.claim_type !== undefined &&
        (typeof claim.claim_type !== "string" || !DRIFT_CLAIM_TYPES.has(claim.claim_type))
      ) {
        throw badInput(
          "Each extractor claim claim_type must be one of: interface, invariant, security, performance, docs",
        );
      }
      if (typeof claim.evidence !== "string" || claim.evidence.length === 0) {
        throw badInput("Each extractor claim must include non-empty evidence");
      }
      if (
        claim.confidence !== undefined &&
        (typeof claim.confidence !== "number" || claim.confidence < 0 || claim.confidence > 1)
      ) {
        throw badInput("extractor claim confidence must be a number between 0 and 1");
      }
    }
  }
}

function validateReviewerFindings(reviewerFindings: unknown): void {
  if (!Array.isArray(reviewerFindings)) {
    throw badInput("reviewer_findings must be an array when provided");
  }
  if (reviewerFindings.length === 0) {
    throw badInput("reviewer_findings must be a non-empty array when provided");
  }

  for (const reviewer of reviewerFindings) {
    if (!isObjectRecord(reviewer)) {
      throw badInput("Each reviewer_findings entry must be an object");
    }
    assertNoUnexpectedProperties(
      reviewer,
      ["reviewer_id", "role", "findings"],
      "reviewer_findings entry",
    );
    if (typeof reviewer.reviewer_id !== "string" || reviewer.reviewer_id.length === 0) {
      throw badInput("Each reviewer_findings entry requires reviewer_id");
    }
    if (typeof reviewer.role !== "string" || reviewer.role.length === 0) {
      throw badInput("Each reviewer_findings entry requires role");
    }
    if (!Array.isArray(reviewer.findings)) {
      throw badInput("Each reviewer_findings entry requires a findings array");
    }
    if (reviewer.findings.length === 0) {
      throw badInput("Each reviewer_findings entry requires a non-empty findings array");
    }
    for (const finding of reviewer.findings) {
      if (!isObjectRecord(finding)) {
        throw badInput("Each reviewer finding must be an object");
      }
      assertNoUnexpectedProperties(
        finding,
        ["id", "category", "description", "severity", "evidence", "suggestion"],
        "reviewer finding",
      );
      if (typeof finding.id !== "string" || finding.id.length === 0) {
        throw badInput("Each reviewer finding must include a non-empty id");
      }
      if (typeof finding.category !== "string" || finding.category.length === 0) {
        throw badInput("Each reviewer finding must include a non-empty category");
      }
      if (typeof finding.description !== "string" || finding.description.length === 0) {
        throw badInput("Each reviewer finding must include a non-empty description");
      }
      if (typeof finding.severity !== "string" || !REVIEW_SEVERITIES.has(finding.severity)) {
        throw badInput(
          "Each reviewer finding severity must be one of: critical, high, medium, low, info",
        );
      }
      if (finding.evidence !== undefined && typeof finding.evidence !== "string") {
        throw badInput("Each reviewer finding evidence must be a string when provided");
      }
      if (finding.suggestion !== undefined && typeof finding.suggestion !== "string") {
        throw badInput("Each reviewer finding suggestion must be a string when provided");
      }
    }
  }
}

function validateDriftConfig(
  driftConfig: unknown,
): { targetRef?: string; driftMode: DriftMode; hasExtractorClaimSets: boolean } | undefined {
  if (driftConfig === undefined) {
    return undefined;
  }
  if (!isObjectRecord(driftConfig)) {
    throw badInput("drift_config must be an object when provided");
  }
  assertNoUnexpectedProperties(
    driftConfig,
    ["source_ref", "target_ref", "mode", "extractor_claim_sets"],
    "drift_config",
  );

  let targetRef: string | undefined;
  if ("target_ref" in driftConfig) {
    if (typeof driftConfig.target_ref !== "string") {
      throw badInput("drift_config.target_ref must be a string when provided");
    }
    if (driftConfig.target_ref.length > 0 && path.isAbsolute(driftConfig.target_ref)) {
      throw badInput("drift_config.target_ref must resolve within workspaceRoot");
    }
    targetRef = driftConfig.target_ref;
  }
  if (driftConfig.source_ref !== undefined && typeof driftConfig.source_ref !== "string") {
    throw badInput("drift_config.source_ref must be a string when provided");
  }

  const driftModeRaw = driftConfig.mode;
  if (
    driftModeRaw !== undefined &&
    driftModeRaw !== "heuristic" &&
    driftModeRaw !== "dual-extractor"
  ) {
    throw badInput("drift_config.mode must be 'heuristic' or 'dual-extractor'");
  }
  const driftMode: DriftMode = driftModeRaw ?? "heuristic";

  const hasExtractorClaimSets = driftConfig.extractor_claim_sets !== undefined;
  if (hasExtractorClaimSets) {
    validateExtractorClaimSets(driftConfig.extractor_claim_sets);
  }

  return { targetRef, driftMode, hasExtractorClaimSets };
}

export function validateInput(input: Input): void {
  if (!isObjectRecord(input)) {
    throw badInput("input must be a JSON object");
  }
  assertNoUnexpectedProperties(
    input,
    ["action", "document", "reviewer_findings", "drift_config"],
    "input",
  );

  if (!isObjectRecord(input.action)) {
    throw badInput("action must be an object");
  }
  assertNoUnexpectedProperties(input.action, ["type"], "action");
  if (!input.action.type || !["review", "drift-detect"].includes(input.action.type)) {
    throw badInput("action.type must be 'review' or 'drift-detect'");
  }

  if (!isObjectRecord(input.document)) {
    throw badInput("document must be an object");
  }
  assertNoUnexpectedProperties(input.document, ["content", "type"], "document");
  if (!input.document.content || typeof input.document.content !== "string") {
    throw badInput("document.content is required");
  }
  if (
    !input?.document?.type ||
    !["design", "plan", "implementation"].includes(input.document.type)
  ) {
    throw badInput("document.type must be design, plan, or implementation");
  }

  if (input.reviewer_findings !== undefined) {
    validateReviewerFindings(input.reviewer_findings);
  }
  const validatedDriftConfig = validateDriftConfig(input.drift_config);

  if (input.action.type === "review") {
    if (input.reviewer_findings === undefined) {
      throw badInput("reviewer_findings must be a non-empty array for review action");
    }
    return;
  }

  if (!validatedDriftConfig) {
    throw badInput("drift_config.target_ref is required for drift-detect action");
  }
  if (!validatedDriftConfig.targetRef) {
    throw badInput("drift_config.target_ref is required for drift-detect action");
  }
  if (
    validatedDriftConfig.driftMode === "dual-extractor" &&
    !validatedDriftConfig.hasExtractorClaimSets
  ) {
    throw badInput(
      "drift_config.extractor_claim_sets must contain exactly 2 claim sets in dual-extractor mode",
    );
  }
  if (!["design", "plan"].includes(input.document.type)) {
    throw badInput("drift-detect requires document.type to be design or plan");
  }
}

function buildFactChecks(findings: DedupFinding[]): FactCheckEntry[] {
  const factChecks: FactCheckEntry[] = [];
  for (const finding of findings) {
    factChecks.push({
      finding_id: finding.id,
      status: "inconclusive",
      evidence: `Pending lead verification; reported by: ${finding.source_models.join(", ")}`,
    });
  }
  return factChecks;
}

function inferTargetType(sourceType: "design" | "plan"): "plan" | "implementation" {
  return sourceType === "design" ? "plan" : "implementation";
}

function resolveTargetPath(workspaceRoot: string, targetRef: string): string {
  if (path.isAbsolute(targetRef)) {
    throw badInput("drift_config.target_ref must resolve within workspaceRoot");
  }

  const root = realpathSync(path.resolve(workspaceRoot));
  const resolved = path.resolve(root, targetRef);
  const rel = path.relative(root, resolved);

  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw badInput("drift_config.target_ref must resolve within workspaceRoot");
  }

  try {
    const resolvedReal = realpathSync(resolved);
    const resolvedRel = path.relative(root, resolvedReal);
    if (resolvedRel.startsWith("..") || path.isAbsolute(resolvedRel)) {
      throw badInput("drift_config.target_ref must resolve within workspaceRoot");
    }
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code !== "ENOENT") {
      throw err;
    }
  }

  return resolved;
}

function readTargetDocument(targetRef: string, logs: string[]): string {
  try {
    return readFileSync(targetRef, "utf8");
  } catch {
    logs.push("Could not read target_ref");
    throw Object.assign(new Error("Could not read target_ref"), {
      code: "E_TARGET_READ",
    });
  }
}

export function runReview(input: Input, logs: string[]): ReviewData {
  const reviewerFindings = input.reviewer_findings as ReviewerFindings[];
  const taggedFindings: TaggedFinding[] = [];
  const reviewers: ReviewerSummary[] = [];

  for (const rf of reviewerFindings) {
    reviewers.push({
      model_id: rf.reviewer_id,
      findings: rf.findings,
    });
    logs.push(
      `Processing findings from reviewer: ${rf.reviewer_id} (${rf.role}), ${rf.findings.length} findings`,
    );
    for (const f of rf.findings) {
      taggedFindings.push({ ...f, _source: rf.reviewer_id });
    }
  }

  const deduplicated = deduplicateFindings(taggedFindings);
  const costBenefit = analyzeCostBenefit(deduplicated);
  const factChecks = buildFactChecks(deduplicated);
  const mitigations: MitigationEntry[] = [];
  const remainingUnmitigated = deduplicated.map((f) => f.id);

  logs.push(`Deduplicated ${taggedFindings.length} findings into ${deduplicated.length}`);

  return {
    reviewers,
    deduplicated_findings: deduplicated,
    fact_checks: factChecks,
    cost_benefit: costBenefit,
    mitigations,
    iteration: {
      loop_count: 1,
      remaining_unmitigated: remainingUnmitigated,
    },
  };
}

export function runDriftDetect(
  input: Input,
  logs: string[],
  opts: RunDriftDetectOptions = {},
): DriftData {
  const sourceType = input.document.type as "design" | "plan";
  const sourceText = input.document.content;
  const driftConfig = input.drift_config as DriftConfig;
  const targetRef = driftConfig.target_ref as string;
  const workspaceRoot = opts.workspaceRoot ?? "/workspace";
  const driftMode: DriftMode = driftConfig.mode ?? "heuristic";
  const targetPath = resolveTargetPath(workspaceRoot, targetRef);

  // Keep existing behavior: drift-detect fails when target_ref cannot be read.
  const targetText = readTargetDocument(targetPath, logs);
  let detected;
  if (driftMode === "dual-extractor") {
    logs.push("Using dual-extractor drift adjudication mode");
    detected = detectDriftFromExtractorClaims(
      driftConfig.extractor_claim_sets as ExtractorClaimSet[],
    );
  } else {
    logs.push("Using heuristic drift detection mode");
    detected = detectDrift(sourceText, targetText);
  }

  return {
    source_document: {
      type: sourceType,
      ref: driftConfig.source_ref ?? "inline:document.content",
    },
    target_document: {
      type: inferTargetType(sourceType),
      ref: targetRef,
    },
    claims: detected.claims,
    findings: detected.findings,
    adjudication: detected.adjudication,
  };
}
