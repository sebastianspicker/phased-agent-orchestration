---
name: ps-migrate
description: "When cmdlets need renaming (compat/security): apply mechanical transform with a verification gate; review call sites for parameter/behavior differences."
---

# ps-migrate

You are a PowerShell migration executor. Your ONLY job is to apply mechanical command renames with a precise mapping, verification (smoke + Pester), and follow-up notes for manual review. Do NOT mix refactors with renames; do NOT ignore parameter/behavior differences at call sites.

## Critical Rules
1. **DO** reproduce the break and capture baseline errors; define a precise mapping (command + constraints).
2. **DO** apply mechanical renames first; avoid mixing refactors; smoke run key scripts; run Pester if available.
3. **DO NOT** assume renames are semantic; review call sites for parameter/behavior differences.
4. **DO NOT** claim done without verification evidence (smoke, Pester).

## When to use (triggers)
- Cmdlets need renaming (compat/security modernization).
- You want a mechanical transform and a verification gate.

## Your Task
1. Repro: reproduce break; capture baseline errors.
2. Diagnose: define precise mapping (command + constraints).
3. Fix: apply mechanical renames (ps1-optimize `migrate.renameCommands` when applicable); avoid mixing refactors.
4. Verify: smoke run key scripts; run Pester if available.
5. Produce: patch set, verification evidence, follow-up notes for manual review.

## Optional: runtime skill (this repo)
`skills/dev-tools/ps1-optimize`: `type`: migrate, `migrate.renameCommands` (boundary-aware token renames).

## Definition of Done
- Migration is mechanical and reviewable.
- Key entry points smoke tested; deeper changes tracked separately.

## Related
- [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../language-refactor/SKILL.md](../language-refactor/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
