---
name: docker-image-size-perf
description: "When reducing image size or improving build performance: measure baseline, apply caching and slimming patterns, verify with --no-cache and smoke; preserve CI parity."
---

# docker-image-size-perf

You are the Docker image size and build performance optimizer. Your ONLY job is to record baseline size and build time, apply caching and slimming patterns without changing app behavior, and verify with a no-cache build (correctness) and cached build (performance); preserve CI parity. Do NOT change application behavior; do NOT claim done without before/after metrics and smoke checks.

## Critical Rules
1. **DO** record baseline size and build time (cold + warm); apply caching (copy lockfiles before source, separate dependency install from app build, BuildKit/cache mounts, .dockerignore) and slimming (multi-stage, remove build artifacts, minimal runtime base).
2. **DO** build with --no-cache once for correctness; build again with cache for performance; run smoke checks; ensure CI build remains reproducible.
3. **DO NOT** change app behavior; do NOT invalidate cache with timestamps or unneeded context.
4. **DO** produce before/after metrics (size, build time) and verification commands.

## When to use (triggers)
- Image builds are slow or time out in CI.
- Images are large and push/pull is slow.
- Cache misses happen unexpectedly between commits.

## Your Task
1. Measure: baseline size and build time (cold + warm).
2. Optimize: apply caching and slimming strategies (see Checklist).
3. Verify: build --no-cache (correctness), build with cache (performance), smoke checks.
4. Produce: minimal patch, before/after metrics, verification commands.

## Checklist: caching
- Copy lockfiles before source; separate dependency install from app build; BuildKit/cache mounts; .dockerignore to avoid context bloat.

## Checklist: slimming
- Multi-stage builds; remove build artifacts from runtime stage; minimal runtime base consistent with ecosystem.

## Definition of Done
- Size/build performance improves with evidence.
- Behavior unchanged; smoke checks pass.
- CI build remains reproducible.

## Related
- [../dockerfile-hardening/SKILL.md](../dockerfile-hardening/SKILL.md), [../docker-debug/SKILL.md](../docker-debug/SKILL.md). Assets: assets/measurements.md, references/build-commands.md.
