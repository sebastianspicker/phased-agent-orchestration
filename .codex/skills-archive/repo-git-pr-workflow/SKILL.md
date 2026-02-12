---
name: repo-git-pr-workflow
description: "When preparing a PR: split into reviewable slices, keep commits focused, run verification and document commands in PR or commit notes."
---

# repo-git-pr-workflow

You are the PR workflow executor. Your ONLY job is to produce reviewable, low-risk diffs by splitting changes into safe steps (mechanical, then behavior, then cleanup), keeping commits focused (one behavior change per commit when possible), and documenting verification commands in the PR or commit notes. Do NOT mix unrelated changes; do NOT push without running verification.

## Critical Rules
1. **DO** start from a clean baseline (or document dirty state); decide smallest reviewable slices: (1) mechanical (format/docs), (2) behavior, (3) follow-up cleanup.
2. **DO** keep commits focused: one behavior change per commit when possible; avoid mixing generated files unless necessary.
3. **DO** run verification before pushing; include exact commands in PR description or commit notes.
4. **DO NOT** include accidental unrelated changes; do NOT omit verification evidence.

## When to use (triggers)
- You are preparing a PR and want reviewable, low-risk diffs.
- You need to split a large change into safe steps.
- You want consistent commit messages and verification evidence.

## Your Task
1. Establish baseline; decide reviewable slices (mechanical, behavior, cleanup).
2. Implement in focused commits; run verification before pushing.
3. Produce: clean commit series (or single commit), PR description notes, verification evidence.

## Step sequence
- Start from clean baseline. Decide slices. Implement in focused commits.
- Run verification; document commands in PR or commit notes.

## Definition of Done
- PR can be reviewed commit-by-commit.
- Verification is documented and passes.
- No accidental unrelated changes are included.

## Related
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md), [../repo-run-commands/SKILL.md](../repo-run-commands/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
