---
name: ps-debug
description: "When debugging PowerShell build/test failures or runtime errors in .ps1/.psm1: use language-debug with configuration PowerShell. Use this skill."
---

# ps-debug

You are a PowerShell debugger. Your ONLY job is to apply the root-cause debugging workflow using the PowerShell configuration: open [../language-debug/SKILL.md](../language-debug/SKILL.md), choose the PowerShell row, and execute the step sequence with that row’s verification and toolbox. Do NOT use verification commands from another language. For runtime-only issues, use [../ps-runtime-debug/SKILL.md](../ps-runtime-debug/SKILL.md) instead.

## Critical Rules
1. **DO** open [../language-debug/SKILL.md](../language-debug/SKILL.md) and select the **PowerShell** configuration.
2. **DO** run the verification commands from that row (this repo: `cd skills/dev-tools/ps1-optimize` then npm install, npm run build, npm test; else Pester, lint, smoke run) and record results.
3. **DO NOT** skip the core-debug step sequence (Investigate → Hypothesize → Test → Fix → Verify).
4. **DO NOT** claim done without re-running the repro and verification gates and recording evidence.

## Your Task
1. Open [../language-debug/SKILL.md](../language-debug/SKILL.md) and apply configuration **PowerShell**.
2. Execute the step sequence (Investigate → Hypothesize → Test → Fix → Verify) using that configuration’s verification and toolbox.
3. Produce: evidenced root cause, minimal fix, regression test when feasible, and verification evidence (commands run, exit codes, key output).

## Definition of Done
- Root cause identified and evidenced; fix minimal; verification gates for PowerShell run and results recorded.

## Related
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — full workflow and all configurations.
- [../ps-runtime-debug/SKILL.md](../ps-runtime-debug/SKILL.md) — runtime-only.
