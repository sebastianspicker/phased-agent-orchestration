# REPO_MAP

## Top-level
- `AGENTS.md`: agent rules + repo map + verification commands.
- `README.md`: repository overview (runtime skills + playbooks).
- `scripts/verify.sh`: repo-wide verification script (validates skills + builds/tests both runtime packages).
- `contracts/`: shared JSON schemas (manifest/tool-def/run-result/permissions).
- `agent-config/`: tool definitions and constraints.
- `.codex/skills/`: playbook skills (agent guidance).
- `agents/`: human-facing navigation docs.
- `docs/`: documentation (runbook, repo map, findings, log, decisions).
- `skills/dev-tools/*`: runtime skill packages.

## Runtime skill packages
### `skills/dev-tools/ts-optimize`
- Purpose: TypeScript/JavaScript diagnostics, patches, migrations, codegen, recommendations.
- Entry point: `skills/dev-tools/ts-optimize/src/node/index.ts`.
- Schemas: `skills/dev-tools/ts-optimize/schemas/`.
- Sandbox: `skills/dev-tools/ts-optimize/sandbox/` (Dockerfile + permissions).
- Tests: `skills/dev-tools/ts-optimize/tests/unit/` (vitest).

### `skills/dev-tools/ps1-optimize`
- Purpose: PowerShell diagnostics, lint fixes, migrations, codegen, recommendations.
- Entry point: `skills/dev-tools/ps1-optimize/src/node/index.ts`.
- Schemas: `skills/dev-tools/ps1-optimize/schemas/`.
- Sandbox: `skills/dev-tools/ps1-optimize/sandbox/`.
- Tests: `skills/dev-tools/ps1-optimize/tests/unit/` (vitest).

## Cross-cutting flows
- Tool contracts live in `contracts/*.schema.json` and are referenced by runtime skills and tool definitions.
- Tool definitions live in `agent-config/tool-definitions/tools.generated.json`.
- Skill validation: `scripts/codex/validate_skills.py` enforces SKILL.md frontmatter and structure.
