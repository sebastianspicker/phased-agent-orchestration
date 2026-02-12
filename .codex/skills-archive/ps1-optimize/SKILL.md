---
name: ps1-optimize
description: "When you need PowerShell diagnostics and reproducible findings: run ps1-optimize runtime skill with patch-first workflow; apply fixes only after review."
---

# ps1-optimize

You are the agent cookbook for the ps1-optimize runtime skill. Your ONLY job is to run `skills/dev-tools/ps1-optimize/` with correct input JSON, triage findings, and apply patches only after review. Do NOT apply fixes without reviewing patches first; do NOT use paths outside `/workspace` in Docker runs.

## Critical Rules
1. **DO** start with a single action (e.g. `debug` or `lint`) and narrow scope (`targets.paths`). Prefer Docker sandbox execution.
2. **DO** read `data.logs` first (e.g. "pwsh not available", "PSScriptAnalyzer not available"). Triage findings by kind and severity.
3. **DO** run patch-only by default; set `applyFixes=true` only after you accept the patch intent (see [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md)).
4. **DO NOT** apply patches without reviewing diffs. Do NOT use paths outside `/workspace` in Docker.
5. **DO** run the target project's tests/smoke; re-run the same input to confirm reduced/stable findings.

## When to use (triggers)
- You need PowerShell diagnostics (PSScriptAnalyzer when available) and reproducible findings.
- You want deterministic lint/refactor patches (whitespace), command migrations, module index codegen, or recommendations.
- You want patch-first output and controlled application (`applyFixes=true` only when intended).

## Your Task
1. Identify scope and action(s): debug, lint, refactor, migrate, codegen, or recommend. Restrict to `targets.paths` (and optional globs).
2. Build input JSON per `skills/dev-tools/ps1-optimize/schemas/input.schema.json`; ensure `project.root` under `/workspace` for Docker.
3. Run the runtime skill (Docker or local); read `data.logs` then triage `data.findings` and `data.patches`.
4. Apply patches only after review; re-run with `applyFixes=true` only for accepted actions.
5. Produce: reproducible input JSON, triaged findings, applied patches (or patch-only report), and verification evidence (tests/smoke + re-run).

## Step sequence

**Repro**
- Start with one action and narrow `targets.paths`. Prefer Docker (see `skills/dev-tools/ps1-optimize/README.md`).

**Diagnose**
- Read `data.logs` (pwsh/PSScriptAnalyzer availability). Triage findings by kind/severity.

**Fix**
- Default patch-only. Apply only when intent is accepted; use `applyFixes=true` on re-run for chosen actions.

**Verify**
- Run target project's tests/smoke. Re-run same input; confirm reduced/stable findings.

## Action cookbook

| Action    | Use when | Key options |
| --------- | -------- | ----------- |
| debug     | PSScriptAnalyzer diagnostics | `debugLevel`: quick \| medium \| complex; best-effort if pwsh/PSA missing |
| lint      | Whitespace + no-write-host   | `lintRules`: trim-trailing-whitespace, final-newline (auto-fix), no-write-host (findings) |
| refactor  | Format-whitespace            | `refactorGoals`: format-whitespace |
| migrate   | Command renames             | `migrate.renameCommands` (from/to) |
| codegen   | Module index.psm1            | `codegen.kind`: module; `codegen.targetDirs` |
| recommend | Security/compat/style       | `recommendFocus` |

(Full JSON examples in runtime skill README and schemas.)

## Checklist / What to look for
- `data.logs`: pwsh not available, PSScriptAnalyzer not available.
- Finding kinds: diagnostic, lint, refactor, migration, codegen, recommendation.
- Scope: `targets.paths` relative to `project.root`; no paths outside `/workspace` in Docker.
- Patches: review before apply; use dev-tools-patches workflow.

## Output format / Definition of Done
- Input JSON saved or documented (reproducible).
- Scope minimal and intentional.
- Patches reviewed before application.
- Verification passed; re-run shows reduced/stable findings.

## Related
- [../dev-tools-run-skill/SKILL.md](../dev-tools-run-skill/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [../ps-lint/SKILL.md](../ps-lint/SKILL.md), [../ps-codegen/SKILL.md](../ps-codegen/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md). Runtime: `skills/dev-tools/ps1-optimize/README.md`, `schemas/input.schema.json`.
