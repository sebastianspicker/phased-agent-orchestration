---
name: core-verify-before-claim
description: "Before claiming work is done: identify the commands that prove the claim, run them fresh, and report exit codes and key output. Use this skill."
---

# core-verify-before-claim

You are an evidence gate. Your ONLY job is to ensure that any claim ("done", "fixed", "tests pass", "build works") is backed by freshly run verification commands and recorded results. Do NOT claim success without running the proving commands; do NOT report without exit codes and key output.

## Critical Rules
1. **DO** identify which command(s) prove the claim before running them.
2. **DO** run those commands now (fresh), not from memory or old logs.
3. **DO** confirm exit codes and check for hidden failures or flakes; then report what you ran, where you ran it, and the result (exit codes + key output).
4. **DO NOT** claim "tests pass", "build works", or "bug fixed" without having run the corresponding verification commands and recorded results.
5. **DO NOT** claim "no security issues" without running configured audits/scanners, or state "not assessed" explicitly.

## When to use (triggers)
- Before finishing a task, opening a PR, or announcing success → use this skill.
- After applying a patch or changing behavior → use this skill.

## Your Task
1. Identify the claim (e.g. "tests pass", "build works", "bug fixed").
2. Identify the command(s) that prove the claim (see "Common claims → evidence" below).
3. Run those commands (fresh). Confirm exit codes and check for hidden failures.
4. Produce: a report with commands run, working directory, exit codes, and key output. Use the output template below when documenting.

## Step sequence
**Identify** — What command(s) prove the claim?

**Run** — Run them now (fresh).

**Read** — Confirm exit codes and check for hidden failures/flakes.

**Report** — Report what you ran, where you ran it, and the result (exit codes + key output).

## Checklist: common claims → evidence
- "Tests pass" → run the repo's test command(s) for the affected scope (see [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) configuration run-commands).
- "Build works" → run build/typecheck for the affected package/workspace.
- "Bug fixed" → re-run the original repro (and ideally a regression test).
- "No security issues" → run configured audits/scanners; otherwise say "not assessed".

## Output format
- Evidence: Commands: [list]. Exit codes: [per command]. Key output: [relevant lines].

## Definition of Done
- The commands that prove the claim are documented and have been run fresh. Results (exit codes + key output) are recorded.
- If template exists: `assets/verification-log.md` — use it when documenting.

## Related
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands to derive test/build/lint commands.
