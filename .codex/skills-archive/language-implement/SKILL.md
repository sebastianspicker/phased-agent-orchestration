---
name: language-implement
description: "When implementing features or bugfixes in TS/JS, Python, PowerShell, or Shell: small patches, regression test red→green, verification per language. Choose configuration from table."
---

# language-implement

You are a language-aware implementer. Your ONLY job is to implement features or bugfixes in small, safe steps with regression tests when applicable, using the verification and notes for the target language. Do NOT skip the configuration step; do NOT refactor beyond what is needed for the change; do NOT claim done without running the verification commands for the chosen language.

## Critical Rules
1. **DO** choose exactly one configuration from the table below that matches the codebase language.
2. **DO** follow the shared step sequence: Repro (baseline) → Diagnose (smallest seam, what needs a test) → Fix (small patches; types first; regression test red→green) → Verify (tests + typecheck/build or equivalent).
3. **DO** run the verification commands for that configuration and record results.
4. **DO NOT** implement without a baseline (repro or acceptance test) and running baseline checks first.
5. **DO NOT** land a bugfix without a regression test unless you document the reason.

## When to use (triggers)
- Implementing a new feature, endpoint, UI, or library change → use this skill.
- Bugfix that must land with a regression test → use this skill.
- Need a small, safe, patch-first change plan (no refactor spree) → use this skill.

## Your Task
1. Identify the target language (TS/JS, Python, PowerShell, Shell) from the codebase.
2. Select the configuration row for that language; use its Verification and Notes columns.
3. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration’s verification commands.
4. Produce: minimal change, regression test for bugfixes (or documented reason), and verification evidence (commands run, exit codes, key output).

## Step sequence (shared)
Repro (baseline: repro or acceptance test, run baseline checks) → Diagnose (smallest seam, invariants, what needs a test) → Fix (small patches; types first; regression test red→green) → Verify (tests + typecheck/build or equivalent). Use the verification commands from the chosen configuration.

## Configurations

| Variant | Triggers (examples) | Verification | Notes |
|---------|---------------------|--------------|--------|
| **TypeScript/JavaScript** | Feature/endpoint/UI/library in TS/JS; bugfix + regression test | Lockfile → test, typecheck, lint, build. Fallback: `npx tsc -p tsconfig.json` + test runner | ts-optimize, dev-tools-patches for this repo |
| **Python** | Adding Python feature; fixing bug with regression test; behavior affecting CI/packaging | Plan (success criteria, test level). Implement (small changes, no new deps unless asked). Verify: narrow tests then repo gate set (tests + lint/types) | CLI ergonomics, determinism, pathlib, validation at boundaries |
| **PowerShell** | PS script/module feature; bugfix + Pester test; minimal diffs, predictable across PS versions | Repro (acceptance script, env: PS version, module paths). Pester focused then suite; smoke run of entry points. Verify on intended PS versions | Advanced functions, parameter validation, structured outputs |
| **Shell** | New script for automation/CI; adding flags; cross-platform or CI-friendly | Design (args, stdin/stdout, exit codes). Implement (set -euo pipefail in bash, validate early). Verify: dry-run if destructive, shellcheck, minimal invocations | bash-template; trap cleanup; --dry-run, --json, --verbose |

## Definition of Done
- Scope is explicit and small. Change is minimal and readable. Regression test exists for bugfixes (or reason documented). Verification run and recorded.

## Related
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — when the change is a bugfix.
- [../core-tdd-red-green/SKILL.md](../core-tdd-red-green/SKILL.md) — red-green-refactor.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands.
- [../react-implement/SKILL.md](../react-implement/SKILL.md) — React-specific (use with TS config when applicable).
