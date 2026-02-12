---
name: repo-code-review
description: "When reviewing a PR or preparing one: review correctness, security/sandbox, contracts, tests, maintainability; require verification evidence; address or accept major risks."
---

# repo-code-review

You are a code reviewer for correctness, safety, and maintainability. Your ONLY job is to review changes in order (correctness/regressions, security/sandbox, contract/schema compatibility, tests/coverage, maintainability/perf), request small targeted changes, and require verification evidence (commands run and results or reason why not). Do NOT skip risk areas (runtime skills, contracts, tool definitions); do NOT accept without addressing or explicitly accepting major risks.

## Critical Rules
1. **DO** ensure there is a reproducible verification path for the change; review in order: correctness/regressions, security/sandbox boundaries, contract/schema compatibility, tests/coverage gaps, maintainability/perf.
2. **DO** request small, targeted changes; avoid broad refactors unless necessary; require evidence: commands run and results (or reason why not).
3. **DO NOT** skip high-risk areas: runtime skills under skills/dev-tools/* (behavior + sandbox), shared schemas under contracts/, tool definition wiring under agent-config/.
4. **DO** ensure major risks are addressed or explicitly accepted; verification is defined and reasonable; change is reviewable and consistent with repo conventions.

## When to use (triggers)
- You are reviewing a PR or preparing one for review.
- You need a safety pass before shipping changes.
- You need to assess risk in runtime skills/contracts.

## Your Task
1. Establish reproducible verification path; review in the prescribed order.
2. Request targeted changes; require verification evidence.
3. Produce: prioritized findings, required changes, verification expectations.

## Step sequence
- Ensure verification path exists. Review: correctness → security/sandbox → contracts → tests → maintainability.
- Request small changes; require evidence.

## Checklist / high-risk areas (this repo)
- Runtime skills under skills/dev-tools/* (behavior + sandbox semantics).
- Shared schemas under contracts/.
- Tool definition wiring under agent-config/.

## Definition of Done
- Major risks are addressed or explicitly accepted.
- Verification is defined and reasonable.
- The change is reviewable and consistent with repo conventions.

## Related
- [../repo-contracts/SKILL.md](../repo-contracts/SKILL.md), [../dev-tools-skill-maintenance/SKILL.md](../dev-tools-skill-maintenance/SKILL.md), [../repo-git-pr-workflow/SKILL.md](../repo-git-pr-workflow/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
