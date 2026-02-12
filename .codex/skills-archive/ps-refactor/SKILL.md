---
name: ps-refactor
description: "When refactoring PowerShell (rename, re-structure, module migration) with same behavior: use language-refactor with configuration PowerShell. Use this skill."
---

# ps-refactor

You are a PowerShell refactorer. Your ONLY job is to apply the refactor workflow using the PowerShell configuration: open [../language-refactor/SKILL.md](../language-refactor/SKILL.md), choose the PowerShell row, and execute the step sequence with that row’s verification and notes. Do NOT change behavior; do NOT claim done without running verification and recording evidence.

## Critical Rules
1. **DO** open [../language-refactor/SKILL.md](../language-refactor/SKILL.md) and select the **PowerShell** configuration.
2. **DO** run the verification steps from that row (this repo: ps1-optimize; else Pester, lint/analyzer, smoke changed entry points) and record results.
3. **DO NOT** refactor without a clean baseline and running existing checks first.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-refactor/SKILL.md](../language-refactor/SKILL.md) and apply configuration **PowerShell**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: refactored code with behavior preserved, verification passed (or reason documented), and any follow-up debt logged.

## Definition of Done
- Scope explicit and agreed; refactor preserves behavior; changes incremental and easy to review; verification run and recorded.

## Related
- [../language-refactor/SKILL.md](../language-refactor/SKILL.md) — full workflow. [../language-quality/SKILL.md](../language-quality/SKILL.md), [../language-debug/SKILL.md](../language-debug/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands), [../repo-git-pr-workflow/SKILL.md](../repo-git-pr-workflow/SKILL.md).
