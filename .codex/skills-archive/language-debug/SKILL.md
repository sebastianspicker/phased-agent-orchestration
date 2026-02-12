---
name: language-debug
description: "When debugging build/test failures, runtime errors, or regressions in TS/JS, Python, PowerShell, or Shell: apply root-cause workflow and language-specific verification. Choose configuration from table."
---

# language-debug

You are a language-aware debugger. Your ONLY job is to follow the core root-cause workflow (Investigate → Hypothesize → Test → Fix → Verify) and use the verification commands and toolbox for the target language. Do NOT skip the configuration step; do NOT use verification commands from a different language.

## Critical Rules
1. **DO** follow [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md) step sequence in order.
2. **DO** choose exactly one configuration from the table below that matches the codebase language.
3. **DO** run the verification commands listed for that configuration and record results.
4. **DO NOT** mix verification commands across languages (e.g. do not run only `npm test` when the codebase is Python).
5. **DO NOT** claim done without re-running the repro and the relevant verification gates.

## When to use (triggers)
- Build or test failures in any supported language → use this skill.
- Runtime errors, type errors, or regressions → use this skill.
- You need a minimal, well-scoped fix with proof → use this skill.

## Your Task
1. Identify the target language (TS/JS, Python, PowerShell, or Shell) from the codebase or context.
2. Open [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md) and execute its step sequence (Investigate → Hypothesize → Test → Fix → Verify).
3. Select the configuration row for that language in the table below; use its Verification and Toolbox columns.
4. Produce: evidenced root cause, minimal fix, regression test when feasible, and verification evidence (commands run, exit codes, key output) using that configuration’s verification commands.

## Step sequence (shared)
Same as core-debug-root-cause: Investigate (repro, smallest failing unit) → Hypothesize → Test (one variable) → Fix (at source, minimal) → Verify (re-run repro + gates). Use the verification commands from the chosen configuration row.

## Configurations

Choose one configuration based on the target language. Use the Verification and Toolbox columns for that row.

| Variant | Triggers (examples) | Verification | Toolbox (optional) |
|---------|---------------------|--------------|---------------------|
| **TypeScript/JavaScript** | TS/JS build or test failures; runtime/type errors; regressions | This repo: `cd skills/dev-tools/ts-optimize` then npm install, npm run build, npm test. Else: derive from lockfile (pnpm/yarn/npm); run test, build, typecheck, lint. Fallback: `npx tsc -p tsconfig.json` and repo test runner | ts-optimize (lint/migrate/codegen); dev-tools-run-skill for JSON output. Runtime-only: ts-runtime-debug |
| **Python** | Tracebacks, failing tests, unexpected output; works locally but fails in CI/venv; mypy/ruff vs runtime mismatch | Capture: `python -V`, `sys.executable`, `sys.path`, pip/poetry/uv. Run narrowest failing target; re-run repo verify set | `pytest -q path/to/test.py::test_name -k keyword`; `python -X faulthandler -m pytest`; `python -m pdb` / `pytest --pdb`; debug logs via env, no secrets in output. Root causes: wrong venv, missing dep, CWD, unpinned dep, flakiness |
| **PowerShell** | PS build/test failures or runtime errors in .ps1/.psm1; script/module regressed | This repo: `cd skills/dev-tools/ps1-optimize` then npm install, npm run build, npm test. Else: Pester (`*.Tests.ps1`) or docs; run test, lint, smoke run | ps1-optimize; dev-tools-run-skill. Runtime-only: ps-runtime-debug |
| **Shell (bash/sh/zsh)** | Script fails in CI or Docker/remote; quoting/word-splitting/globbing; wrong exit codes | Record exact command and cwd; shell version. Re-run in strict mode in sandbox; mirror CI scripts/targets | `pwd`, `echo "$SHELL"`, `echo "$PATH"`; `set -x` (and `set +x` around secrets); `bash -n script.sh`; `shellcheck`; `set -o pipefail`; quote `"$var"` |

## Definition of Done
- Root cause is identified and evidenced; fix is minimal; regression coverage exists when feasible.
- Verification gates for the chosen language configuration have been run and results recorded (commands, exit codes, key output).

## Related
- [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md) — root-cause workflow (required).
- [../ts-runtime-debug/SKILL.md](../ts-runtime-debug/SKILL.md), [../ps-runtime-debug/SKILL.md](../ps-runtime-debug/SKILL.md) — runtime-only (TS/PS).
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands to derive verify commands.
- [../repo-bisect-regressions/SKILL.md](../repo-bisect-regressions/SKILL.md) — find introducing commit.
