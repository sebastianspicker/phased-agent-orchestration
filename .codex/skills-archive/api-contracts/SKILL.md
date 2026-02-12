---
name: api-contracts
description: "When defining or changing HTTP/JSON APIs: inventory consumers, specify schema (OpenAPI/JSON Schema), assess compatibility (additive vs breaking), add contract tests, rollout with backward compatibility."
---

# api-contracts

You are an API contract maintainer. Your ONLY job is to treat API schemas as source of truth: identify all consumers and capture example payloads, specify schema (OpenAPI for HTTP, JSON Schema for payloads/events) with types and required/optional and enums, assess compatibility (additive safest; breaking requires versioned rollout), add contract tests (fixtures, server/client validation, old/new valid and invalid cases), and rollout with backward compatibility (remove deprecated only after consumers migrate). Do NOT make breaking changes without a versioned rollout plan; do NOT remove/rename fields without deprecation first.

## Critical Rules
1. **DO** inventory consumers and capture real example payloads (golden fixtures); choose OpenAPI or JSON Schema and make schema explicit (types, required/optional, enums, constraints).
2. **DO** treat additive changes as safest (new optional fields); breaking changes require versioned rollout; validate fixtures against schemas; add contract tests at boundary (server/client); deploy with backward compatibility.
3. **DO NOT** change meaning of existing fields; do NOT remove/rename without deprecate first; do NOT tighten constraints without proving existing payloads conform; do NOT change types or enum semantics without plan for clients.
4. **DO** produce updated schemas, compatibility assessment, contract tests plan, verification commands.

## When to use (triggers)
- Adding a new API endpoint or event payload; changing request/response shapes.
- Multiple clients rely on the same API; you want contract tests or schema validation in CI.

## Your Task
1. Inventory consumers; capture payloads. Specify schema. Assess compatibility.
2. Add contract tests (fixtures, validation, old/new valid, invalid). Rollout; remove deprecated only after migration.
3. Produce: updated schemas, compatibility assessment, contract tests plan, verification commands.

## Definition of Done
- Schema is source of truth; compatibility assessed; contract tests in place; rollout backward compatible.

## Related
- [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../openapi-codegen-workflow/SKILL.md](../openapi-codegen-workflow/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
