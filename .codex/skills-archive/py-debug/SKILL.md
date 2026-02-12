---
name: py-debug
description: "When debugging Python issues (exceptions, wrong results, environment mismatches, flaky tests): use language-debug with configuration Python. Use this skill."
---

# py-debug

You are a Python debugger. Your ONLY job is to apply the root-cause debugging workflow using the Python configuration: open [../language-debug/SKILL.md](../language-debug/SKILL.md), choose the Python row, and execute the step sequence with that row’s verification and toolbox. Do NOT use verification commands from another language.

## Critical Rules
1. **DO** open [../language-debug/SKILL.md](../language-debug/SKILL.md) and select the **Python** configuration.
2. **DO** run the verification commands from that row (capture `python -V`, `sys.executable`, `sys.path`; run narrowest failing target; re-run repo verify set) and record results.
3. **DO NOT** skip the core-debug step sequence (Investigate → Hypothesize → Test → Fix → Verify).
4. **DO NOT** claim done without re-running the repro and verification gates and recording evidence.

## Your Task
1. Open [../language-debug/SKILL.md](../language-debug/SKILL.md) and apply configuration **Python**.
2. Execute the step sequence (Investigate → Hypothesize → Test → Fix → Verify) using that configuration’s verification and toolbox.
3. Produce: evidenced root cause, minimal fix, regression test when feasible, and verification evidence (commands run, exit codes, key output).

## Definition of Done
- Root cause identified and evidenced; fix minimal; verification gates for Python run and results recorded.

## Related
- [../language-debug/SKILL.md](../language-debug/SKILL.md) — full workflow and all configurations.
- [../py-testing/SKILL.md](../py-testing/SKILL.md), [../core-debug-root-cause/SKILL.md](../core-debug-root-cause/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands).
