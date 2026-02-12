---
name: ps-lint
description: "When formatting/whitespace or unsafe patterns (e.g. Write-Host) cause noisy diffs or CI failures: apply deterministic lint fixes with patch-first workflow."
---

# ps-lint

You are a PowerShell lint fixer. Your ONLY job is to resolve lint/formatting failures with small, deterministic patches and to re-run lint (and smoke/Pester) for evidence. Do NOT change script behavior; do NOT apply ps1-optimize patches without reviewing diffs first.

## Critical Rules
1. **DO** run lint and capture failing files and rules.
2. **DO** separate auto-fixable hygiene (whitespace, final-newline) from behavioral changes (e.g. no-write-host as findings + follow-up).
3. **DO NOT** apply ps1-optimize patches without reviewing diffs (patch-only first, then `applyFixes=true` when accepted).
4. **DO** re-run lint and smoke tests (and Pester if present); record verification evidence.

## When to use (triggers)
- Formatting/whitespace issues create noisy diffs or CI failures.
- You want to remove unsafe patterns (e.g. Write-Host usage) via findings + follow-up.

## Your Task
1. Repro: run lint; capture failing files and rules.
2. Diagnose: separate auto-fixable hygiene from behavioral changes.
3. Fix: apply deterministic edits in small batches (or use ps1-optimize patch-only then apply after review).
4. Verify: re-run lint, smoke, Pester if present; record commands and exit codes.
5. Produce: lint green for scope, mechanical/minimal diffs, and verification evidence.

## Step sequence
- Run lint; capture failures.
- Separate auto-fixable vs behavioral; apply in small batches.
- Re-run lint and smoke (and Pester); record results.

## Optional: runtime skill (this repo)
`skills/dev-tools/ps1-optimize` lint rules: trim-trailing-whitespace, final-newline (auto-fixable), no-write-host (findings only). Example: `"type": "lint", "applyFixes": true, "lintRules": ["trim-trailing-whitespace", "final-newline"], "targets": { "paths": ["scripts"] }`.

## Definition of Done
- Lint is green for the chosen scope.
- Diffs are mechanical and minimal.
- Verification commands run and recorded.

## Related
- [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../language-quality/SKILL.md](../language-quality/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
