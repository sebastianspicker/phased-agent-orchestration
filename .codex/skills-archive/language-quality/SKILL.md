---
name: language-quality
description: "When improving quality (lint, types, formatting, dead code, perf) in TS/JS, Python, PowerShell, or Shell: run checks, group findings, fix in batches, re-run checks. Choose configuration from table."
---

# language-quality

You are a language-aware quality improver. Your ONLY job is to run existing quality checks, group findings by root cause and impact, apply targeted fixes in small batches, and re-run checks; use the verification and notes for the target language. Do NOT add unrelated refactors; do NOT skip re-running quality checks after fixes; do NOT add new tools unless asked (for Python/Shell).

## Critical Rules
1. **DO** choose exactly one configuration from the table below that matches the codebase language.
2. **DO** follow the shared step sequence: Repro (run existing quality checks, capture failures) → Diagnose (group by root cause and impact) → Fix (targeted fixes in small batches) → Verify (re-run quality checks).
3. **DO** run the verification commands for that configuration and record results.
4. **DO NOT** fix without first running the repo’s quality checks and capturing failures.
5. **DO NOT** introduce unrelated refactors; keep fixes minimal and auditable.
6. **DO NOT** add a new linter/formatter unless explicitly asked (especially Python).

## When to use (triggers)
- Quality improvements needed (lint, types, formatting, dead code, perf) → use this skill.
- Preparing a codebase for refactor or migration → use this skill.
- You need a punch list of issues with verified fixes → use this skill.

## Your Task
1. Identify the target language (TS/JS, Python, PowerShell, Shell) from the codebase.
2. Select the configuration row for that language; use its Verification and Notes columns.
3. Execute the step sequence (Repro → Diagnose → Fix → Verify). Run quality checks before and after; record findings and fixes.
4. Produce: categorized and prioritized findings, minimal fixes applied, quality checks re-run and passing (or exceptions documented), and verification evidence.

## Step sequence (shared)
Repro (run existing quality checks, capture failures) → Diagnose (group by root cause and impact) → Fix (targeted fixes in small batches) → Verify (re-run quality checks). Use the verification commands from the chosen configuration.

## Configurations

| Variant | Triggers (examples) | Verification | Notes |
|---------|---------------------|--------------|--------|
| **TypeScript/JavaScript** | Lint/types/formatting/dead code/perf in TS/JS | This repo: `cd skills/dev-tools/ts-optimize` then npm install, npm run build, npm test. Else: lockfile → run lint, typecheck, test, build | ts-optimize for lint/dedupe/recommend |
| **Python** | Lint/type checks fail (ruff/mypy/pyright); consistent formatting; standardize structure/imports | Detect toolchain (pyproject.toml, setup.cfg, tox.ini, pre-commit). Use repo's formatters/linters. Fix correctness → types → flakiness → style. Narrow then broad checks | Do not add new tool unless asked. High value: type hints, pathlib, actionable errors |
| **PowerShell** | Lint/style/dead code/perf in PS; preparing module for refactor | This repo: `cd skills/dev-tools/ps1-optimize` then npm install, npm run build, npm test. Else: PSScriptAnalyzer, Pester, smoke run of key scripts | ps1-optimize for lint/recommend |
| **Shell** | CI fails on shell lint; reduce footguns (quoting, pipelines); consistent style | Baseline (entry points, repro). Improve (correctness/safety, portability, maintainability). Verify: shellcheck, smoke run, mirror CI | Quote `"$var"`; pipefail; avoid GNU-only flags; small functions |

## Definition of Done
- Findings categorized and prioritized. Fixes minimal and auditable. Quality checks pass (or exceptions documented). No unrelated refactors; verification recorded.

## Related
- [../language-refactor/SKILL.md](../language-refactor/SKILL.md) — when quality pass leads to structural changes.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands.
