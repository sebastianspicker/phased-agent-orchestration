# REPO_MAP

## Top-level
- `AGENTS.md` — agent rules, repo map, verification commands.
- `README.md` — repository overview (runtime skills + playbooks).
- `scripts/verify.sh` — repo-wide verification (validates playbook skills + runs lint/format/build/test on all runtime packages).
- `contracts/` — shared JSON schemas (artifact contracts + quality gate).
- `agent-config/` — tool definitions and constraints.
- `.codex/skills/` — playbook skills (agent guidance); index in `.codex/skills/README.md`. Other `.codex/` subdirs are excluded from this map.
- `deprecated/` — local-only retirement area for obsolete files (gitignored; not part of repository).
- `docs/` — runbook, repo map, skill template, decisions.
- `skills/dev-tools/*` — runtime skill packages.

## Runtime skill packages
### `skills/dev-tools/quality-gate`
- Purpose: validate JSON artifacts against a JSON Schema and run acceptance criteria checks.
- Entry point: `skills/dev-tools/quality-gate/src/index.ts`.
- Schemas: `skills/dev-tools/quality-gate/schemas/`.
- Sandbox: `skills/dev-tools/quality-gate/sandbox/` (Dockerfile + permissions).
- Tests: `skills/dev-tools/quality-gate/tests/unit/` (vitest).

### `skills/dev-tools/multi-model-review`
- Purpose: finding-processing engine (dedup + cost/benefit) for adversarial review; includes drift detection.
- Entry point: `skills/dev-tools/multi-model-review/src/index.ts`.
- Schemas: `skills/dev-tools/multi-model-review/schemas/`.
- Sandbox: `skills/dev-tools/multi-model-review/sandbox/`.
- Tests: `skills/dev-tools/multi-model-review/tests/unit/` (vitest).

### `skills/dev-tools/trace-collector`
- Purpose: validate execution trace events and generate deterministic run summaries.
- Entry point: `skills/dev-tools/trace-collector/src/index.ts`.
- Schemas: `skills/dev-tools/trace-collector/schemas/`.
- Sandbox: `skills/dev-tools/trace-collector/sandbox/`.
- Tests: `skills/dev-tools/trace-collector/tests/unit/` (vitest).

## Cross-cutting flows
- Tool contracts live in `contracts/*.schema.json` and are referenced by runtime skills and tool definitions.
- Tool definitions live in `agent-config/tool-definitions/tools.generated.json`.
- Skill validation: `scripts/codex/validate_skills.py` enforces SKILL.md frontmatter and structure.
- Release-readiness contract: `contracts/artifacts/release-readiness.schema.json` defines final go/no-go evidence requirements.
- Security orchestration contract: `contracts/artifacts/quality-report.schema.json` requires `security_audit` for `audit_type=security`, including coverage checklist, fix-loop evidence, and accepted-risk signoff metadata.
