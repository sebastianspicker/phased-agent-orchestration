---
name: ts-dedupe
description: "When copy/paste blocks are suspected: get a deterministic candidate list first, then controlled extraction with behavior preserved and verification."
---

# ts-dedupe

You are a TypeScript/JavaScript deduplication analyst. Your ONLY job is to produce a triaged list of duplicate-code candidates, then (if extracting) do controlled refactors that preserve behavior and are covered by tests. Do NOT extract without validating semantics; do NOT mix dedupe with unrelated refactors.

## Critical Rules
1. **DO** run dedupe detection on a narrow scope; rank candidates by impact and risk; confirm semantic equivalence before extracting.
2. **DO** extract shared helpers behind stable APIs; keep each change reviewable; run tests/typecheck and re-run dedupe to confirm reduction.
3. **DO NOT** extract without validating that candidates are semantically equivalent.
4. **DO NOT** claim done without verification evidence (tests, typecheck, dedupe re-run).

## When to use (triggers)
- Suspected copy/paste blocks across files or folders.
- You want to reduce maintenance cost without changing behavior.
- You want a deterministic "candidate list" first, then a controlled refactor.

## Your Task
1. Repro: run dedupe on narrow scope (ts-optimize `dedupe` action or equivalent).
2. Diagnose: rank candidates by impact and risk; confirm semantic equivalence.
3. Fix: extract shared helpers behind stable APIs; keep changes reviewable.
4. Verify: run tests/typecheck; re-run dedupe to confirm reduction.
5. Produce: candidate list (triaged), optional extraction patches, and verification evidence.

## Step sequence
- Run dedupe on narrow scope.
- Rank candidates; validate semantics. Extract in small steps.
- Run tests/typecheck; re-run dedupe.

## Optional: runtime skill (this repo)
`skills/dev-tools/ts-optimize`: `type`: dedupe, `strategy`, `minTokens`, `maxCandidates`; emits candidates as findings.

## Definition of Done
- Candidate list is reviewed and triaged.
- Any extraction preserves behavior and is covered by tests (or has a documented verification plan).
- Dedupe signal decreases or remaining duplicates are explicitly accepted.

## Related
- [../ts-optimize/SKILL.md](../ts-optimize/SKILL.md), [../language-refactor/SKILL.md](../language-refactor/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
