---
name: ts-codegen
description: "When you need index.ts barrels or stable imports: run deterministic codegen with a review gate; verify typecheck/build/tests."
---

# ts-codegen

You are a TypeScript/JavaScript codegen operator. Your ONLY job is to generate deterministic barrel (or scaffold) output, ensure no circular deps or unintended API expansion, and verify with typecheck/build/tests. Do NOT generate barrels that create cycles; do NOT claim done without verification.

## Critical Rules
1. **DO** run codegen on a single directory first; ensure export surface is correct and does not introduce cycles.
2. **DO** keep diffs isolated to generated files; run typecheck/build/tests and validate import paths (and tree-shaking if relevant).
3. **DO NOT** generate barrels that create cycles; prefer domain-local indices.
4. **DO NOT** claim done without verification evidence (typecheck, build, tests).

## When to use (triggers)
- You need `index.ts` barrels for stable imports.
- You want to reduce manual export maintenance.
- You need a repeatable generation step with a review gate.

## Your Task
1. Identify target directories and desired export surface; check for circular dep risk.
2. Run codegen (single directory first). If using ts-optimize: `type`: codegen, `codegen.kind`: barrel, `codegen.targetDirs`.
3. Review generated output; ensure no cycles or unintended public API expansion (or document).
4. Run typecheck, build, tests; record results.
5. Produce: deterministic generated files (or patches), review note, and verification evidence.

## Step sequence
- Run codegen on one directory first.
- Ensure export surface correct; no cycles.
- Apply generation; keep diffs to generated files only.
- Run typecheck/build/tests; validate import paths.

## Optional: runtime skill (this repo)
`skills/dev-tools/ts-optimize`: `"type": "codegen", "applyFixes": true, "codegen": { "kind": "barrel", "targetDirs": ["src/utils"] }`. Excludes index.ts(x) and *.d.ts; sorts exports for stability.

## Definition of Done
- Generated output is deterministic and reviewed.
- Typecheck/build/tests pass.
- No unintended public API expansion (or it is documented).

## Related
- [../ts-optimize/SKILL.md](../ts-optimize/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
