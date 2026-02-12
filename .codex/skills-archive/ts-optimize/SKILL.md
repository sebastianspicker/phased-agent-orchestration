---
name: ts-optimize
description: "When you want TS/JS diagnostics beyond tsc, or dedupe/lint/migrate/codegen/recommend: run the ts-optimize runtime skill with patch-first workflow; review diffs before applying."
---

# ts-optimize

You are the agent cookbook for the ts-optimize runtime skill. Your ONLY job is to run `skills/dev-tools/ts-optimize/` with correct input JSON, triage findings, and apply patches only after review. Do NOT apply fixes without reviewing patches first; do NOT use paths outside `/workspace` in Docker runs.

## Critical Rules
1. **DO** start with a single action (e.g. `debug` or `lint`) and narrow scope (`targets.paths`). Prefer Docker sandbox execution.
2. **DO** read `data.logs` first (limits, skipped files, unsupported options). Triage findings by kind and severity; fix errors first.
3. **DO** run patch-only by default; set `applyFixes=true` only after you accept the patch intent (see [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md)).
4. **DO NOT** apply patches without reviewing diffs. Do NOT use `project.root` or paths outside `/workspace` in Docker.
5. **DO** run the target project's build/tests after changes; re-run the same input to confirm reduced/stable findings.

## When to use (triggers)
- You want TypeScript/JavaScript diagnostics beyond "just run tsc".
- You need dedupe candidates, conservative lint fixes, import migrations, barrel codegen, or optimization recommendations.
- You want patch-first output (review diffs before applying).

## Your Task
1. Identify scope and action(s): debug, dedupe, lint, refactor, migrate, codegen, or recommend. Restrict to `targets.paths` (and optional globs).
2. Build input JSON per `skills/dev-tools/ts-optimize/schemas/input.schema.json`; ensure `project.root` under `/workspace` for Docker.
3. Run the runtime skill (Docker or local); read `data.logs` then triage `data.findings` and `data.patches`.
4. Apply patches only after review; re-run with `applyFixes=true` only for accepted actions.
5. Produce: reproducible input JSON, triaged findings, applied patches (or patch-only report), and verification evidence (build/tests + re-run).

## Step sequence

**Repro**
- Start with one action and narrow `targets.paths`. Prefer Docker (see `skills/dev-tools/ts-optimize/README.md`).

**Diagnose**
- Read `data.logs` (limits, skipped files). Triage findings by kind/severity (errors first).

**Fix**
- Default patch-only. Apply changes only when intent is accepted; prefer `applyFixes=true` on a re-run for chosen actions.

**Verify**
- Run the target project's build/tests. Re-run the same input; confirm finding set reduced and stable.

## Action cookbook

| Action    | Use when | Key options |
| --------- | -------- | ----------- |
| debug     | Compiler errors + hotspots | `debugLevel`: quick \| medium \| complex; `targets.paths` |
| dedupe    | Copy/paste candidates     | `strategy`, `minTokens`, `maxCandidates` |
| lint      | Safe style/safety fixes   | `lintRules`: prefer-const (patches), no-var (findings only); `applyFixes` after review |
| refactor  | Minimal auto-changes      | `refactorGoals`; only prefer-const auto-rewrites in v0.2 |
| migrate   | Import renames           | `migrate.renameImports` (from/to module+name) |
| codegen   | Barrel index.ts          | `codegen.kind`: barrel; `codegen.targetDirs` |
| recommend | Project-level guidance   | `recommendFocus`: perf, types, bundle, testing |

(Full JSON examples remain in runtime skill README and schemas.)

## Checklist / What to look for
- `data.logs`: pwsh/tsc limits, skipped files, unsupported options.
- Finding kinds: tsc, lint, dedupe, refactor, migration, codegen, recommendation.
- Scope: `targets.paths` relative to `project.root`; no paths outside `/workspace` in Docker.
- Patches: review before apply; use dev-tools-patches workflow for apply/review.

## Output format / Definition of Done
- Input JSON saved or documented (reproducible).
- Scope minimal (`targets.paths` / globs) and intentional.
- Patches reviewed before application.
- Verification passed; re-run shows reduced/stable findings.

## Related
- [../dev-tools-run-skill/SKILL.md](../dev-tools-run-skill/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [../ts-lint/SKILL.md](../ts-lint/SKILL.md), [../ts-codegen/SKILL.md](../ts-codegen/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md). Runtime: `skills/dev-tools/ts-optimize/README.md`, `schemas/input.schema.json`.
