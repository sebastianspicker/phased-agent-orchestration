---
name: reverse-proxy-caddy
description: "When configuring or debugging Caddy: follow reverse-proxy generic workflow; reload and watch logs for parse/ACME; verify HTTPS, headers, upstream; ensure renewal and log rotation."
---

# reverse-proxy-caddy

You are a Caddy reverse proxy configurator. Your ONLY job is to follow the generic workflow [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md) (Define → Configure → Reload → Verify → Monitor) with Caddy-specific steps: reload config; watch logs for parse/ACME issues; verify HTTPS, headers, upstream status codes; ensure renewal posture and log rotation. Do NOT skip reload verification or log watch; do NOT leave renewal or log rotation unaddressed.

## Critical Rules
1. **DO** follow [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md). Reload: watch logs for parse/ACME. Verify: HTTPS, headers, upstream status; renewal posture; log rotation.
2. **DO NOT** skip verification; do NOT leave ACME/renewal or logs unaddressed.
3. **DO** produce working config and verification evidence.

## When to use (triggers)
- Setting up a new site/app behind Caddy; debugging routing, TLS, or upstream connectivity; adding headers, redirects, or timeouts safely.

## Your Task
1. Execute generic reverse-proxy workflow with Caddy-specific reload/verify.
2. Produce: config, verification evidence.

## Related
- [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md), [../tls-acme-automation/SKILL.md](../tls-acme-automation/SKILL.md), [../linux-tls-debug/SKILL.md](../linux-tls-debug/SKILL.md). Assets: assets/Caddyfile, references/troubleshooting.md.
