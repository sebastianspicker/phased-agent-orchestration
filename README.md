# coding-agents-space

A skill-first repository layout for building and shipping **Coding Agent Skills** with strict schemas,
sandboxed execution, and testable implementations.

> Note: Legacy/non-AI agent content has been archived. This repository now focuses on AI coding agent skills.

## What’s included
- Runtime skills (Node-based packages under `skills/dev-tools/*`).
- Codex playbook skills (agent guidance under `.codex/skills/*`).
- Shared contracts in `contracts/`.
- Tool definitions in `agent-config/`.

## Runtime skills
- `skills/dev-tools/ts-optimize` — TypeScript/JavaScript diagnostics, patches, migrations, codegen, recommendations.
- `skills/dev-tools/ps1-optimize` — PowerShell diagnostics, lint fixes, migrations, codegen, recommendations.

## Playbook skills (agent guidance)
Playbooks are agent-friendly “how to use the runtime skills” guides:
- Index + quick links: `agents/dev-tools/README.md`
- Full playbook index: `.codex/skills/README.md`

## Requirements
- Node.js >= 20
- npm
- Python 3 (for `scripts/codex/validate_skills.py`)
- Docker (optional, for sandboxed runtime skill execution)
- PowerShell (`pwsh`) optional; used by `ps1-optimize` diagnostics when available

## Quickstart
Verify everything:
```bash
./scripts/verify.sh
```

Run a runtime skill locally via Docker (examples and input schemas):
- `skills/dev-tools/ts-optimize/README.md`
- `skills/dev-tools/ps1-optimize/README.md`

## Development
Per package:
```bash
cd skills/dev-tools/ts-optimize
npm ci
npm run build
npm test
```
```bash
cd skills/dev-tools/ps1-optimize
npm ci
npm run build
npm test
```

## Testing
- Repo-wide: `./scripts/verify.sh`
- Package-level: `npm test` in each runtime skill package

## Security
- Runtime skill sandboxes are configured to avoid network access (see each `sandbox/permissions.yaml`).
- CI includes CodeQL (SAST), Gitleaks (secret scanning), and `npm audit` (SCA) workflows.
- Please redact secrets from logs and issues.

## Troubleshooting
- Node version mismatch: ensure Node >= 20.
- Python not found: install Python 3 or adjust PATH.
- `npm ci` fails: delete `node_modules` and retry.
- `pwsh` not available: `ps1-optimize` diagnostics are skipped and logged.
- Gitleaks in CI: if required, set `GITLEAKS_LICENSE` secret for org repos.

## Repository layout
- `AGENTS.md` — repo guide for AI coding agents (rules + verification)
- `.codex/skills/` — Codex playbook skills
- `skills/dev-tools/*` — runtime skill packages
- `contracts/` — shared schemas
- `agent-config/` — tool definitions and constraints
- `docs/` — runbook, findings, log, decisions, repo map

## License
See `LICENSE`.
