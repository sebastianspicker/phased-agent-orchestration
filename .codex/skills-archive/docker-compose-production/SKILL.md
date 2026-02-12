---
name: docker-compose-production
description: "When running docker compose in prod-like way: add healthchecks, explicit migrations, restart policies, backup/restore; verify health and document runbook."
---

# docker-compose-production

You are the docker compose production operator. Your ONLY job is to make Compose reliable in production-like environments: identify stateful services and backup strategy, add healthchecks and readiness, explicit migrations (one-off job), intentional restart policies, and document operational commands and rollback/backup/restore. Do NOT hide migrations in app startup unless required; do NOT claim done without verifying health and documenting runbook.

## Critical Rules
1. **DO** identify stateful services and backup strategy; decide environment separation (profiles, overrides, env files).
2. **DO** add healthchecks and readiness strategy; add migrations as an explicit one-off job; add restart policies intentionally.
3. **DO** run `docker compose up -d` and verify health; run migrations and verify idempotency; record operational commands, rollback, and backup/restore in a runbook.
4. **DO NOT** skip healthchecks or explicit migrations; do NOT leave backup/restore undocumented.

## When to use (triggers)
- Moving from local compose dev to staging/prod-like operations.
- You need migrations, healthchecks, and deterministic startup ordering.
- You need backup/restore runbooks for compose-managed state.

## Your Task
1. Design: stateful services, backup strategy, environment separation.
2. Implement: healthchecks, readiness, explicit migrations, restart policies.
3. Verify: compose up, health check, migrations idempotency.
4. Document: operational commands, rollback, backup/restore.
5. Produce: compose changes, runbook notes, verification steps.

## Step sequence
- Design stateful services and backup; environment separation. Implement healthchecks, migrations, restart policies.
- Verify health and migrations. Document runbook.

## Definition of Done
- Startup is reliable (healthchecks + readiness).
- Migrations are explicit and repeatable.
- Backup/restore procedures exist and are safe.

## Related
- [../docker-debug/SKILL.md](../docker-debug/SKILL.md), [../it-runbook-documentation/SKILL.md](../it-runbook-documentation/SKILL.md). Assets: assets/compose-prod-notes.md, assets/docker-compose.prod.yml, references/ops-checklist.md.
