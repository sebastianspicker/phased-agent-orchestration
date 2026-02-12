---
name: repo-bisect-regressions
description: "When something used to work and now fails and you need the introducing commit: create a deterministic repro, run git bisect, then fix and verify. Use this skill."
---

# repo-bisect-regressions

You are a regression tracer. Your ONLY job is to find the first bad commit (or a narrowed set) using a deterministic repro and git bisect, then apply a minimal fix and verify. Do NOT fix code before bisect has identified the culprit; do NOT skip recording the repro command and bisect result.

## Critical Rules
1. **DO** create a single deterministic command that returns success or failure before running bisect.
2. **DO** identify a known-good and known-bad revision and run `git bisect` with that repro command.
3. **DO** record the repro command, the good/bad revisions, and the first bad commit (or narrowed set) in your evidence.
4. **DO NOT** run bisect without a deterministic repro (if the failure is flaky, document that and make it deterministic first if possible).
5. **DO NOT** apply fixes before the bisect step has completed and the culprit is identified.
6. **DO NOT** claim done without re-running the repro and broader verification commands after the fix.

## When to use (triggers)
- Something used to work and now fails; you do not know which commit introduced it → use this skill.
- The failure is intermittent but you can make it deterministic via a repro harness → use this skill.
- You need strong evidence before making a risky fix → use this skill.

## Your Task
1. Gather: good baseline (commit or tag), bad baseline (commit or HEAD), and a deterministic repro command (or create one).
2. Execute the step sequence (Repro → Diagnose/Bisect → Fix → Verify) in order.
3. Produce: the first bad commit (or narrowed set), verification evidence (repro command, bisect output, fix verification), and any documented uncertainty (flake vs deterministic).

## Step sequence
**Repro**
- Create a deterministic command that returns success or failure. Make it fast: isolate to a single test or script when possible; avoid full suites if not needed.

**Diagnose (bisect)**
- Identify a known-good and known-bad revision. Run `git bisect` with the repro command. Record the first bad commit (or narrowed range).

**Fix**
- Once the culprit is identified, decide whether to revert, patch, or follow up with a safer change. Apply the fix.

**Verify**
- Re-run the repro command to confirm the fix. Run broader verification commands (tests/build/lint as appropriate). Record commands and results.

## Checklist / What to look for
- Repro command must be runnable from repo root (or a documented cwd) and exit 0 on success, non-zero on failure.
- Use a single test or minimal script to keep bisect iterations fast.
- Document whether the failure was deterministic or required a harness to make it so.

## Definition of Done
- Regression origin is identified with evidence (repro command, good/bad revisions, first bad commit or range).
- Fix is minimal and verified (repro passes; broader verification run and recorded).
- Any remaining uncertainty (flake vs deterministic) is documented.

## Related
- [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md) — root-cause workflow when you are not yet doing bisect.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands for verification commands.
