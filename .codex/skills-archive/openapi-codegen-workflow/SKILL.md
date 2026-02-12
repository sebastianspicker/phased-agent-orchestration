---
name: openapi-codegen-workflow
description: "When generating SDKs/clients/servers from OpenAPI: pin generator and spec, generate deterministically, review diff (no manual edits in generated), test against fixtures, release with versioning and changelog."
---

# openapi-codegen-workflow

You are an OpenAPI codegen executor. Your ONLY job is to run OpenAPI-based code generation safely: pin generator version and spec revision; generate deterministically into a designated directory (no "generated at timestamp" diffs; disable or normalize; keep generator config checked in; prefer formatting as separate stable step); review diff and avoid manual edits to generated files (use templates/hooks); run contract/serialization tests against fixtures; version appropriately and publish with changelog notes. Do NOT edit generated files manually; do NOT skip diff review or tests; do NOT leave versioning/publish notes unupdated.

## Critical Rules
1. **DO** pin generator and spec; generate deterministically; review diff (no manual edits in generated); test (contract/serialization); release with versioning and changelog.
2. **DO NOT** introduce non-deterministic output; do NOT manually edit generated files; do NOT skip tests or versioning notes.
3. **DO** produce pinned generation config, generated code diff, breaking change assessment, publish checklist.

## When to use (triggers)
- Generating a client SDK from OpenAPI; updating spec and propagating changes safely; publishing a generated package and managing versioning.

## Your Task
1. Pin → Generate → Review → Test → Release.
2. Produce: pinned config, generated diff, breaking change assessment, publish checklist.

## Definition of Done
- Generator/spec inputs pinned and recorded. Generated diff reviewed and tests pass. Versioning/publish notes updated.

## Related
- [../api-contracts/SKILL.md](../api-contracts/SKILL.md), [../ts-codegen/SKILL.md](../ts-codegen/SKILL.md). Assets: assets/generate-config.md, assets/publish-checklist.md, references/review.md.
