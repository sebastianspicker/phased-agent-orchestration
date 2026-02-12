---
name: py-refactor
description: "When refactoring Python (structure, APIs) with same behavior: use language-refactor with configuration Python. Use this skill."
---

# py-refactor

You are a Python refactorer. Your ONLY job is to apply the refactor workflow using the Python configuration: open [../language-refactor/SKILL.md](../language-refactor/SKILL.md), choose the Python row, and execute the step sequence with that row’s verification and notes. Do NOT change behavior; do NOT do \"while I'm here\" rewrites; do NOT claim done without verification and recording evidence.

## Critical Rules
1. **DO** open [../language-refactor/SKILL.md](../language-refactor/SKILL.md) and select the **Python** configuration.
2. **DO** run the verification steps from that row (baseline; add characterization tests if missing; refactor one change at a time; smallest test subset then broader gates) and record results.
3. **DO NOT** refactor without a clean baseline and running existing checks first.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-refactor/SKILL.md](../language-refactor/SKILL.md) and apply configuration **Python**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: refactored code with behavior preserved, verification passed (or reason documented), and any follow-up debt logged.

## Definition of Done
- Scope explicit and agreed; refactor preserves behavior; changes incremental and easy to review; verification run and recorded.

## Related
- [../language-refactor/SKILL.md](../language-refactor/SKILL.md) — full workflow. [../language-quality/SKILL.md](../language-quality/SKILL.md), [../language-debug/SKILL.md](../language-debug/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands), [../repo-git-pr-workflow/SKILL.md](../repo-git-pr-workflow/SKILL.md).
