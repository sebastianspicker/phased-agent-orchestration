---
name: code
description: "Code playbook for TS/JS, Python, PowerShell, Shell. Use when debugging, implementing, refactoring, testing, linting, or improving quality; choose workflow and language from user prompt."
---

# code (Playbook)

Language-aware workflows for TypeScript/JavaScript, Python, PowerShell, and Shell. **Choose workflow + language** from the user prompt.

## When to use (triggers)
- Any of: debug, implement, refactor, quality, testing, lint, codegen, migrate, perf, bundle, arch, deps, build-debug, observability, runtime-debug, module, environment, diagnostics.
- Language: TypeScript/TS/JS, Python/py, PowerShell/ps/.ps1, Shell/bash/sh/zsh.

## Choosing configuration from user prompt

**Step 1 – Language:** From prompt or codebase: TypeScript/JS → **TS**; Python → **Py**; PowerShell/.ps1/.psm1 → **PS**; bash/sh/zsh → **Sh**.

**Step 2 – Workflow:** From prompt or task:

| Prompt / theme | Workflow |
|----------------|----------|
| debug, root cause, build/test fail, runtime/type error, regression | debug |
| implement, feature, bugfix, regression test | implement |
| quality, lint, types, formatting, dead code, punch list | quality |
| refactor, rename, re-structure, API migration, same behavior | refactor |
| testing, flaky, CI fail, regression test, repro → test | testing |
| lint, style, PSScriptAnalyzer, shellcheck | lint |
| codegen, barrel/index, generate | codegen |
| recommend, suggestions, modernize | recommend |
| migrate, upgrade, API rename | migrate |
| perf, performance, slow, bundle size | perf / bundle |
| arch, circular deps, boundaries | arch |
| deps, duplicate, transitive, supply chain | deps |
| build-debug, tsc, ESM/CJS, path alias | build-debug |
| observability, logs, metrics, traces | observability |
| runtime-debug (crashes, wrong output, async) | runtime-debug |
| module, export, psm1/psd1 | module (PS) |
| environment, CI vs local, PSModulePath | environment (PS) |
| diagnostics, PSScriptAnalyzer availability | diagnostics (PS) |

Apply the workflow below for the chosen language (TS/Py/PS/Sh).

## Configurations (workflows)

### debug
Core: Investigate (repro, smallest failing unit) → Hypothesize → Test (one variable) → Fix (at source, minimal) → Verify. **TS:** Lockfile → test, typecheck, build; ts-optimize/dev-tools-run-skill for this repo; runtime-only use runtime-debug. **Py:** Capture python -V, venv, sys.path; pytest -q path/to/test.py::test_name; faulthandler, pdb; root causes: wrong venv, CWD, flakiness. **PS:** Pester or smoke run; ps1-optimize/dev-tools-run-skill; runtime-only ps-runtime-debug. **Sh:** Exact command + cwd; set -x; bash -n; shellcheck; set -o pipefail; quote "$var".

### implement
Repro (baseline, acceptance test) → Diagnose (smallest seam, invariants) → Fix (small patches; regression test red→green) → Verify. **TS:** test, typecheck, lint, build; ts-optimize, dev-tools-patches. **Py:** Plan then implement; narrow tests then repo gate; CLI ergonomics, pathlib, validation at boundaries. **PS:** Pester focused then suite; smoke entry points; advanced functions, parameter validation. **Sh:** Design args, exit codes; set -euo pipefail; shellcheck; dry-run if destructive.

### quality
Repro (run quality checks) → Diagnose (group by cause) → Fix (small batches) → Verify. **TS:** lint, typecheck, test, build; ts-optimize lint/dedupe/recommend. **Py:** Detect toolchain (pyproject.toml, ruff/mypy); fix correctness → types → flakiness → style; type hints, pathlib. **PS:** PSScriptAnalyzer, Pester; ps1-optimize. **Sh:** shellcheck; correctness/safety then portability; quote "$var", pipefail.

