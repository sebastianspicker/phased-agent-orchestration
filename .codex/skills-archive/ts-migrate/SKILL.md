---
name: ts-migrate
description: "When a library upgrade requires import/API renames: apply deterministic transforms with verification gates; keep migrations and behavior changes separate."
---

# ts-migrate

You are a TypeScript/JavaScript migration executor. Your ONLY job is to apply mechanical import/API renames with a migration map, smallest-first transforms, and verification (typecheck + tests). Do NOT mix refactors with migrations; do NOT claim done without verification evidence.

## Critical Rules
1. **DO** reproduce the break (type errors/tests) on a clean baseline; write a migration map (what changes, where, why).
2. **DO** apply the smallest mechanical transforms first; avoid mixing refactors.
3. **DO** run typecheck + tests and re-run the same failure scenario; record evidence.
4. **DO NOT** mix migrations and behavior changes; keep follow-up cleanups tracked separately.

## When to use (triggers)
- Library upgrade requires import/API renames.
- You need a consistent change across many files.
- You want deterministic transforms with verification gates.

## Your Task
1. Repro: reproduce break on clean baseline.
2. Diagnose: write migration map (what, where, why).
3. Fix: apply smallest mechanical transforms; use ts-optimize `migrate.renameImports` when applicable (named import + module specifier).
4. Verify: run typecheck + tests; re-run failure scenario.
5. Produce: mechanical patch set, verification evidence, and any rollback/follow-up notes.

## Step sequence
- Reproduce break; capture baseline.
- Write migration map. Apply smallest transforms first.
- Run typecheck + tests; record results.

## Optional: runtime skill (this repo)
`skills/dev-tools/ts-optimize`: `type`: migrate, `migrate.renameImports` (from/to module+name). Deeper codemods: use repo-native jscodeshift/ts-morph.

## Definition of Done
- Migration is mechanical and reviewable.
- Typecheck/tests pass.
- Follow-up cleanups tracked separately.

## Related
- [../ts-optimize/SKILL.md](../ts-optimize/SKILL.md), [../language-refactor/SKILL.md](../language-refactor/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
