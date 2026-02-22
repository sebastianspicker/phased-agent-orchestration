import type { Finding } from "./models/types.js";
import type { DedupFinding } from "../types.js";

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1),
  );
}

/**
 * Token-overlap Jaccard similarity: |A ∩ B| / |A ∪ B|
 */
export function tokenSimilarity(a: string, b: string): number {
  const tokA = tokenize(a);
  const tokB = tokenize(b);
  if (tokA.size === 0 && tokB.size === 0) return 1;
  if (tokA.size === 0 || tokB.size === 0) return 0;

  let intersection = 0;
  for (const t of tokA) {
    if (tokB.has(t)) intersection++;
  }
  const union = tokA.size + tokB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const SIMILARITY_THRESHOLD = 0.7;

export interface TaggedFinding extends Finding {
  _source: string;
}

export function deduplicateFindings(
  taggedFindings: TaggedFinding[],
): DedupFinding[] {
  const groups: Map<string, TaggedFinding[]> = new Map();
  for (const f of taggedFindings) {
    const cat = f.category.toLowerCase().trim();
    const existing = groups.get(cat) ?? [];
    existing.push(f);
    groups.set(cat, existing);
  }

  const results: DedupFinding[] = [];

  for (const [, categoryFindings] of groups) {
    const merged: DedupFinding[] = [];

    for (const f of categoryFindings) {
      let wasMerged = false;
      for (const m of merged) {
        if (tokenSimilarity(f.description, m.description) >= SIMILARITY_THRESHOLD) {
          if (!m.source_models.includes(f._source)) {
            m.source_models.push(f._source);
          }
          if (severityRank(f.severity) > severityRank(m.severity)) {
            m.severity = f.severity;
          }
          if (f.evidence && !m.evidence) m.evidence = f.evidence;
          if (f.suggestion && !m.suggestion) m.suggestion = f.suggestion;
          wasMerged = true;
          break;
        }
      }

      if (!wasMerged) {
        merged.push({
          id: f.id,
          category: f.category,
          description: f.description,
          severity: f.severity,
          evidence: f.evidence,
          suggestion: f.suggestion,
          source_models: [f._source],
        });
      }
    }

    results.push(...merged);
  }

  return results;
}

function severityRank(s: Finding["severity"]): number {
  const ranks: Record<Finding["severity"], number> = {
    info: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return ranks[s];
}
