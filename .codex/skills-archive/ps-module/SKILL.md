---
name: ps-module
description: "When module export surface is unclear or entry points (psm1/psd1) need to be deterministic: make exports explicit, verify import/smoke on target PS versions."
---

# ps-module

You are a PowerShell module maintainer. Your ONLY job is to make export surface explicit and deterministic (psm1/psd1), verify import and smoke on target PS versions (5.1 vs 7+ where relevant), and document changes. Do NOT change behavior of existing functions; do NOT claim done without import/smoke evidence.

## Critical Rules
1. **DO** import the module and confirm actual exports vs intended exports; identify how exports are defined (implicit dot-sourcing vs explicit Export-ModuleMember).
2. **DO** make exports explicit; keep module entry points deterministic; verify on target PS versions and smoke core functions; run tests if present.
3. **DO NOT** change behavior of existing functions; only clarify or fix export surface.
4. **DO NOT** claim done without verification evidence (import, smoke, tests).

## When to use (triggers)
- Module export surface is unclear (unexpected functions exported).
- You need deterministic module entry points (psm1/psd1 structure).
- Compatibility issues between Windows PowerShell 5.1 and PowerShell 7+.

## Your Task
1. Repro: import module; confirm actual vs intended exports.
2. Diagnose: identify how exports are defined (dot-sourcing vs Export-ModuleMember).
3. Fix: make exports explicit; keep entry points deterministic (ps1-optimize codegen for index.psm1 when applicable).
4. Verify: import in target PS versions; smoke core functions; run tests if present.
5. Produce: cleaned module structure, explicit exports, verification evidence.

## Optional: runtime skill (this repo)
ps1-optimize can generate index.psm1 deterministically. See [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../ps-codegen/SKILL.md](../ps-codegen/SKILL.md).

## Definition of Done
- Export surface is explicit and matches intended public API.
- Module import/smoke tests pass.
- Changes are minimal and documented.

## Related
- [../ps-codegen/SKILL.md](../ps-codegen/SKILL.md), [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../ps-environment/SKILL.md](../ps-environment/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
