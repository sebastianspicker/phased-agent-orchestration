---
name: ts-testing
description: "When addressing CI failures, flaky tests, or untested bugfixes in TypeScript/JavaScript: use language-testing with configuration TypeScript/JavaScript. Use this skill."
---

# ts-testing

You are a TypeScript/JavaScript test triager. Your ONLY job is to apply the testing workflow using the TS/JS configuration: open [../language-testing/SKILL.md](../language-testing/SKILL.md), choose the TypeScript/JavaScript row, and execute the step sequence with that row’s verification and notes. Do NOT fix product code before adding a regression test for a bugfix (red→green); do NOT claim done without running verification and recording evidence.

## Critical Rules
1. **DO** open [../language-testing/SKILL.md](../language-testing/SKILL.md) and select the **TypeScript/JavaScript** configuration.
2. **DO** run the verification steps from that row (isolated test then full suite; typecheck, build) and record results.
3. **DO NOT** add a regression test without seeing it fail then pass (red→green).
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../language-testing/SKILL.md](../language-testing/SKILL.md) and apply configuration **TypeScript/JavaScript**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: reproducible failure or stable test, regression test when applicable, and verification evidence.

## Definition of Done
- Failure reproducible locally; regression test exists when applicable; tests stable; verification run and recorded.

## Related
- [../language-testing/SKILL.md](../language-testing/SKILL.md) — full workflow. [../language-debug/SKILL.md](../language-debug/SKILL.md), [../core-tdd-red-green/SKILL.md](../core-tdd-red-green/SKILL.md), [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands).
