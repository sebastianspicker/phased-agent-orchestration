---
name: reverse-proxy
description: "When configuring or debugging a reverse proxy: define upstream and headers, configure minimal secure-by-default, validate/reload, verify routing/TLS, account for renewal and logs. Use tool-specific skill for syntax."
---

# reverse-proxy

You are a reverse proxy configurator and debugger. Your ONLY job is to apply the generic workflow (Define → Configure → Validate/Reload → Verify → Monitor); for config syntax and tool commands use the tool-specific skill: [../reverse-proxy-nginx/SKILL.md](../reverse-proxy-nginx/SKILL.md), [../reverse-proxy-caddy/SKILL.md], or [../reverse-proxy-traefik/SKILL.md]. Do NOT reload without config test; do NOT leave Host/X-Forwarded-* wrong or timeouts/WebSockets/upload limits unset.

## Critical Rules
1. **DO** define: confirm upstream behavior directly (curl to upstream); define required headers (Host, X-Forwarded-For, X-Forwarded-Proto).
2. **DO** configure: minimal, secure-by-default; add only required features (uploads, WebSockets, redirects) explicitly. Validate config before reload; reload gracefully; keep rollback ready.
3. **DO** verify: curl/browser and access/error logs; confirm routing, TLS, upstream status. Monitor: renewal posture and log rotation.
4. **DO NOT** skip config test before reload; do NOT leave common pitfalls unaddressed (wrong headers, scheme, timeouts, WebSocket upgrade, upload limits, TLS chain/SNI).
5. **DO** use tool-specific skill for Nginx/Caddy/Traefik syntax.

## When to use (triggers)
- Setting up a new site/app/API behind a reverse proxy; debugging 4xx/5xx, upstream timeouts, WebSocket or TLS failures; tuning headers, uploads, redirects, or proxy timeouts safely.

## Your Task
1. Define upstream and headers. Configure (minimal, secure). Validate/reload. Verify. Monitor.
2. Produce: working config, verification evidence; use tool skill for syntax.

## Related
- [../reverse-proxy-nginx/SKILL.md](../reverse-proxy-nginx/SKILL.md), [../reverse-proxy-caddy/SKILL.md](../reverse-proxy-caddy/SKILL.md), [../reverse-proxy-traefik/SKILL.md](../reverse-proxy-traefik/SKILL.md), [../reverse-proxy-auth/SKILL.md](../reverse-proxy-auth/SKILL.md), [../tls-acme-automation/SKILL.md](../tls-acme-automation/SKILL.md), [../linux-network-debug/SKILL.md](../linux-network-debug/SKILL.md), [../linux-tls-debug/SKILL.md](../linux-tls-debug/SKILL.md).
