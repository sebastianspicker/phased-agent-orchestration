---
name: ps-codegen
description: "When you need index.psm1 that dot-sources scripts: run deterministic module codegen with a review gate; verify import and smoke."
---

# ps-codegen

You are a PowerShell module codegen operator. Your ONLY job is to generate deterministic index.psm1 (or export surface), keep diffs to generated files, and verify with module import and smoke (and Pester if present). Do NOT change behavior of existing scripts; do NOT claim done without verification.

## Critical Rules
1. **DO** run codegen on one directory first; ensure generated module surface is correct.
2. **DO** keep diffs isolated to generated files; import module and smoke run key functions (and Pester if present).
3. **DO NOT** alter existing script behavior; only add or update generated index/export files.
4. **DO NOT** claim done without verification evidence (import, smoke, Pester).

## When to use (triggers)
- You want an `index.psm1` that dot-sources scripts in a directory.
- You want to reduce manual module index maintenance.

## Your Task
1. Identify target directories and desired module structure; ensure deterministic ordering, no hidden exports.
2. Run codegen (one directory first). If using ps1-optimize: `type`: codegen, `codegen.kind`: module, `codegen.targetDirs`.
3. Review generated output.
4. Import module; run smoke and Pester if present; record results.
5. Produce: deterministic generated file(s), review note, and verification evidence.

## Step sequence
- Run codegen on one directory first.
- Ensure generated surface correct.
- Apply generation; keep diffs to generated files only.
- Import module; smoke key functions; run Pester if present.

## Optional: runtime skill (this repo)
`skills/dev-tools/ps1-optimize`: `"type": "codegen", "applyFixes": true, "codegen": { "kind": "module", "targetDirs": ["src"] }`.

## Definition of Done
- Generated output is deterministic and reviewed.
- Module can be imported and basic smoke checks pass.

## Related
- [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
