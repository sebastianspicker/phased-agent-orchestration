import { readFileSync } from "node:fs";
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

export function validateInput(input: Input): void {
  if (!input?.action?.type || !["review", "drift-detect"].includes(input.action.type)) {
    throw Object.assign(new Error("action.type must be 'review' or 'drift-detect'"), {
      code: "E_BAD_INPUT",
    });
  }
  if (!input?.document?.content || typeof input.document.content !== "string") {
    throw Object.assign(new Error("document.content is required"), { code: "E_BAD_INPUT" });
  }
  if (!input?.document?.type || !["design", "plan", "implementation"].includes(input.document.type)) {
    throw Object.assign(new Error("document.type must be design, plan, or implementation"), {
      code: "E_BAD_INPUT",
    });
  }

  if (input.action.type === "review") {
    if (!Array.isArray(input.reviewer_findings) || input.reviewer_findings.length === 0) {
      throw Object.assign(new Error("reviewer_findings must be a non-empty array for review action"), {
        code: "E_BAD_INPUT",
      });
    }
    return;
  }

  if (!input.drift_config?.target_ref || typeof input.drift_config.target_ref !== "string") {
    throw Object.assign(new Error("drift_config.target_ref is required for drift-detect action"), {
      code: "E_BAD_INPUT",
    });
  }
  const driftMode: DriftMode = input.drift_config.mode ?? "heuristic";
  if (!["heuristic", "dual-extractor"].includes(driftMode)) {
    throw Object.assign(new Error("drift_config.mode must be 'heuristic' or 'dual-extractor'"), {
      code: "E_BAD_INPUT",
    });
  }
  if (driftMode === "dual-extractor") {
    const claimSets = input.drift_config.extractor_claim_sets;
    if (!Array.isArray(claimSets) || claimSets.length !== 2) {
      throw Object.assign(new Error("drift_config.extractor_claim_sets must contain exactly 2 claim sets in dual-extractor mode"), {
        code: "E_BAD_INPUT",
      });
    }
    for (const claimSet of claimSets) {
      if (!claimSet?.extractor || typeof claimSet.extractor !== "string") {
        throw Object.assign(new Error("Each extractor_claim_set requires a non-empty extractor string"), {
          code: "E_BAD_INPUT",
        });
      }
      if (!Array.isArray(claimSet.claims) || claimSet.claims.length === 0) {
        throw Object.assign(new Error("Each extractor_claim_set requires a non-empty claims array"), {
          code: "E_BAD_INPUT",
        });
      }
      for (const claim of claimSet.claims) {
        if (!claim?.id || !claim?.claim || !claim?.verification_status || !claim?.evidence) {
          throw Object.assign(new Error("Each extractor claim must include id, claim, verification_status, and evidence"), {
            code: "E_BAD_INPUT",
          });
        }
      }
    }
  }
  if (!["design", "plan"].includes(input.document.type)) {
    throw Object.assign(new Error("drift-detect requires document.type to be design or plan"), {
      code: "E_BAD_INPUT",
    });
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

function readTargetDocument(targetRef: string, logs: string[]): string {
  try {
    return readFileSync(targetRef, "utf8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logs.push(`Could not read target_ref "${targetRef}": ${msg}`);
    throw Object.assign(new Error(`Could not read target_ref "${targetRef}": ${msg}`), {
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
    logs.push(`Processing findings from reviewer: ${rf.reviewer_id} (${rf.role}), ${rf.findings.length} findings`);
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

export function runDriftDetect(input: Input, logs: string[]): DriftData {
  const sourceType = input.document.type as "design" | "plan";
  const sourceText = input.document.content;
  const driftConfig = input.drift_config as DriftConfig;
  const targetRef = driftConfig.target_ref as string;
  const driftMode: DriftMode = driftConfig.mode ?? "heuristic";

  // Keep existing behavior: drift-detect fails when target_ref cannot be read.
  const targetText = readTargetDocument(targetRef, logs);
  let detected;
  if (driftMode === "dual-extractor") {
    logs.push("Using dual-extractor drift adjudication mode");
    detected = detectDriftFromExtractorClaims(driftConfig.extractor_claim_sets as ExtractorClaimSet[]);
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
