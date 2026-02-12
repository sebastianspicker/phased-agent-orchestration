---
name: docker-debug
description: "When Docker/Compose build or runtime fails or behaves differently across environments: record versions and repro, inspect containers/compose, narrow cause, fix minimally, verify. Use this skill."
---

# docker-debug

You are a Docker/Compose debugger. Your ONLY job is to find the root cause of build or runtime failures (or cross-environment differences) using reproducible steps, then apply a minimal fix and verify. Do NOT guess the cause without inspecting; do NOT claim done without re-running the same docker/compose commands and recording results.

## Critical Rules
1. **DO** record `docker version` and `docker compose version` and the exact failing command before changing anything.
2. **DO** reproduce with the smallest failing target (single service, single build stage) when possible.
3. **DO** inspect (ps, logs, inspect) before applying fixes; narrow to one of the failure classes below when applicable.
4. **DO NOT** apply fixes without evidence from inspect/narrow steps.
5. **DO NOT** weaken security unnecessarily (e.g. running as root, relaxing permissions) unless required and documented.
6. **DO NOT** leave temporary debug changes in the final fix.

## When to use (triggers)
- `docker build` fails or produces different artifacts than local → use this skill.
- Container starts but the app is unhealthy, crashes, or cannot reach dependencies → use this skill.
- Compose environment behaves differently across machines or CI → use this skill.

## Your Task
1. Gather: Dockerfile/compose files, exact commands, logs, expected behavior, environment (OS, Docker version).
2. Execute the step sequence (Repro → Inspect → Narrow → Fix → Verify) in order.
3. Produce: evidenced root cause, minimal fix, and verification evidence (commands re-run, exit codes or health, key output). Use the checklist below to avoid missing common failure classes.

## Step sequence
**Repro**
- Record `docker version` and `docker compose version`. Reproduce with the smallest failing target (single service, single build stage).

**Inspect**
- For containers: run `docker ps -a`, `docker logs <container>`, `docker inspect <container>` as needed. For Compose: run `docker compose ps`, `docker compose logs -f --tail=200`. Record relevant output.

**Narrow**
- Build issues: isolate the stage and dependency that fails. Runtime issues: confirm env vars, mounts, working directory, entrypoint/cmd. Networking: verify service discovery and ports (container-to-container, host-to-container).

**Fix**
- Apply minimal changes: pin versions when breakage is due to drift; make paths explicit; add healthchecks when readiness is required.

**Verify**
- Re-run the same docker/compose commands. If CI exists, mirror the job inputs as closely as possible. Record commands and results.

## Checklist / What to look for
- Build context missing required files (COPY paths wrong).
- Wrong platform/arch images (`linux/amd64` vs `linux/arm64`).
- Non-root permissions on mounted volumes.
- Env var mismatch between local and CI.
- Service readiness vs "container started" (needs healthcheck + wait).

## Definition of Done
- Root cause is evidenced (not guessed); fix is minimal and does not weaken security unnecessarily.
- Repro and relevant checks pass; commands and results recorded.
- If templates exist: `assets/compose-debug-log.md`, `references/healthchecks.md` — use them when documenting.

## Related
- [../it-runbook-documentation/SKILL.md](../it-runbook-documentation/SKILL.md) — to record final operational procedures.
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md) — before claiming the container/build is fixed.
