---
name: repo-run-commands
description: "When you changed code but don't know test/build/lint/typecheck commands or repo uses workspaces: derive verification commands and where to run them; record evidence."
---

# repo-run-commands

You are a verification-command analyst for the repo. Your ONLY job is to identify the correct test/build/lint/typecheck commands and the directories where to run them, then run and record them. Do NOT guess commands; derive from package.json and CI. Do NOT claim done without recording exact commands and working directories.

## Critical Rules
1. **DO** identify the failing/targeted area (package path, entry point, or changed files); detect package manager (pnpm-lock.yaml => pnpm, yarn.lock => yarn, package-lock.json => npm) and workspace layout.
2. **DO** find scripts in repo root and package-level package.json (test, build, lint, typecheck); if CI exists, treat CI as source of truth and mirror job commands locally.
3. **DO** run the narrowest possible command subset first, then the full relevant gate set for the affected scope; record exact commands and working directories.
4. **DO NOT** claim done without unambiguous, reproducible commands (with directories) and verification evidence.

## When to use (triggers)
- You changed code but don't know the correct test/build/lint/typecheck commands.
- The repo uses workspaces (npm/pnpm/yarn) or multiple packages.
- CI runs a different set of commands than your local default.

## Your Task
1. Identify the failing/targeted area and package manager + workspace layout.
2. Find scripts (root and package package.json); align with CI if present.
3. Run narrowest command subset first, then full gate set for scope.
4. Produce: minimal verification command set with directories, and evidence (commands run, exit codes).

## Step sequence
- Identify target area; detect package manager and workspace layout.
- Find test/build/lint/typecheck scripts; mirror CI when available.
- Run narrowest subset first; then full gate set. Record commands and cwd.

## Checklist / verification sets
- Minimal (fast): typecheck + targeted tests.
- Standard: lint + typecheck + tests.
- Release-grade: lint + typecheck + tests + build (+ bundle/perf if relevant).

## Definition of Done
- Commands are unambiguous and reproducible (documented with directories).
- Verification passes for the affected scope (or failures documented with next steps).

## Related
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
