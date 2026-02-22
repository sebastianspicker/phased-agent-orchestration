import type {
  DriftAdjudication,
  DriftClaim,
  DriftFinding,
  DriftVerificationStatus,
  ExtractorClaimInput,
  ExtractorClaimSet,
} from "../types.js";

interface Section {
  heading: string;
  body: string;
  synthetic?: boolean;
}

export interface DriftDetectionResult {
  claims: DriftClaim[];
  findings: DriftFinding[];
  adjudication: DriftAdjudication;
}

interface CorrelationPair {
  first: ExtractorClaimInput;
  second?: ExtractorClaimInput;
}

/**
 * Splits a document into sections by markdown-style headings.
 * Lines starting with # are section boundaries.
 */
function parseSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: headingMatch[1]!.trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    }
  }
  if (current) sections.push(current);

  // Fallback for plain-text documents that do not use markdown headings.
  if (sections.length === 0 && text.trim().length > 0) {
    sections.push({
      heading: "Document",
      body: text,
      synthetic: true,
    });
  }

  return sections;
}

/**
 * Extracts key assertions from a section body.
 * Looks for: bullet points, bold text, constraint keywords.
 */
function extractAssertions(body: string): string[] {
  const assertions: string[] = [];
  const lines = body.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = /^[-*•]\s+/.test(trimmed);
    const isNumbered = /^\d+[.)]\s+/.test(trimmed);
    const hasKeyword =
      /\b(must|shall|should|requires?|constraint|ensures?|guarantees?|limit)\b/i.test(trimmed);

    if (isBullet || isNumbered || hasKeyword) {
      assertions.push(trimmed.replace(/^[-*•\d.)]+\s*/, "").trim());
    }
  }

  return assertions.filter((a) => a.length > 5);
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates significant keyword overlap score between claim and target.
 */
function claimMatchScore(claim: string, targetText: string): number {
  const claimWords = normalize(claim)
    .split(" ")
    .filter((w) => w.length > 2);
  if (claimWords.length === 0) return -1;

  const targetNorm = normalize(targetText);
  let hits = 0;
  for (const w of claimWords) {
    if (targetNorm.includes(w)) hits++;
  }
  return hits / claimWords.length;
}

