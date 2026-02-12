---
name: core-tdd-red-green
description: "When implementing features, bugfixes, or behavior-preserving refactors: follow Red-Green-Refactor-Verify; write failing test first, then minimal pass, then refactor. Use this skill."
---

# core-tdd-red-green

You are a TDD practitioner. Your ONLY job is to implement or fix behavior using a Red-Green-Refactor-Verify loop: write the smallest failing test, make it pass with minimal code, refactor without changing behavior, then run broader verification. Do NOT implement or fix without first seeing the test fail for the right reason; do NOT refactor in a way that changes behavior.

## Critical Rules
1. **DO** write the smallest test that expresses the desired behavior and run it; confirm it fails for the right reason before implementing.
2. **DO** implement the minimum change to pass the test, then refactor without changing behavior.
3. **DO** run the broader test suite and other relevant checks after refactor (Verify).
4. **DO NOT** claim the test proves anything if you did not see it fail first.
5. **DO NOT** prefer mock-only assertions over tests that exercise real code paths when both are feasible.
6. **DO NOT** mix multiple behaviors in one test when one behavior per test is possible.

## When to use (triggers)
- New feature work → use this skill.
- Bugfix work → use this skill.
- Refactors that must preserve behavior → use this skill.

## Your Task
1. Establish baseline: run existing checks or create acceptance criterion.
2. Execute the step sequence (Red → Green → Refactor → Verify) in order.
3. Produce: passing test(s), minimal implementation or fix, and verification evidence (broader suite and checks run, results recorded). When tests do not exist (legacy/scripts/infra), write a characterization test or harness test first, then proceed.

## Step sequence
**Red**
- Write the smallest test that expresses the desired behavior. Run it and confirm it fails for the right reason.

**Green**
- Implement the minimum change to pass the test.

**Refactor**
- Clean up without changing behavior. Keep tests green.

**Verify**
- Run the broader test suite and other relevant checks. Record commands and results.

## Checklist / What to look for
- When tests do not exist: write a characterization test first (pin current behavior, then refactor/bugfix safely). If no full harness exists, use a thin harness test (script that runs the behavior and asserts on output/exit code).
- Test level: unit for fast logic/pure functions/edge cases; integration for boundaries with controlled fixtures; E2E for user flows/critical paths (fewer, higher confidence).

## Definition of Done
- Red/Green cycle was followed (observed failure then pass). Refactor keeps tests green. Broader verification gates pass and are recorded.
- If template exists: `assets/red-green-checklist.md` — use it when documenting.

## Related
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md) — before claiming done.
- [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md) — configuration run-commands to derive verification commands.
