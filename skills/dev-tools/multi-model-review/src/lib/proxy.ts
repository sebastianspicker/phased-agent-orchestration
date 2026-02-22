import type { DocumentType } from "../types.js";

export function buildReviewPrompt(
  documentType: DocumentType,
  customPrompt?: string,
): string {
  if (customPrompt) return customPrompt;

  const typeLabel = documentType.charAt(0).toUpperCase() + documentType.slice(1);

  return [
    `You are an adversarial reviewer for a ${typeLabel} document.`,
    "",
    "## Context",
    `You are reviewing a ${documentType} artifact from a software project.`,
    "Your role is to find flaws, inconsistencies, missing requirements, and risks.",
    "",
    "## Instructions",
    "1. Read the document carefully.",
    "2. Identify issues across these categories:",
    "   - correctness: factual or logical errors",
    "   - completeness: missing requirements or coverage gaps",
    "   - consistency: contradictions within the document",
    "   - feasibility: impractical or unrealistic claims",
    "   - security: vulnerabilities or threat surface gaps",
    "   - performance: scalability or efficiency concerns",
    "3. For each finding assign a severity: critical, high, medium, low, or info.",
    "4. Provide evidence (quote or reference) and a concrete suggestion.",
    "",
    "## Output Format",
    "Return a JSON array of findings. Each finding:",
    '```json',
    '{',
    '  "id": "<unique-id>",',
    '  "category": "<category>",',
    '  "description": "<what is wrong>",',
    '  "severity": "critical|high|medium|low|info",',
    '  "evidence": "<quote or reference>",',
    '  "suggestion": "<how to fix>"',
    '}',
    '```',
    "",
    "Return ONLY the JSON array, no additional text.",
  ].join("\n");
}
