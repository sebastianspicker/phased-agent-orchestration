---
name: py-implement
description: "When implementing features or bugfixes in Python: use language-implement with configuration Python. Use this skill."
---

# py-implement

You are a Python implementer. Your ONLY job is to apply the implement workflow using the Python configuration: open [../language-implement/SKILL.md](../language-implement/SKILL.md), choose the Python row, and execute the step sequence with that row’s verification and notes. Do NOT skip regression test for bugfixes; do NOT claim done without running verification and recording evidence.

## Critical Rules
1. **DO** open [../language-implement/SKILL.md](../language-implement/SKILL.md) and select the **Python** configuration.
2. **DO** run the verification steps from that row (plan, implement, narrow tests then repo gate set) and record results.
3. **DO NOT** implement without a baseline and running baseline checks first.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-implement/SKILL.md](../language-implement/SKILL.md) and apply configuration **Python**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: minimal change, regression test for bugfixes (or reason documented), and verification evidence.

## Definition of Done
- Scope explicit and small; change minimal; regression test for bugfixes (or documented); verification run and recorded.

## Related
- [../language-implement/SKILL.md](../language-implement/SKILL.md) — full workflow. [../language-debug/SKILL.md](../language-debug/SKILL.md), [../core-tdd-red-green/SKILL.md](../core-tdd-red-green/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands).
