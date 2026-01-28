> Please note: Due to the rapid increase in the number of AI agents and skills, the repository is only sporadically maintained and developed further. Some features may still be incomplete or in the early stages of development. A SKILLS.md file for each coding agent/language will be added.

# coding-agents-space

A skill-first repository layout for building and shipping **Coding Agent Skills** with strict schemas,
sandboxed execution, and testable implementations.

This repo includes two layers:
- Runtime skills (Node-based packages under `skills/dev-tools/*`).
- Codex playbook skills (agent guidance under `.codex/skills/*`).

## Runtime skills

- `skills/dev-tools/ts-optimize` — Debugging (quick/medium/complex), dedupe detection, lint fixes, API migrations,
  refactor patches, codegen (barrels), and optimization recommendations for web + scientific/numerics code.
- `skills/dev-tools/ps1-optimize` — Diagnostics, lint fixes, module migrations, refactor patches, codegen (index.psm1),
  and recommendations for PowerShell projects.

## Codex playbook skills
Playbooks are agent-friendly “how to use the runtime skills” guides (cookbooks + workflows):
- Index + quick links: `agents/dev-tools/README.md`
- Agent rules + verification commands: `AGENTS.md`

Key playbooks:
- `.codex/skills/ts-optimize/SKILL.md` — cookbook for `ts-optimize` actions (debug/dedupe/lint/migrate/refactor/codegen/recommend).
- `.codex/skills/ps1-optimize/SKILL.md` — cookbook for `ps1-optimize` actions (debug/lint/migrate/refactor/codegen/recommend).
- `.codex/skills/dev-tools-run-skill/SKILL.md` — how to run runtime skills (Docker/local) and produce reproducible JSON output.
- `.codex/skills/dev-tools-patches/SKILL.md` — patch review/apply workflow (patch-first, `applyFixes=true`).
- `.codex/skills/dev-tools-skill-maintenance/SKILL.md` — how to change runtime skills without breaking contracts (schemas/tests/docs).
- `.codex/skills/ts-implement/SKILL.md` — write TS/JS code (feature/bugfix) with verification.
- `.codex/skills/ps-implement/SKILL.md` — write PowerShell code (feature/bugfix) with verification.
- `.codex/skills/ts-runtime-debug/SKILL.md` — runtime debugging workflow for TS/JS.
- `.codex/skills/ps-runtime-debug/SKILL.md` — runtime debugging workflow for PowerShell.
- `.codex/skills/repo-tool-definitions/SKILL.md` — maintain runner tool definitions (names + schema refs).
- `.codex/skills/repo-contracts/SKILL.md` — change shared contract schemas with compatibility discipline.
- `.codex/skills/repo-new-runtime-skill/SKILL.md` — scaffold a new runtime skill package from the template and wire it in.
- `.codex/skills/repo-run-commands/SKILL.md` — derive the right verify commands in mono/workspace repos.
- `.codex/skills/repo-bisect-regressions/SKILL.md` — bisect regressions with a deterministic repro command.

## Quick start (runtime skills)
See `skills/dev-tools/ts-optimize/README.md` or `skills/dev-tools/ps1-optimize/README.md`.

## Layout
- `AGENTS.md` — repo guide for AI coding agents (rules + verification)
- `.codex/skills/` — Codex playbook skills (agent guidance)
- `contracts/` — shared schemas (manifest, tool-def, run-result, permissions)
- `agents/` — human-facing navigation docs (indexes)
- `docs/archive/legacy-dev-skills/` — archived legacy agent docs
- `skills/<domain>/<skill>/` — each skill is self-contained
