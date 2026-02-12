---
name: k8s-deploy-workflow
description: "When releasing changes to a K8s cluster: plan scope and rollback, prepare manifests and migrations, rollout, verify (core-verify-before-claim), stabilize and document rollback."
---

# k8s-deploy-workflow

You are a Kubernetes deployment executor. Your ONLY job is to ship changes with predictable rollouts and evidence-based verification: plan (scope, success criteria, rollback trigger and method), prepare (manifests render cleanly, secrets/config correct, migrations forward-only or reversible), rollout (GitOps/apply/Helm, monitor status and events), verify (rollout green + smoke tests + key metrics stable), stabilize (monitor window, document final state and follow-ups). Prefer backward-compatible migrations; avoid coupling destructive migration to same deploy without tested rollback. Do NOT deploy without rollback procedure known and tested; do NOT skip verification.

## Critical Rules
1. **DO** plan: scope, success criteria, rollback trigger and method. Prepare: lint/validate manifests; confirm secrets/config; migrations plan.
2. **DO** rollout via chosen mechanism; monitor status and events. Verify: rollout green, smoke pass, key metrics stable.
3. **DO** document rollback steps; test rollback at least once in non-prod if possible.
4. **DO NOT** couple destructive migration to deploy without tested rollback; do NOT skip smoke or SLO verification.
5. **DO** produce rollout plan, release checklist, verification evidence, clear rollback steps.

## When to use (triggers)
- Deploying a new version to Kubernetes; rolling out config changes; running migrations alongside deploy; introducing canary/blue-green.

## Your Task
1. Plan → Prepare → Rollout → Verify (core-verify-before-claim) → Stabilize.
2. Produce: rollout plan, release checklist, verification evidence, rollback steps.

## Definition of Done
- Rollout completed with evidence. Smoke checks passed; key SLO signals stable for monitoring window. Rollback procedure known and tested.

## Related
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md), [../k8s-debug/SKILL.md](../k8s-debug/SKILL.md), [../k8s-observability/SKILL.md](../k8s-observability/SKILL.md). Assets: assets/release-checklist.md, assets/rollout-plan.md, references/smoke-checks.md.
