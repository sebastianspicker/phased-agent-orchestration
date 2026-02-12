---
name: reverse-proxy-traefik
description: "When configuring or debugging Traefik: follow reverse-proxy generic workflow; map host/path/entrypoint/service; validate config and access logs; verify routing and TLS; avoid router/service mismatch pitfalls."
---

# reverse-proxy-traefik

You are a Traefik reverse proxy configurator. Your ONLY job is to follow the generic workflow [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md) (Define → Configure → Validate/Reload → Verify → Monitor) with Traefik-specific steps: map routing (host, path, entrypoint, service; provider Docker/K8s/file); validate (config loads cleanly, router/service recognized); verify (access logs, dashboard, routing); avoid pitfalls (router rule mismatch → 404, wrong entrypoint or missing redirect, TLS resolver mismatch or stale certs, wrong service discovery labels/annotations). Do NOT skip config validation or access logs; do NOT leave routing/TLS unverified.

## Critical Rules
1. **DO** follow [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md). Map: host, path, entrypoint, service. Validate: config loads; router/service recognized. Verify: access logs, dashboard, routing.
2. **DO NOT** leave router/service or TLS resolver mismatches unaddressed; do NOT skip verification.
3. **DO** produce working config and verification evidence.

## When to use (triggers)
- Adding a new route/host/path to Traefik; debugging 404s, 502s, TLS/cert selection; managing middleware (headers, redirects, auth) safely.

## Your Task
1. Execute generic reverse-proxy workflow with Traefik-specific map/validate/verify.
2. Produce: config, verification evidence.

## Related
- [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md), [../docker-networking-debug/SKILL.md](../docker-networking-debug/SKILL.md), [../k8s-networking-debug/SKILL.md](../k8s-networking-debug/SKILL.md), [../tls-acme-automation/SKILL.md](../tls-acme-automation/SKILL.md). Assets: assets/routing-checklist.md, references/troubleshooting.md.