### refactor
Repro (clean baseline) → Diagnose (dependencies, seams) → Fix (small, reversible steps) → Verify. **TS:** test, build, typecheck; ts-optimize migrate/refactor/codegen; dev-tools-patches. **Py:** Baseline + characterization tests; one change at a time; preserve public APIs. **PS:** Pester + lint; ps1-optimize; smoke entry points. **Sh:** (refactor rarely; use quality + implement.)

### testing
Repro (isolate failing test) → Diagnose (test vs product vs env) → Fix (regression test first) → Verify. **TS:** Isolated test then suite; typecheck, build; red→green for regression. **Py:** pytest -q path::test_name; red→green→refactor; deterministic; prefer DI over patching. **PS:** Isolated + suite; smoke entry points; ps1-optimize for diagnostics. **Sh:** Minimal repro script; exit code checks.

### lint
Formatting/style/safety fixes. **TS:** ts-optimize or ts-lint playbook; apply patch-first. **Py:** ruff/black/mypy per repo; fix in batches. **PS:** PSScriptAnalyzer; ps1-optimize. **Sh:** shellcheck; fix quoting, pipefail.

### codegen
Deterministic generation (barrels, stubs, schemas). **TS:** ts-codegen (index barrels); openapi-codegen if API. **Py:** py-codegen; stubs/schemas. **PS:** ps-codegen (index.psm1 dot-source). **Sh:** (manual or small generators.)

### recommend
Suggestions without applying; prioritize with evidence. **TS:** ts-recommend; ts-optimize for recommendations. **Py:** py-quality recommend pass. **PS:** ps-recommend; ps1-optimize. **Sh:** sh-quality.

### migrate
Library/API upgrade; consistent renames. **TS:** ts-migrate; deterministic transforms; verification gates. **Py:** py-refactor/migrate. **PS:** ps-migrate (cmdlet renames). **Sh:** (manual.)

### perf / bundle
**perf:** Measure first; hot paths, CPU, memory. **bundle:** Tree-shaking, payload size. **TS:** ts-perf, ts-bundle; justify with measurements. **Py:** py-quality perf notes. **PS:** ps-quality. **Sh:** (rare.)

### arch
Circular deps, boundaries, module order. **TS:** ts-arch; untangle with minimal behavior change. **Py/PS/Sh:** (structure refactors; use refactor workflow.)

### deps
Duplicate versions, transitive, pinning. **TS:** ts-deps; lockfile policy. **Py:** py deps; venv/uv. **PS:** (module path, version.) **Sh:** (path, env.)

### build-debug
tsc vs bundler, ESM/CJS, path alias. **TS:** ts-build-debug. **Py:** py pyproject/setup. **PS:** module load. **Sh:** (n/a.)

### observability
Logs, metrics, traces. **TS:** ts-observability. **Py/PS/Sh:** Same patterns (boundaries, no secrets).

### runtime-debug
Crashes, wrong output, async; not type errors. **TS:** ts-runtime-debug. **PS:** ps-runtime-debug. Same core-debug flow with runtime-focused tools.

### module (PS)
Export surface, psm1/psd1, Windows PS 5.1 vs PS 7+. **PS only.**

### environment (PS)
Works locally not CI; PSModulePath, execution policy. **PS only.**

### diagnostics (PS)
PSScriptAnalyzer/version availability; what can be analyzed. **PS only.**

## Verify (this repo)
- TS: `cd skills/dev-tools/ts-optimize && npm install && npm run build && npm test`
- PS: `cd skills/dev-tools/ps1-optimize && npm install && npm run build && npm test`
- Else: use repo skill config **run-commands** to derive commands.

## Related
- **core** (debug-root-cause, tdd-red-green, verify-before-claim) for cross-cutting flow.
- **repo** (run-commands, dev-tools-run-skill, dev-tools-patches) for commands and patches.
