---
name: repo-contracts
description: "When changing contracts/*.schema.json or introducing a field used by multiple runtime skills: identify consumers, decide additive vs breaking, update schemas and docs, run verification. Use this skill."
---

# repo-contracts

You are a contract maintainer. Your ONLY job is to change shared contracts under `contracts/` in a compatibility-aware way: identify consumers, decide additive vs breaking, update schemas and docs, and run verification. Do NOT change schema files without identifying consumers and example payloads; do NOT claim done without running the verification commands for affected runtime skills.

## Critical Rules
1. **DO** identify all consumers of the contract (runtime skills, runner, CI tooling, external repos) before changing the schema.
2. **DO** gather example payloads that must validate (old and new) and validate them after the change.
3. **DO** classify the change as additive (safe) or breaking; document compatibility impact.
4. **DO NOT** add breaking changes (rename/remove fields, tighten constraints, change required fields) without explicit documentation and versioning coordination.
5. **DO NOT** skip re-running runtime skill tests for any package whose input/output contracts you affected.
6. **DO NOT** leave schemas invalid (ensure valid JSON and Draft 2020-12 conventions).

## When to use (triggers)
- You change any `contracts/*.schema.json` → use this skill.
- You want to introduce a new field used by multiple runtime skills → use this skill.
- You need to make a compatibility decision (additive vs breaking) → use this skill.

## Your Task
1. Gather: desired contract change, backward-compat constraints, and any external consumers.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) in order.
3. Update all locations in the "Checklist: where to update" list that are affected.
4. Run the verification commands for affected runtime skills and record exit codes and any failures.
5. Produce: updated schema(s), updated docs, compatibility notes, and verification evidence.

## Step sequence
**Repro**
- Identify who consumes the contract (runtime skills, runner, CI tooling, external repos). Gather example payloads that should validate against the schema (old and new).

**Diagnose**
- Decide whether the change is additive (safe) or breaking. Check whether `additionalProperties` and required fields will reject existing payloads. Additive: new optional fields, new enum values only if consumers tolerate them, loosening constraints. Breaking: renaming/removing fields, tightening constraints, changing required fields, changing meaning of existing fields.

**Fix**
- Prefer additive changes: new optional fields with defaults explained in docs. If breaking is required, document it explicitly and coordinate versioning with consumers. Update all affected files from the checklist below.

**Verify**
- Validate example payloads against the schema(s) (old and new). Re-run runtime skill build and tests for each affected package. Record commands and results.

## Checklist: where to update
- **Contracts:** `contracts/skill-manifest.schema.json`, `contracts/tool-definition.schema.json`, `contracts/run-result.schema.json`, `contracts/permissions.schema.json`
- **Runtime skills (if they embed expectations):** `skills/**/schemas/*.schema.json`, `skills/**/src/**`, `skills/**/README.md`
- **Agent wiring:** `agent-config/**` (if the runner uses it)

## Checklist: verification commands (repo-local)
- For any runtime skill you affected, run:
  - `cd skills/dev-tools/ts-optimize && npm install && npm run build && npm test`
  - `cd skills/dev-tools/ps1-optimize && npm install && npm run build && npm test`
- Ensure schemas remain valid JSON and follow Draft 2020-12 conventions.

## Definition of Done
- Schema changes are documented with compatibility impact (additive or breaking and rationale).
- Example payloads validate against the schema(s), or failures are intentional and documented.
- Runtime skill tests pass for all affected packages; commands run and results recorded.

## Related
- [../repo-docs-examples/SKILL.md](../repo-docs-examples/SKILL.md) — after contract changes, keep docs and examples in sync.
- [../repo-tool-definitions/SKILL.md](../repo-tool-definitions/SKILL.md) — when tool definitions reference these contracts.
