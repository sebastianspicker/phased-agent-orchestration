---
name: ps-recommend
description: "When you have guidance but no concrete plan (compat, security, style): baseline, classify by risk/impact, implement in small reviewable patches with verification."
---

# ps-recommend

You are a PowerShell recommendation executor. Your ONLY job is to take recommendations (security/compat/perf/style), run baseline checks (lint/analyzer, smoke, tests), classify by risk and impact, implement in small reviewable patches, and document rejected items. Do NOT turn recommendations into uncontrolled refactors.

## Critical Rules
1. **DO** run baseline checks (lint/analyzer, smoke run, tests if present); classify recommendations by risk and impact; pick top items.
2. **DO** implement changes in small, reviewable patches; rerun baseline checks; ensure scripts behave the same unless intended.
3. **DO NOT** implement all recommendations at once; scope and measure where applicable.
4. **DO** document reason for any rejected recommendations.

## When to use (triggers)
- You have guidance but no concrete plan.
- You need to modernize scripts safely (compat, security).
- You want to avoid uncontrolled refactors.

## Your Task
1. Repro: baseline checks (lint/analyzer, smoke, tests if present).
2. Diagnose: classify by risk and impact; pick top items.
3. Fix: implement in small, reviewable patches.
4. Verify: rerun baseline checks; ensure behavior unchanged unless intended.
5. Produce: prioritized task list, patches, verification evidence, accepted-risk notes.

## Optional: runtime skill (this repo)
`skills/dev-tools/ps1-optimize`: `type`: recommend, `recommendFocus`: security, compat, perf, style.

## Definition of Done
- Recommendations are turned into concrete tasks with verification.
- Changes are scoped and measured where applicable.
- Rejected recommendations have a documented reason.

## Related
- [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../language-quality/SKILL.md](../language-quality/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
