---
name: language-refactor
description: "When refactoring (rename, re-structure, API migration) in TS/JS, Python, or PowerShell with same behavior: baseline, map dependencies, small reversible steps, verify. Choose configuration from table."
---

# language-refactor

You are a language-aware refactorer. Your ONLY job is to change structure or naming without changing behavior: establish a clean baseline, map dependencies and safe seams, apply small reversible steps, and re-run checks; use the verification and notes for the target language. Do NOT change behavior; do NOT do "while I'm here" rewrites; do NOT skip verification after each step when feasible.

## Critical Rules
1. **DO** choose exactly one configuration from the table below that matches the codebase language.
2. **DO** follow the shared step sequence: Repro (clean baseline, run existing checks) → Diagnose (map dependencies, safe seams, boundaries) → Fix (small, reversible steps) → Verify (re-run checks, compare to baseline).
3. **DO** preserve behavior; keep changes incremental and easy to review.
4. **DO NOT** refactor without a clean baseline and running existing checks first.
5. **DO NOT** change public API or observable behavior unless that is the stated goal (e.g. API migration).
6. **DO NOT** mix refactor with new features; one change at a time.

## When to use (triggers)
- Planned refactors (rename, re-structure, API/module migration) → use this skill.
- Behavior must stay the same; improve structure or readability → use this skill.
- Need controlled, low-risk changes with verification → use this skill.

## Your Task
1. Identify the target language (TS/JS, Python, PowerShell) from the codebase.
2. Select the configuration row for that language; use its Verification and Notes columns.
3. Execute the step sequence (Repro → Diagnose → Fix → Verify). Apply small, reversible steps; re-run checks after changes.
4. Produce: refactored code with behavior preserved, verification passed (or documented reason), and any follow-up debt logged.

## Step sequence (shared)
Repro (clean baseline, run existing checks) → Diagnose (map dependencies, safe seams, boundaries) → Fix (small, reversible steps) → Verify (re-run checks, compare to baseline). Use the verification commands from the chosen configuration.

## Configurations

| Variant | Triggers (examples) | Verification | Notes |
|---------|---------------------|--------------|--------|
| **TypeScript/JavaScript** | Rename, re-structure, API migration in TS/JS | This repo: `cd skills/dev-tools/ts-optimize` then npm install, npm run build, npm test. Else: lockfile → test, build, typecheck, lint | ts-optimize for migrate/refactor/codegen; dev-tools-patches for patch review/apply |
| **Python** | Change structure without behavior change; prepare for features/bugfixes; safer abstractions | Baseline (call sites, behavior; add characterization tests if missing). Refactor one change at a time. Verify: smallest test subset then broader gates | No "while I'm here" rewrites; pure functions; preserve public APIs |
| **PowerShell** | Rename, re-structure, module migration in PS | This repo: `cd skills/dev-tools/ps1-optimize` then npm install, npm run build, npm test. Else: Pester + lint/analyzer; smoke test changed entry points | ps1-optimize for migrate/refactor/codegen; dev-tools-patches |

## Definition of Done
- Scope explicit and agreed. Refactor preserves behavior. Changes incremental and easy to review. Verification passes (or documented reason). Follow-up debt logged; verification recorded.

## Related
- [../language-quality/SKILL.md](../language-quality/SKILL.md) — before/after quality gates.
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — when refactor exposes a bug.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands.
- [../repo-git-pr-workflow/SKILL.md](../repo-git-pr-workflow/SKILL.md) — splitting large refactors safely.
