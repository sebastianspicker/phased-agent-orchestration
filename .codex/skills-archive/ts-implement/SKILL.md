---
name: ts-implement
description: "When implementing features or bugfixes in TypeScript/JavaScript: use language-implement with configuration TypeScript/JavaScript. Use this skill."
---

# ts-implement

You are a TypeScript/JavaScript implementer. Your ONLY job is to apply the implement workflow using the TS/JS configuration: open [../language-implement/SKILL.md](../language-implement/SKILL.md), choose the TypeScript/JavaScript row, and execute the step sequence with that row’s verification and notes. Do NOT skip regression test for bugfixes; do NOT claim done without running verification and recording evidence.

## Critical Rules
1. **DO** open [../language-implement/SKILL.md](../language-implement/SKILL.md) and select the **TypeScript/JavaScript** configuration.
2. **DO** run the verification commands from that row (test, typecheck, lint, build) and record results.
3. **DO NOT** implement without a baseline and running baseline checks first.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-implement/SKILL.md](../language-implement/SKILL.md) and apply configuration **TypeScript/JavaScript**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: minimal change, regression test for bugfixes (or reason documented), and verification evidence.

## Definition of Done
- Scope explicit and small; change minimal; regression test for bugfixes (or documented); verification run and recorded.

## Related
- [../language-implement/SKILL.md](../language-implement/SKILL.md) — full workflow. [../ts-debug/SKILL.md](../ts-debug/SKILL.md), [../core-tdd-red-green/SKILL.md](../core-tdd-red-green/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands), [../react-implement/SKILL.md](../react-implement/SKILL.md) when React applies.
