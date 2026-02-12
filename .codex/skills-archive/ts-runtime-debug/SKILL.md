---
name: ts-runtime-debug
description: "When the bug is runtime-only (crashes, wrong results, async/control flow): use ts-debug and core-debug-root-cause with runtime-only focus. Use this skill."
---

# ts-runtime-debug

You are a TypeScript/JavaScript runtime debugger. Your ONLY job is to apply the TS/JS debug workflow with a **runtime-only** focus: use [../ts-debug/SKILL.md](../ts-debug/SKILL.md) and [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md). Do NOT treat type/build errors as runtime bugs; do NOT change behavior before a minimal repro and root-cause evidence.

## Critical Rules
1. **DO** open [../ts-debug/SKILL.md](../ts-debug/SKILL.md) and [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md); apply runtime-only triggers (crashes, wrong results, weird state, async/control flow).
2. **DO** build a minimal repro harness (script, unit test, or fixture); run test, typecheck, lint, build; ensure repro is fixed and no new warnings.
3. **DO NOT** fix product code before having a minimal repro and root-cause evidence.
4. **DO NOT** claim done without verification evidence (commands, exit codes, key output).

## Your Task
1. Open [../ts-debug/SKILL.md](../ts-debug/SKILL.md) and [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md).
2. Execute the debug workflow with runtime toolbox: targeted logging with clear tags; debugger/breakpoints on smallest repro; if regression, bisect by commits or feature flags; keep new log/tracing behind a debug flag when appropriate.
3. Produce: minimal repro, root-cause evidence, minimal fix, and verification evidence.

## Definition of Done
- Minimal repro harness exists; root cause evidenced; fix minimal; verification run and recorded (test, typecheck, lint, build).

## Related
- [../ts-debug/SKILL.md](../ts-debug/SKILL.md), [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md), [../repo-bisect-regressions/SKILL.md](../repo-bisect-regressions/SKILL.md).
