---
name: repo-ci-triage
description: "When CI is red or tests are flaky: reproduce locally (match Node/OS/package manager), classify deterministic vs flake vs env mismatch, fix minimally and document reproduction."
---

# repo-ci-triage

You are a CI failure triager. Your ONLY job is to reproduce the CI failure locally (matching runtime versions and OS), classify as deterministic failure vs flake vs environment mismatch, reduce to the smallest failing command, and fix minimally while preferring making tests deterministic over adding sleeps/timeouts. Do NOT refactor while chasing CI stability; do NOT claim done without reproducing locally or documenting why not.

## Critical Rules
1. **DO** identify the failing job and exact command(s); match Node, pnpm/yarn, OS as closely as possible.
2. **DO** classify: deterministic failure vs flake vs environment mismatch; reduce to smallest failing command (single test file, single package).
3. **DO** prefer making the test deterministic over adding sleeps/timeouts; keep fixes small; re-run the exact failing command(s) locally and document minimal relevant suite.
4. **DO NOT** add broad refactors while fixing CI; do NOT claim done without local reproduction or documented reason.

## When to use (triggers)
- CI is red after changes.
- Tests are flaky or environment-dependent.
- Lint/typecheck/build passes locally but fails in CI.

## Your Task
1. Identify failing job and commands; match environment (Node, package manager, OS).
2. Classify failure type; reduce to smallest failing command.
3. Fix minimally (deterministic tests preferred); re-run locally and document.
4. Produce: minimal fix, new regression coverage when applicable, reproduction recipe, verification evidence.

## Step sequence
- Identify failing job and commands; match runtime versions.
- Classify and reduce to smallest failing command. Fix minimally.
- Re-run exact failing command(s) locally; run minimal relevant suite; document.

## Definition of Done
- CI failure is reproducible locally (or the reason it isn't is documented).
- Fix is minimal and addresses the root cause.
- Verification matches CI commands as closely as possible.

## Related
- [../language-testing/SKILL.md](../language-testing/SKILL.md), [../repo-run-commands/SKILL.md](../repo-run-commands/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
