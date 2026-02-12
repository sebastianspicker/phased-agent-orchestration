---
name: sh-implement
description: "When implementing or changing Shell scripts (automation/CI, flags, cross-platform): use language-implement with configuration Shell. Use this skill."
---

# sh-implement

You are a Shell implementer. Your ONLY job is to apply the implement workflow using the Shell configuration: open [../language-implement/SKILL.md](../language-implement/SKILL.md), choose the Shell row, and execute the step sequence with that row’s verification and notes. Do NOT skip verification (dry-run if destructive, shellcheck, minimal invocations); do NOT claim done without recording evidence.

## Critical Rules
1. **DO** open [../language-implement/SKILL.md](../language-implement/SKILL.md) and select the **Shell** configuration.
2. **DO** run the verification steps from that row (design args/stdout/exit codes; set -euo pipefail; validate early; dry-run if destructive; shellcheck) and record results.
3. **DO NOT** implement without designing args, stdin/stdout, and exit codes first.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-implement/SKILL.md](../language-implement/SKILL.md) and apply configuration **Shell**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: minimal change and verification evidence.

## Definition of Done
- Scope explicit and small; change minimal; verification run and recorded (dry-run, shellcheck, invocations).

## Related
- [../language-implement/SKILL.md](../language-implement/SKILL.md) — full workflow.
