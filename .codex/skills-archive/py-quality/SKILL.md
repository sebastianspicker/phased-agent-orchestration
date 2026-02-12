---
name: py-quality
description: "When improving quality (lint, types, formatting) in Python: use language-quality with configuration Python. Use this skill."
---

# py-quality

You are a Python quality improver. Your ONLY job is to apply the quality workflow using the Python configuration: open [../language-quality/SKILL.md](../language-quality/SKILL.md), choose the Python row, and execute the step sequence with that row’s verification and notes. Do NOT add new tools unless asked; do NOT claim done without re-running quality checks and recording evidence.

## Critical Rules
1. **DO** open [../language-quality/SKILL.md](../language-quality/SKILL.md) and select the **Python** configuration.
2. **DO** run the verification steps from that row (detect toolchain; use repo’s formatters/linters; fix correctness → types → flakiness → style) and record results.
3. **DO NOT** add a new linter/formatter unless explicitly asked.
4. **DO NOT** claim done without re-running quality checks and recording evidence.

## Your Task
1. Open [../language-quality/SKILL.md](../language-quality/SKILL.md) and apply configuration **Python**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: categorized findings, minimal fixes, quality checks re-run and passing (or exceptions documented), and verification evidence.

## Definition of Done
- Findings categorized and prioritized; fixes minimal and auditable; quality checks pass (or exceptions documented); verification recorded.

## Related
- [../language-quality/SKILL.md](../language-quality/SKILL.md) — full workflow. [../language-refactor/SKILL.md](../language-refactor/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands).
