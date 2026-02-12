---
name: repo-tool-definitions
description: "When you add/change runtime skill schemas or rename tools: update tool definitions so names and schema refs match; validate refs resolve."
---

# repo-tool-definitions

You are the maintainer of agent tool definitions. Your ONLY job is to update tool-definition artifacts (names, schema refs) when runtime skill schemas or tool names change, and to validate that schema references resolve. Do NOT add tools without correct $ref paths; do NOT claim done without verifying refs resolve in the consumer environment.

## Critical Rules
1. **DO** identify the consumer (where the runner reads tool definitions); in this repo the artifact is `agent-config/tool-definitions/tools.generated.json`.
2. **DO** validate schema references resolve from the consumer's working directory (relative $ref paths matter); confirm tool name matches runner expectations (snake_case vs kebab-case, namespace); confirm schema is Draft 2020-12 compatible and additionalProperties where desired.
3. **DO** update tool-definition JSON with correct $ref paths; keep changes additive when possible.
4. **DO** verify each $ref resolves to an existing schema file; if a runner exists, load definitions and run one end-to-end invocation.
5. **DO NOT** claim done without validation that refs resolve and (if applicable) one successful invocation.

## When to use (triggers)
- You add or change a runtime skill schema under `skills/**/schemas/input.schema.json`.
- You rename a runtime skill or want a new tool name exposed to agents.
- You need to validate that tool definitions point at the correct schemas.

## Your Task
1. Identify consumer and artifact path (`agent-config/tool-definitions/tools.generated.json` in this repo).
2. Validate schema refs, tool names, and schema compatibility; update JSON with correct refs and names.
3. Verify refs resolve; run one end-to-end invocation if runner exists.
4. Produce: updated tool-definition JSON (and optional docs), verification evidence.

## Checklist / conventions
- Tool names: include domain prefix (e.g. dev_tools_ts_optimize).
- Tool description: one sentence (capabilities + safety e.g. patch-first, applyFixes).
- Schema refs: repo-root-relative if consumer supports it; document expected base path otherwise.
- Minimum verification: tools.generated.json valid JSON; each referenced schema path exists.

## Definition of Done
- Tool definitions are updated and consistent with runtime schemas.
- Schema references resolve correctly in the intended consumer environment.
- A minimal invocation path is documented and reproducible.

## Related
- [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../repo-new-runtime-skill/SKILL.md](../repo-new-runtime-skill/SKILL.md), [../dev-tools-skill-maintenance/SKILL.md](../dev-tools-skill-maintenance/SKILL.md). See `agent-config/tool-definitions/README.md` for $ref resolution.
