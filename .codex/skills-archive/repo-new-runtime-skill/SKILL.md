---
name: repo-new-runtime-skill
description: "When adding a new runtime skill: scaffold from template (manifest, schemas, sandbox, tests), define contracts first, wire tool definitions and docs; verify build, tests, and one sandbox run."
---

# repo-new-runtime-skill

You are the scaffolder for new runtime skill packages. Your ONLY job is to create a new skill under `skills/<domain>/<skill>/` with manifest, schemas, sandbox, README, and tests per template; define input/output contracts first; wire tool definitions and docs; and verify build, tests, and at least one sandbox run. Do NOT skip schema or sandbox permissions; do NOT break repo conventions (see docs/skill-template.md, contracts/*.schema.json).

## Critical Rules
1. **DO** clarify the problem the skill solves and the minimal set of actions; define input and output schemas up front; decide sandbox permissions (filesystem, network) early.
2. **DO** create `skills/<domain>/<skill>/` with: manifest.yaml, schemas/input.schema.json, schemas/output.schema.json, sandbox/Dockerfile, sandbox/permissions.yaml, README.md, tests (unit/golden), package.json + tsconfig.json if Node-based.
3. **DO** use input schema with additionalProperties: false and required fields explicit; output schema stable RunResult format; patch-first semantics if emitting patches; sandbox default no-network, filesystem writes only when user opts in (e.g. applyFixes=true).
4. **DO** build and run tests; run at least one end-to-end invocation in sandbox (Docker) using examples/input.*.json; update agent-config/tool-definitions and docs if exposed as a tool.
5. **DO NOT** skip tests or sandbox run; do NOT allow writes outside intended scope without explicit opt-in.

## When to use (triggers)
- You are adding a new skill (new domain or new capability).
- You want a reproducible template for manifests/schemas/sandbox/tests.
- You need to wire the skill into agent tooling (tool definitions) and docs.

## Your Task
1. Define problem and minimal actions; define input/output schemas and sandbox permissions.
2. Scaffold directory with manifest, schemas, sandbox, README, tests, package.json/tsconfig if Node.
3. Implement; add/update tool definitions and docs if exposed as tool.
4. Run build, tests, and one sandbox run with examples/input.*.json.
5. Produce: new skill directory, repo navigation updates, verification evidence.

## Step sequence
- Define contracts and sandbox. Scaffold standard files per docs/skill-template.md.
- Implement; wire tool definitions (repo-tool-definitions) and README/agents docs.
- Build; run tests; run one E2E in sandbox.

## Checklist (Node-based skill)
- package.json scripts: build (compile to dist/), test (unit/golden).
- Input: additionalProperties: false, required explicit. Output: stable RunResult; patch-first if patches.
- Sandbox: no-network default; filesystem writes only with explicit opt-in.

## Definition of Done
- New skill directory matches template and is self-contained.
- Schemas, README, and implementation agree.
- Tests pass and at least one sandbox run is reproducible.

## Related
- [../repo-tool-definitions/SKILL.md](../repo-tool-definitions/SKILL.md), [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../dev-tools-skill-maintenance/SKILL.md](../dev-tools-skill-maintenance/SKILL.md). Template: docs/skill-template.md; contracts: contracts/*.schema.json.
