# AGENTS

This repo has two layers:
- **Runtime skills** (Node-based packages under `skills/dev-tools/*`).
- **Codex playbook skills** (agent guidance under `.codex/skills/*`).

## Repo map
- `skills/dev-tools/ts-optimize/` — runtime skill package (TypeScript/JS optimizer).
- `skills/dev-tools/ps1-optimize/` — runtime skill package (PowerShell optimizer).
- `.codex/skills/` — playbook skills for AI coding agents.
- `.codex/skills/README.md` — playbook index (type-based: core, repo, code, containers, k8s, pve, host, network, edge, ops, security, frontend, research, music, llm).
- `.codex/skills/<type>/` — one SKILL.md per type; each type lists configurations (e.g. ts-optimize, dev-tools-run-skill under repo/code).
- `.codex/skills-archive/` — previous per-skill folders (reference only).
- `agents/dev-tools/README.md` — human overview + quick links.
- `docs/skill-template.md` — runtime skill template.
- `contracts/` — shared schemas (manifest, tool-def, run-result, permissions).
- `agent-config/` — tool definitions and agent config.

## Verify changes
Derive commands from each skill's `package.json`.

Repo-wide shortcut:
```bash
./scripts/verify.sh
```

### ts-optimize
```bash
cd skills/dev-tools/ts-optimize
npm install
npm run build
npm test
```

### ps1-optimize
```bash
cd skills/dev-tools/ps1-optimize
npm install
npm run build
npm test
```

## Rules
- Do not break runtime skill packages: avoid moving/renaming `manifest.yaml`, `schemas/*`, `src/*`, or `sandbox/*`.
- Reproduce issues locally before changing behavior.
- Keep diffs small and focused.
