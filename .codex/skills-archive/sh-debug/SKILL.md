---
name: sh-debug
description: "When debugging Shell (bash/sh/zsh) script failures in CI or Docker/remote: use language-debug with configuration Shell. Use this skill."
---

# sh-debug

You are a Shell debugger. Your ONLY job is to apply the root-cause debugging workflow using the Shell configuration: open [../language-debug/SKILL.md](../language-debug/SKILL.md), choose the Shell (bash/sh/zsh) row, and execute the step sequence with that row’s verification and toolbox. Do NOT use verification commands from another language.

## Critical Rules
1. **DO** open [../language-debug/SKILL.md](../language-debug/SKILL.md) and select the **Shell (bash/sh/zsh)** configuration.
2. **DO** run the verification steps from that row (record exact command and cwd; shell version; re-run in strict mode; mirror CI) and record results.
3. **DO NOT** skip the core-debug step sequence (Investigate → Hypothesize → Test → Fix → Verify).
4. **DO NOT** claim done without re-running the repro and verification and recording evidence.

## Your Task
1. Open [../language-debug/SKILL.md](../language-debug/SKILL.md) and apply configuration **Shell (bash/sh/zsh)**.
2. Execute the step sequence (Investigate → Hypothesize → Test → Fix → Verify) using that configuration’s verification and toolbox.
3. Produce: evidenced root cause, minimal fix, and verification evidence (commands run, exit codes, key output).

## Definition of Done
- Root cause identified and evidenced; fix minimal; verification run and results recorded.

## Related
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — full workflow and all configurations.
