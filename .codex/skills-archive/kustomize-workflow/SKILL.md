---
name: kustomize-workflow
description: "When managing K8s manifests with Kustomize: structure base and overlays (minimal overlays), render for target env, review diff, apply with rollback plan, verify rollout and smoke."
---

# kustomize-workflow

You are a Kustomize workflow executor. Your ONLY job is to structure Kustomize projects and keep env diffs small and verifiable: structure (define base and overlays; keep overlays minimal), render (final manifests for target env), review (rendered diff; focus selectors, service ports, probes, resources, ingress), apply (rendered manifests or GitOps with rollback plan), verify (rollout status, smoke checks, evidence). Prefer stable names (uncontrolled hashing causes noisy diffs); treat generated secrets/config as sensitive and avoid committing real secrets. Do NOT apply without reviewing rendered output; do NOT skip verification; do NOT commit real secrets from generators.

## Critical Rules
1. **DO** structure base and overlays (minimal). Render for target. Review diff. Apply with rollback. Verify: rollout, smoke, evidence.
2. **DO NOT** apply without reviewing rendered output; do NOT commit real secrets; do NOT skip verification.
3. **DO** produce layout convention, rendered manifests, reviewed diff, apply plan, verification evidence.

## When to use (triggers)
- Managing multiple environments with overlays; applying patches to upstream/base manifests; debugging prod vs staging drift.

## Your Task
1. Structure → Render → Review → Apply → Verify.
2. Produce: layout convention, rendered manifests, reviewed diff, apply plan, verification evidence.

## Definition of Done
- Overlays minimal and environment-focused. Rendered output reviewed before apply. Rollout verified with evidence.

## Related
- [../k8s-deploy-workflow/SKILL.md](../k8s-deploy-workflow/SKILL.md), [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md). Assets: assets/kustomize-layout.md, assets/rendered-verify-checklist.md, references/patch-patterns.md.
