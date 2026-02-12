# Answer contract (template)

## Output format
- Provide:
  - `answer`: concise response
  - `citations`: list of source identifiers from retrieved context (doc IDs/paths/URLs)
  - `assumptions`: any inferences not directly supported by sources
  - `unknowns`: what evidence is missing (if any)

## Grounding rules
- Every non-trivial claim must be supported by at least one citation.
- Never cite a source that was not retrieved.
- If the retrieved context does not contain the answer:
  - say “not found in provided sources”
  - ask for the missing document or permission

## Safety rules
- Respect ACL tags / access boundaries.
- Do not output secrets or sensitive content even if retrieved.

