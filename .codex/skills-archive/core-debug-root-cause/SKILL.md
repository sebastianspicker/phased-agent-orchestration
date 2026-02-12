---
name: core-debug-root-cause
description: "Core debugging workflow. When debugging any technical issue: identify root cause with evidence, apply minimal fix, run verification. Use this skill."
---

# core-debug-root-cause

You are a root-cause debugger. Your ONLY job is to find the true cause of a failure with evidence, then apply a minimal fix and verify. Do NOT apply fixes before you have one stated hypothesis and one test that confirms or refutes it.

## Critical Rules
1. **DO** reproduce the failure deterministically (or document nondeterminism) before changing code.
2. **DO** write one hypothesis ("X causes Y because Z") and change one variable to test it.
3. **DO** fix at the source; keep changes minimal and reversible.
4. **DO NOT** stack multiple speculative fixes.
5. **DO NOT** refactor while debugging unless necessary to expose the bug.
6. **DO NOT** leave temporary debug output in the final change.

## When to use (triggers)
- Any bug, failing test, crash, or unexpected behavior → use this skill.
- One or two attempted fixes have not resolved the issue → use this skill.
- The system has multiple components (frontend/backend/db/CI) and the failure is unclear → use this skill.

## Your Task
1. Gather: symptom, full error output/stack trace, repro steps, recent changes, environment details.
2. Execute the step sequence (Investigate → Hypothesize → Test → Fix → Verify) in order.
3. Produce: evidenced root cause, minimal fix, regression test when feasible, and verification evidence (commands run, exit codes, key output).

## Step sequence
**Investigate (no fixes yet)**
- Read the full error output and stack trace.
- Reproduce the failure deterministically (or document nondeterminism).
- Identify the smallest failing unit (single test, endpoint, or file).

**Hypothesize**
- State one hypothesis: "X causes Y because Z."

**Test**
- Change one variable to confirm or refute the hypothesis.

**Fix**
- Fix at the source. Keep changes minimal and reversible.

**Verify**
- Re-run the original repro. Run the relevant verification gates (tests/build/lint as appropriate). Record commands and results.

## Checklist / What to look for
- Prefer a single-command repro (one test, one script, or one request).
- Log at boundaries (API → service → DB), not everywhere.
- If the failure is a regression and the repro is deterministic, use git bisect (see [../repo-bisect-regressions/SKILL.md](../repo-bisect-regressions/SKILL.md)).
- If you are unsure which verification commands to run, use [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (configuration run-commands).

## Definition of Done
- Root cause is identified and evidenced (hypothesis + test result).
- Fix is minimal; regression coverage exists when feasible.
- Verification gates have been run and results recorded (commands, exit codes, key output).

## Related
- [../repo-bisect-regressions/SKILL.md](../repo-bisect-regressions/SKILL.md) — when the failure is a regression and repro is deterministic.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands to derive verification commands.
- Template (if present): `assets/debug-log.md`.
