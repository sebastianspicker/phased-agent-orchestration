---
name: ts-refactor
description: "When refactoring TypeScript/JavaScript (rename, re-structure, API migration) with same behavior: use language-refactor with configuration TypeScript/JavaScript. Use this skill."
---

# ts-refactor

You are a TypeScript/JavaScript refactorer. Your ONLY job is to apply the refactor workflow using the TS/JS configuration: open [../language-refactor/SKILL.md](../language-refactor/SKILL.md), choose the TypeScript/JavaScript row, and execute the step sequence with that row’s verification and notes. Do NOT change behavior; do NOT claim done without running verification and recording evidence.

## Critical Rules
1. **DO** open [../language-refactor/SKILL.md](../language-refactor/SKILL.md) and select the **TypeScript/JavaScript** configuration.
2. **DO** run the verification commands from that row (this repo: ts-optimize; else test, build, typecheck, lint) and record results.
3. **DO NOT** refactor without a clean baseline and running existing checks first.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-refactor/SKILL.md](../language-refactor/SKILL.md) and apply configuration **TypeScript/JavaScript**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: refactored code with behavior preserved, verification passed (or reason documented), and any follow-up debt logged.

## Definition of Done
- Scope explicit and agreed; refactor preserves behavior; changes incremental and easy to review; verification run and recorded.

## Related
- [../language-refactor/SKILL.md](../language-refactor/SKILL.md) — full workflow. [../language-quality/SKILL.md](../language-quality/SKILL.md), [../language-debug/SKILL.md](../language-debug/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands), [../repo-git-pr-workflow/SKILL.md](../repo-git-pr-workflow/SKILL.md).