function tokenSimilarity(a: string, b: string): number {
  const tokA = new Set(
    normalize(a)
      .split(" ")
      .filter((t) => t.length > 1),
  );
  const tokB = new Set(
    normalize(b)
      .split(" ")
      .filter((t) => t.length > 1),
  );
  if (tokA.size === 0 && tokB.size === 0) return 1;
  if (tokA.size === 0 || tokB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokA) {
    if (tokB.has(token)) intersection++;
  }
  const union = tokA.size + tokB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function toVerificationStatus(score: number): DriftVerificationStatus {
  if (score < 0) return "unverifiable";
  if (score >= 0.6) return "verified";
  if (score >= 0.35) return "partial";
  return "violated";
}

function findingSeverity(status: DriftVerificationStatus): DriftFinding["severity"] {
  if (status === "violated") return "high";
  if (status === "partial" || status === "unverifiable") return "medium";
  return "low";
}

function buildFindingsFromClaims(claims: DriftClaim[]): DriftFinding[] {
  const findings: DriftFinding[] = [];
  for (const claim of claims) {
    if (claim.verification_status === "verified") continue;
    findings.push({
      description: `Claim is ${claim.verification_status}: "${claim.claim}"`,
      severity: findingSeverity(claim.verification_status),
      claim_ids: [claim.id],
      mitigation:
        "Verify this requirement is addressed in the target artifact and update implementation or plan accordingly.",
    });
  }
  return findings;
}

function correlateClaims(
  first: ExtractorClaimSet,
  second: ExtractorClaimSet,
): { pairs: CorrelationPair[]; unmatchedSecond: ExtractorClaimInput[] } {
  const pairs: CorrelationPair[] = [];
  const usedSecond = new Set<number>();
  const minSimilarity = 0.55;

  for (const left of first.claims) {
    let bestIdx = -1;
    let bestScore = 0;
    for (let idx = 0; idx < second.claims.length; idx++) {
      if (usedSecond.has(idx)) continue;
      const right = second.claims[idx]!;
      const score = left.id === right.id ? 1 : tokenSimilarity(left.claim, right.claim);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
    if (bestIdx >= 0 && bestScore >= minSimilarity) {
      usedSecond.add(bestIdx);
      pairs.push({ first: left, second: second.claims[bestIdx] });
      continue;
    }
    pairs.push({ first: left });
  }

  const unmatchedSecond = second.claims.filter((_, idx) => !usedSecond.has(idx));
  return { pairs, unmatchedSecond };
}

function mergeConfidence(first?: number, second?: number): number | undefined {
  const hasFirst = typeof first === "number";
  const hasSecond = typeof second === "number";
  if (hasFirst && hasSecond) {
    return Number((((first as number) + (second as number)) / 2).toFixed(4));
  }
  if (hasFirst) return first;
  if (hasSecond) return second;
  return undefined;
}

function adjudicatePair(
  firstStatus: DriftVerificationStatus,
  secondStatus?: DriftVerificationStatus,
): { status: DriftVerificationStatus; conflict: boolean } {
  if (!secondStatus) {
    return { status: "unverifiable", conflict: false };
  }

  const hasVerified = firstStatus === "verified" || secondStatus === "verified";
  const hasViolated = firstStatus === "violated" || secondStatus === "violated";
  if (hasVerified && hasViolated) {
    return { status: "partial", conflict: true };
  }
  if (firstStatus === "verified" && secondStatus === "verified") {
    return { status: "verified", conflict: false };
  }
  if (hasViolated && !hasVerified) {
    return { status: "violated", conflict: false };
  }
  if (hasVerified) {
    return { status: "partial", conflict: false };
  }
  if (firstStatus === "partial" || secondStatus === "partial") {
    return { status: "partial", conflict: false };
  }
  return { status: "unverifiable", conflict: false };
}

export function detectDrift(sourceText: string, targetText: string): DriftDetectionResult {
  const sourceSections = parseSections(sourceText);
  const claims: DriftClaim[] = [];
  const findings: DriftFinding[] = [];
  let claimIdx = 0;

  for (const section of sourceSections) {
    const assertions = extractAssertions(section.body);

    if (assertions.length === 0) {
      const sectionPresent = normalize(targetText).includes(normalize(section.heading));
      const id = `drift-${++claimIdx}`;
      const claimText = `Section "${section.heading}" should be present`;
      const verificationStatus: DriftVerificationStatus = sectionPresent ? "verified" : "violated";
      claims.push({
        id,
        claim: claimText,
        verification_status: verificationStatus,
        evidence: sectionPresent
          ? `Found section heading "${section.heading}" in target document`
          : `Source has heading "${section.heading}" but target does not`,
        extractor: "rule-based-drift-detector",
      });
      if (!sectionPresent) {
        findings.push({
          description: `Section "${section.heading}" from source is missing in target`,
          severity: "medium",
          claim_ids: [id],
          mitigation: `Add or address the "${section.heading}" section in the target document`,
        });
      }
      continue;
    }

    for (const assertion of assertions) {
      const id = `drift-${++claimIdx}`;
      const score = claimMatchScore(assertion, targetText);
      const verificationStatus = toVerificationStatus(score);

      claims.push({
        id,
        claim: assertion,
        verification_status: verificationStatus,
        evidence:
          verificationStatus === "verified"
            ? `Strong keyword overlap (${Math.round(score * 100)}%) in target`
            : `Claim from source section "${section.heading}" not fully reflected in target (overlap: ${score < 0 ? "n/a" : `${Math.round(score * 100)}%`})`,
        extractor: "rule-based-drift-detector",
      });

      if (verificationStatus !== "verified") {
        findings.push({
          description: `Assertion from "${section.heading}" is ${verificationStatus}: "${assertion}"`,
          severity: findingSeverity(verificationStatus),
          claim_ids: [id],
          mitigation:
            "Verify this requirement is addressed in the target artifact and update implementation or plan accordingly.",
        });
      }
    }
  }

  return {
    claims,
    findings,
    adjudication: {
      mode: "heuristic",
      extractors: ["rule-based-drift-detector"],
      conflicts_resolved: 0,
      resolution_policy: "Keyword-overlap heuristic with deterministic status mapping thresholds.",
    },
  };
}

export function detectDriftFromExtractorClaims(
  extractorClaimSets: ExtractorClaimSet[],
): DriftDetectionResult {
  if (extractorClaimSets.length !== 2) {
    throw Object.assign(new Error("dual-extractor mode requires exactly 2 extractor_claim_sets"), {
      code: "E_BAD_INPUT",
    });
  }

  const first = extractorClaimSets[0]!;
  const second = extractorClaimSets[1]!;
  const { pairs, unmatchedSecond } = correlateClaims(first, second);
  const claims: DriftClaim[] = [];
  let conflictsResolved = 0;
  let claimIdx = 0;

  for (const pair of pairs) {
    const adjudicated = adjudicatePair(
      pair.first.verification_status,
      pair.second?.verification_status,
    );
    if (adjudicated.conflict) {
      conflictsResolved++;
    }

    const claimText = pair.second
      ? pair.first.claim.length >= pair.second.claim.length
        ? pair.first.claim
        : pair.second.claim
      : pair.first.claim;
    const confidence = mergeConfidence(pair.first.confidence, pair.second?.confidence);
    claims.push({
      id: `drift-${++claimIdx}`,
      claim: claimText,
      verification_status: adjudicated.status,
      evidence: pair.second
        ? `${first.extractor}: ${pair.first.verification_status} (${pair.first.evidence}) | ${second.extractor}: ${pair.second.verification_status} (${pair.second.evidence})`
        : `${first.extractor}: ${pair.first.verification_status} (${pair.first.evidence}); no corresponding claim from ${second.extractor}`,
      extractor: `dual-adjudicator:${first.extractor}+${second.extractor}`,
      confidence,
    });
  }

  for (const claim of unmatchedSecond) {
    claims.push({
      id: `drift-${++claimIdx}`,
      claim: claim.claim,
      verification_status: "unverifiable",
      evidence: `${second.extractor}: ${claim.verification_status} (${claim.evidence}); no corresponding claim from ${first.extractor}`,
      extractor: `dual-adjudicator:${first.extractor}+${second.extractor}`,
      confidence: claim.confidence,
    });
  }

  return {
    claims,
    findings: buildFindingsFromClaims(claims),
    adjudication: {
      mode: "dual-extractor",
      extractors: [first.extractor, second.extractor],
      conflicts_resolved: conflictsResolved,
      resolution_policy:
        "both verified => verified; any violated without verified => violated; verified+violated => partial; missing counterpart => unverifiable",
    },
  };
}
