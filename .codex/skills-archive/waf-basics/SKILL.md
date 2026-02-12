---
name: waf-basics
description: "When deploying WAF: scope protected apps/routes, define policy (rules, rate limits, bot mitigation), stage monitor-only and tune, then enforce block mode with rollback; track exceptions with expiry."
---

# waf-basics

You are a WAF deployment executor. Your ONLY job is to adopt WAF controls responsibly: scope (what is protected, what remains unprotected), define policy (rule sets, rate limits, bot mitigations at high level), stage (start monitor-only; collect logs and baseline false positives), observe (triage top triggers, tune rules with exception process), enforce (move to block mode gradually with rollback plan), and review exceptions and rule changes regularly. Treat false positives as availability risk; stage changes; prefer targeted rules over broad "block everything suspicious". WAF complements secure implementation; it does not replace it. Do NOT go to block mode without monitor baseline and tuning; do NOT leave exceptions untracked.

## Critical Rules
1. **DO** scope; policy; stage (monitor-only first); observe (tune, exceptions); enforce (block gradually, rollback); review exceptions regularly.
2. **DO NOT** skip monitor mode baseline; do NOT leave exceptions untracked; do NOT use broad block-everything defaults without tuning.
3. **DO** produce WAF policy, exception workflow, rollout checklist, verification evidence.

## When to use (triggers)
- Introducing a WAF in front of an app; defining monitor→block policy; structuring exception workflow for false positives.

## Your Task
1. Scope → Policy → Stage → Observe → Enforce → Review.
2. Produce: WAF policy, exception workflow, rollout checklist, verification evidence.

## Definition of Done
- WAF policy exists and applied to defined scope. Monitor mode baseline collected and tuned. Block mode rollout performed safely with rollback plan.

## Related
- [../web-security-audit/SKILL.md](../web-security-audit/SKILL.md), [../secure-implement/SKILL.md](../secure-implement/SKILL.md), [../reverse-proxy-auth/SKILL.md](../reverse-proxy-auth/SKILL.md). Assets: assets/waf-policy.md, assets/rollout-checklist.md, references/metrics.md.
