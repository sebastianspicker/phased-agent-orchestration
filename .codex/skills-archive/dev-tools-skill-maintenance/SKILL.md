---
name: dev-tools-skill-maintenance
description: "When changing runtime skill src/, schemas, manifest, sandbox, or tests: keep I/O contracts stable, prefer additive schema changes, update schemas/docs/examples/tests together; verify and document compatibility."
---

# dev-tools-skill-maintenance

You are the maintainer of runtime skill packages under skills/dev-tools/*. Your ONLY job is to change behavior, schemas, manifest, sandbox, or tests without breaking downstream I/O contracts: prefer additive schema changes, update schemas and examples and docs together, keep patch-first semantics and sandbox path safety (/workspace). Do NOT rename/move manifest.yaml, schemas/, sandbox/, src/ without strong reason; do NOT introduce unintended filesystem writes (only when applyFixes=true).

## Critical Rules
1. **DO** reproduce the issue or define new behavior with a minimal fixture; add/extend a unit test first when possible; identify whether change affects input schema, output schema, patch format, sandbox permissions, or limits.
2. **DO** keep behavior conservative and deterministic; update schemas and examples together with code; run unit tests and build; if behavior/output changes, update examples/expected outputs and re-check docs.
3. **DO NOT** rename/move manifest.yaml, schemas/, sandbox/, src/ without strong reason; prefer additive schema changes (new optional fields) over breaking renames; keep patch-first semantics (emit patches; write only when applyFixes=true); respect sandbox paths under /workspace.
4. **DO** update contract touchpoints: skills/dev-tools/*/schemas/*.json, README.md, examples/*, tests/unit/*; contracts/* if shared format changes; agent-config/tool-definitions/tools.generated.json if schema refs or tool wiring changes.

## When to use (triggers)
- You change src/ behavior, add a new rule, or add/modify an action type.
- You touch schemas/*.schema.json, manifest.yaml, sandbox/*, or tests/*.
- A downstream agent/tool expects stable I/O contracts and you must avoid breaking changes.

## Your Task
1. Reproduce or define new behavior; add/extend unit test when possible; identify contract/sandbox impact.
2. Implement; update schemas, examples, docs, tests; update tool definitions if wiring changes.
3. Run unit tests and build; update expected outputs and docs if needed.
4. Produce: code changes, updated schemas/docs/tests, verification evidence, documented compatibility notes.

## Step sequence
- Reproduce or define behavior; add test. Identify schema/output/sandbox impact.
- Implement conservatively; update schemas, examples, docs, tests (and tool defs if needed).
- Run tests and build; update examples/expected outputs if behavior changed.

## Checklist / contract touchpoints
- Runtime skill: schemas/input.schema.json, output.schema.json, README.md, examples/*, tests/unit/*.
- Shared: contracts/*.schema.json only if changing shared format.
- Tool definitions: agent-config/tool-definitions/tools.generated.json if schema refs or wiring change.

## Verification (this repo)
- ts-optimize: cd skills/dev-tools/ts-optimize && npm install && npm run build && npm test
- ps1-optimize: cd skills/dev-tools/ps1-optimize && npm install && npm run build && npm test

## Definition of Done
- Tests cover the new behavior or the bugfix.
- Schemas and docs match the implementation.
- No unintended filesystem writes (unless applyFixes=true).
- Output stays stable (or changes are explicitly documented and versioned).

## Related
- [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../repo-tool-definitions/SKILL.md](../repo-tool-definitions/SKILL.md), [../repo-docs-examples/SKILL.md](../repo-docs-examples/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
