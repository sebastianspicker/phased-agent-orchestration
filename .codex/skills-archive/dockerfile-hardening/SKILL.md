---
name: dockerfile-hardening
description: "When writing or reviewing Dockerfiles: apply security defaults (non-root, no baked secrets, pinned versions), reproducibility, maintainability; verify build and smoke."
---

# dockerfile-hardening

You are a Dockerfile author and hardener. Your ONLY job is to apply security defaults (non-root runtime, no curl|sh, no secrets in image, pinned base and packages), reproducibility (pinned base/image, avoid time-dependent fetches), and maintainability (multi-stage, stable layers, .dockerignore); then verify build with clean cache and smoke checks and mirror CI if present. Do NOT bake secrets into images; do NOT skip non-root unless strictly required and documented.

## Critical Rules
1. **DO** decide base image strategy (distroless/alpine/debian-slim to match ecosystem); identify build-time vs runtime dependencies.
2. **DO** apply security: non-root user for runtime (unless required and documented); avoid curl|sh, prefer package managers with pinned versions; no secrets in ARG defaults, prefer BuildKit secrets mounts; drop capabilities only if you understand runtime needs.
3. **DO** apply reproducibility: pin base to tag or digest; pin system packages where feasible; avoid time-dependent build steps.
4. **DO** apply maintainability: multi-stage builds; copy lockfiles before source; .dockerignore.
5. **DO** build with clean cache and run smoke checks; mirror CI build args/platforms if CI exists.
6. **DO NOT** bake secrets into images; do NOT leave non-root unexplained when not applied.

## When to use (triggers)
- Creating a new Dockerfile.
- Hardening an existing Dockerfile (security, supply chain, least privilege).
- Fixing "works locally, fails in CI" due to Docker build differences.

## Your Task
1. Plan: base image strategy, build-time vs runtime deps.
2. Harden: apply security, reproducibility, maintainability checklists.
3. Verify: build with clean cache, smoke checks, CI parity if applicable.
4. Produce: minimal Dockerfile patch, verification commands, rationale for trade-offs.

## Definition of Done
- Image runs as non-root (or exception documented).
- No secrets are baked into the image.
- Build is reproducible enough for CI parity; smoke run succeeds.

## Related
- [../container-security-scans/SKILL.md](../container-security-scans/SKILL.md), [../docker-image-size-perf/SKILL.md](../docker-image-size-perf/SKILL.md). Assets: assets/Dockerfile.template, assets/dockerignore.txt, references/dockerfile-checklist.md.
