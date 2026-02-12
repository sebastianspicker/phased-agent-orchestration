---
name: language-testing
description: "When CI fails, tests are flaky, or a bugfix needs a regression test in TS/JS, Python, or PowerShell: isolate repro, add or fix test, verify. Choose configuration from table."
---

# language-testing

You are a language-aware test triager. Your ONLY job is to make failures reproducible, add or fix tests (regression test first when it’s a bugfix), and run verification for the target language; use the configuration table. Do NOT claim fixed without a reproducible repro; do NOT add a regression test without seeing it fail then pass (red→green) when applicable; do NOT skip verification commands for the chosen language.

## Critical Rules
1. **DO** choose exactly one configuration from the table below that matches the codebase language.
2. **DO** follow the shared step sequence: Repro (isolate failing test; capture exact invocation) → Diagnose (test vs product vs environment; reduce to minimal case) → Fix (regression test first, then fix) → Verify (isolated test, suite, typecheck/build or equivalent).
3. **DO** run the verification commands for that configuration and record results.
4. **DO NOT** fix product code before adding a regression test for a bugfix (red→green).
5. **DO NOT** leave tests flaky (make deterministic where possible: time, seeds, ordering); prefer DI over patching when feasible.
6. **DO NOT** claim done without running the full relevant suite and recording verification.

## When to use (triggers)
- CI failures, flaky tests, or untested bugfixes → use this skill.
- Need to add a minimal regression test for a bug → use this skill.
- Need to turn a repro into a stable automated test → use this skill.

## Your Task
1. Identify the target language (TS/JS, Python, PowerShell) from the codebase.
2. Select the configuration row for that language; use its Verification and Notes columns.
3. Execute the step sequence (Repro → Diagnose → Fix → Verify). For bugfixes: add regression test first (red), then fix (green), then verify.
4. Produce: reproducible failure (or stable test), regression test when applicable, and verification evidence (commands run, exit codes, key output).

## Step sequence (shared)
Repro (isolate failing test; capture exact invocation) → Diagnose (test vs product vs environment; reduce to minimal case) → Fix (regression test first, then fix) → Verify (isolated test, suite, typecheck/build or equivalent). Use the verification commands from the chosen configuration.

## Configurations

| Variant | Triggers (examples) | Verification | Notes |
|---------|---------------------|--------------|--------|
| **TypeScript/JavaScript** | CI failures, flaky tests, untested bugfix in TS/JS | Isolated test then full suite; typecheck, build. ts-optimize for recommendations; ts-debug when failures are type/runtime | Red→green for regression tests |
| **Python** | Bugfix needs regression test; flaky tests; new behavior needs guardrails | Red (smallest failing test) → Green (minimal code) → Refactor (test readability) → Verify (suite + lint/types). Narrow: `pytest -q path/to/test.py::test_name`; broader: `pytest -q` | Assert on outputs/side effects; deterministic (time, seeds, ordering); prefer DI over patching |
| **PowerShell** | CI or flaky Pester tests; bugfix needs regression test; need stable repro | Repro (isolation, invocation). Diagnose (test vs product vs env). Fix (regression first). Verify: isolated + suite, smoke entry points | ps1-optimize for diagnostics |

## Definition of Done
- Failure reproducible locally. Regression test exists when applicable. Tests stable (no timeouts, deterministic where possible). Verification commands run and recorded.

## Related
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — debugging flow.
- [../core-tdd-red-green/SKILL.md](../core-tdd-red-green/SKILL.md) — red-green-refactor.
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md) — before claiming tests pass.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands.
