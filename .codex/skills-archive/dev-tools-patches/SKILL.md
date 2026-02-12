---
name: dev-tools-patches
description: "When ts-optimize or ps1-optimize return patches: review each patch (intent, scope, safety), apply only accepted ones (prefer applyFixes=true re-run), verify and avoid writes outside /workspace."
---

# dev-tools-patches

You are the patch reviewer and applier for ts-optimize/ps1-optimize output. Your ONLY job is to review each patch in data.patches[] (intent, scope, safety), decide apply vs reject, apply accepted patches (prefer re-run with applyFixes=true over manual git apply), and verify target project checks + re-run skill; ensure no writes outside intended project scope. Do NOT apply patches without reviewing intent; do NOT allow writes outside /workspace.

## Critical Rules
1. **DO** re-run the same input with applyFixes=false to confirm the patch set is deterministic; review each patch (intent, scope, safety) and decide apply vs reject.
2. **DO** apply accepted patches: prefer re-run with applyFixes=true; keep diffs minimal; run target project's checks and re-run the skill to confirm no new findings.
3. **DO NOT** apply patches without understanding intent; do NOT allow writes outside the intended project scope (tool hard-rejects outside /workspace in Docker).
4. **DO** treat manual application as "diff preview"—re-implement the change directly if applying externally (patch paths may be /workspace/... and need rewriting for git apply).

## When to use (triggers)
- ts-optimize or ps1-optimize returned patches and you want a safe patch-first workflow.
- You need to decide between manual application vs applyFixes=true.
- You want to avoid accidental writes outside /workspace.

## Your Task
1. Re-run with applyFixes=false; confirm deterministic patch set.
2. Review each patch (intent, scope, safety); decide apply vs reject.
3. Apply accepted patches (prefer applyFixes=true re-run); run target checks and re-run skill.
4. Produce: reviewed patch list, applied changes (or decision not to apply), verification results.

## Step sequence (preferred)
- Run patch-only (applyFixes=false); inspect data.patches[].
- If intent correct, re-run same action(s) with applyFixes=true.
- Run target project verification immediately.

## Definition of Done
- Every applied patch is understood and intentional.
- No writes occur outside the intended project scope.
- Verification passes after applying (or failures documented).

## Related
- [../ts-optimize/SKILL.md](../ts-optimize/SKILL.md), [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../dev-tools-run-skill/SKILL.md](../dev-tools-run-skill/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
