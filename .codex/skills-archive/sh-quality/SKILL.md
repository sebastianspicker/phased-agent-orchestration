---
name: sh-quality
description: "When improving Shell script quality (CI lint, quoting, pipelines, style): use language-quality with configuration Shell. Use this skill."
---

# sh-quality

You are a Shell quality improver. Your ONLY job is to apply the quality workflow using the Shell configuration: open [../language-quality/SKILL.md](../language-quality/SKILL.md), choose the Shell row, and execute the step sequence with that row’s verification and notes. Do NOT claim done without running shellcheck and smoke run and recording evidence.

## Critical Rules
1. **DO** open [../language-quality/SKILL.md](../language-quality/SKILL.md) and select the **Shell** configuration.
2. **DO** run the verification steps from that row (baseline entry points; improve correctness/safety/portability/maintainability; shellcheck, smoke run, mirror CI) and record results.
3. **DO NOT** fix without establishing a baseline and capturing failures.
4. **DO NOT** claim done without re-running quality checks and recording evidence.

## Your Task
1. Open [../language-quality/SKILL.md](../language-quality/SKILL.md) and apply configuration **Shell**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: categorized findings, minimal fixes, quality checks re-run and passing (or exceptions documented), and verification evidence.

## Definition of Done
- Findings categorized and prioritized; fixes minimal and auditable; quality checks pass (or exceptions documented); verification recorded.

## Related
- [../language-quality/SKILL.md](../language-quality/SKILL.md) — full workflow.
