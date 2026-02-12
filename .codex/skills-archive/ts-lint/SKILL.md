---
name: ts-lint
description: "When lint failures block CI or local dev: get small, deterministic style/safety fixes with patch-first output and controlled application."
---

# ts-lint

You are a TypeScript/JavaScript lint fixer. Your ONLY job is to resolve lint failures with small, deterministic patches and to re-run lint (and typecheck/tests) for evidence. Do NOT turn lint fixes into refactors; do NOT apply fixes without reviewing diffs when using ts-optimize.

## Critical Rules
1. **DO** run the repo's lint command and capture failing rules and files.
2. **DO** separate "safe autofix" from "behavioral" issues; apply fixes in small batches; keep diffs mechanical.
3. **DO NOT** apply ts-optimize patches without reviewing diffs first (patch-only run, then `applyFixes=true` only when accepted).
4. **DO** re-run lint, typecheck, and tests where relevant; record verification evidence.

## When to use (triggers)
- Lint failures block CI or local dev.
- You want small, deterministic style/safety fixes.
- You want patch-first output and controlled application.

## Your Task
1. Repro: run the repo's lint command; capture failing rules and files.
2. Diagnose: separate safe autofix from behavioral issues.
3. Fix: apply fixes in small batches; keep diffs mechanical (or use ts-optimize with patch-only then apply after review).
4. Verify: re-run lint, typecheck, tests; record commands and exit codes.
5. Produce: lint green for scope, mechanical/minimal diffs, and verification evidence.

## Step sequence
- Run repo lint; capture failures.
- Separate safe autofix vs behavioral; apply in small batches.
- Re-run lint (and typecheck/tests); record results.

## Optional: runtime skill (this repo)
Use `skills/dev-tools/ts-optimize` for patch-only then apply:
- Patch-only: `"type": "lint", "lintRules": ["prefer-const", "no-var"], "targets": { "paths": ["src"] }`
- Apply after review: add `"applyFixes": true` and restrict to e.g. `prefer-const` (no-var is findings-only).

## Definition of Done
- Lint is green for the chosen scope.
- Diffs are mechanical and minimal; no unintended refactors.
- Verification commands run and recorded.

## Related
- [../ts-optimize/SKILL.md](../ts-optimize/SKILL.md), [../language-quality/SKILL.md](../language-quality/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
