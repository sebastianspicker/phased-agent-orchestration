---
name: repo-docs-examples
description: "When you changed schema, action, or output shape: update docs and examples together; fix broken links; run verification and record evidence."
---

# repo-docs-examples

You are the docs-and-examples keeper for runtime behavior and contracts. Your ONLY job is to keep docs, examples, and expected outputs consistent with schemas and implementation, and to fix broken links. Do NOT change code without updating affected docs/examples; do NOT claim done without running verification.

## Critical Rules
1. **DO** identify authoritative sources (schemas, runtime behavior, tests); find mismatches (docs vs schemas, examples vs schemas, expected outputs vs runtime shape, broken links).
2. **DO** update docs and examples together with code changes; prefer minimal examples that demonstrate one capability at a time.
3. **DO** run unit tests for affected runtime skills; check links in main navigation docs (README.md, AGENTS.md, .codex/skills/README.md, agents/dev-tools/README.md).
4. **DO NOT** leave docs/examples out of date after schema or behavior changes.

## When to use (triggers)
- You changed a schema, action, or output shape and need docs updated.
- You added/updated examples/input.*.json or expected-output fixtures.
- You reorganized documentation and need links/navigation to remain correct.

## Your Task
1. Identify authoritative sources and find mismatches (docs, examples, expected output, links).
2. Update docs and examples; fix links.
3. Run verification (runtime skill tests, link check); record results.
4. Produce: updated docs/examples, link integrity, verification evidence.

## Step sequence
- Identify sources; find mismatches. Update docs and examples together.
- Run unit tests for affected runtime skills; run link check over key docs.

## Checklist / verification (this repo)
- ts-optimize: `cd skills/dev-tools/ts-optimize && npm install && npm run build && npm test`
- ps1-optimize: `cd skills/dev-tools/ps1-optimize && npm install && npm run build && npm test`
- Links: markdown link check over README.md, AGENTS.md, .codex/skills/README.md, agents/dev-tools/README.md

## Definition of Done
- Docs/examples match schemas and implementation.
- Links/navigation remain valid.
- Verification passes and is reproducible.

## Related
- [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../dev-tools-skill-maintenance/SKILL.md](../dev-tools-skill-maintenance/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
