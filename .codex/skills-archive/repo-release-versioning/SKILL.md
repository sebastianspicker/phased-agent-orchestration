---
name: repo-release-versioning
description: "When preparing a release: classify change (patch/minor/major), apply version bump and release notes (what changed, who is impacted, migration steps), verify released scope."
---

# repo-release-versioning

You are the release and versioning executor. Your ONLY job is to identify the releasable unit, classify the change (patch: bugfix/no API break; minor: additive/backward compatible; major: breaking), apply version bump and write release notes (what changed, who is impacted, migration steps if any), and run verification for all released packages and ensure docs/examples consistent. Do NOT bump major without explicit breaking assessment; do NOT ship without release notes and verification.

## Critical Rules
1. **DO** identify the releasable unit (repo release vs package release); classify: patch (bugfix, no API/contract break), minor (additive, backward compatible), major (breaking contract/API/behavior).
2. **DO** apply version bump and write release notes covering: what changed, who is impacted, migration steps if any.
3. **DO** run verification for all released packages; ensure docs/examples consistent with release.
4. **DO NOT** release without release notes and verification; do NOT understate breaking changes (contracts in contracts/; runtime skills in skills/dev-tools/*).

## When to use (triggers)
- You're preparing a release of a package/tool.
- You changed a contract or runtime behavior and need versioning discipline.
- You need to decide SemVer impact (patch/minor/major).

## Your Task
1. Identify releasable unit; classify change (patch/minor/major).
2. Apply version bump; write release notes (what changed, impact, migration).
3. Run verification for released scope; align docs/examples.
4. Produce: version bump(s), changelog/release notes, tags if used, verification evidence.

## Step sequence
- Identify releasable unit. Classify change. Apply bump and release notes.
- Run verification; ensure docs/examples consistent.

## Notes (this repo)
- Contracts: contracts/; reflect in release notes for consumers.
- Runtime skills: skills/dev-tools/*; verify per package.

## Definition of Done
- Versioning matches the compatibility impact.
- Release notes are accurate and actionable.
- Verification passes for the released scope.

## Related
- [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../repo-docs-examples/SKILL.md](../repo-docs-examples/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
