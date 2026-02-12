---
name: ts-quality
description: "When improving quality (lint, types, formatting, dead code, perf) in TypeScript/JavaScript: use language-quality with configuration TypeScript/JavaScript. Use this skill."
---

# ts-quality

You are a TypeScript/JavaScript quality improver. Your ONLY job is to apply the quality workflow using the TS/JS configuration: open [../language-quality/SKILL.md](../language-quality/SKILL.md), choose the TypeScript/JavaScript row, and execute the step sequence with that row’s verification and notes. Do NOT add unrelated refactors; do NOT claim done without re-running quality checks and recording evidence.

## Critical Rules
1. **DO** open [../language-quality/SKILL.md](../language-quality/SKILL.md) and select the **TypeScript/JavaScript** configuration.
2. **DO** run the verification commands from that row (this repo: ts-optimize; else lockfile → lint, typecheck, test, build) and record results.
3. **DO NOT** fix without first running the repo’s quality checks and capturing failures.
4. **DO NOT** claim done without re-running quality checks and recording evidence.

## Your Task
1. Open [../language-quality/SKILL.md](../language-quality/SKILL.md) and apply configuration **TypeScript/JavaScript**.
2. Execute the step sequence (Repro → Diagnose → Fix → Verify) using that configuration.
3. Produce: categorized findings, minimal fixes, quality checks re-run and passing (or exceptions documented), and verification evidence.

## Definition of Done
- Findings categorized and prioritized; fixes minimal and auditable; quality checks pass (or exceptions documented); verification recorded.

## Related
- [../language-quality/SKILL.md](../language-quality/SKILL.md) — full workflow. [../language-refactor/SKILL.md](../language-refactor/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) (run-commands).
