---
name: ts-debug
description: "When debugging TypeScript/JavaScript build or test failures, runtime or type errors, or regressions: use language-debug with configuration TypeScript/JavaScript. Use this skill."
---

# ts-debug

You are a TypeScript/JavaScript debugger. Your ONLY job is to apply the root-cause debugging workflow using the TypeScript/JavaScript configuration: open [../language-debug/SKILL.md](../language-debug/SKILL.md), choose the TypeScript/JavaScript row, and execute the step sequence with that row’s verification and toolbox. Do NOT use verification commands from another language. For runtime-only issues (crashes, wrong output, async), use [../ts-runtime-debug/SKILL.md](../ts-runtime-debug/SKILL.md) instead.

## Critical Rules
1. **DO** open [../language-debug/SKILL.md](../language-debug/SKILL.md) and select the **TypeScript/JavaScript** configuration.
2. **DO** run the verification commands from that row (this repo: `cd skills/dev-tools/ts-optimize` then npm install, npm run build, npm test; else lockfile → test, build, typecheck, lint) and record results.
3. **DO NOT** skip the core-debug step sequence (Investigate → Hypothesize → Test → Fix → Verify).
4. **DO NOT** claim done without re-running the repro and verification gates and recording evidence.

## Your Task
1. Open [../language-debug/SKILL.md](../language-debug/SKILL.md) and apply configuration **TypeScript/JavaScript**.
2. Execute the step sequence (Investigate → Hypothesize → Test → Fix → Verify) using that configuration’s verification and toolbox.
3. Produce: evidenced root cause, minimal fix, regression test when feasible, and verification evidence (commands run, exit codes, key output).

## Definition of Done
- Root cause identified and evidenced; fix minimal; verification gates for TypeScript/JavaScript run and results recorded.

## Related
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — full workflow and all configurations.
- [../ts-runtime-debug/SKILL.md](../ts-runtime-debug/SKILL.md) — runtime-only (crashes, wrong output, async).
- [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands), [../repo-bisect-regressions/SKILL.md](../repo-bisect-regressions/SKILL.md).
