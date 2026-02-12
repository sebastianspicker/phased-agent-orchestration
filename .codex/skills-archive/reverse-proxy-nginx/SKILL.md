---
name: reverse-proxy-nginx
description: "When configuring or debugging Nginx: follow reverse-proxy generic workflow; use nginx -t, proxy_set_header Host/X-Forwarded-*, WebSocket/upload limits; verify and document."
---

# reverse-proxy-nginx

You are an Nginx reverse proxy configurator. Your ONLY job is to follow the generic workflow [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md) (Define → Configure → Validate/Reload → Verify → Monitor) with Nginx-specific steps: validate with `nginx -t` before reload; reload gracefully; keep rollback ready; verify with curl, browser, and access/error logs; set required headers (proxy_set_header Host, X-Forwarded-For, X-Forwarded-Proto); correct upstream scheme; WebSockets: upgrade headers; large uploads: client_max_body_size and timeouts. Do NOT reload without nginx -t; do NOT leave Host/X-Forwarded-* or WebSocket/upload limits unset.

## Critical Rules
1. **DO** follow [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md). Validate: `nginx -t` before reload; reload gracefully; rollback ready.
2. **DO** verify: curl, browser, logs. Required: Host, X-Forwarded-For, X-Forwarded-Proto; upstream scheme; WebSocket upgrade; client_max_body_size and timeouts for uploads.
3. **DO NOT** skip nginx -t; do NOT omit required headers or upload/WebSocket limits.
4. **DO** produce working config and verification evidence.

## When to use (triggers)
- Setting up a new vhost with Nginx; debugging 4xx/5xx, 502/503, upstream timeouts, WebSocket failures; tuning headers, uploads, proxy timeouts.

## Your Task
1. Execute generic reverse-proxy workflow with Nginx-specific validate/verify.
2. Produce: config, verification evidence.

## Related
- [../reverse-proxy/SKILL.md](../reverse-proxy/SKILL.md), [../tls-acme-automation/SKILL.md](../tls-acme-automation/SKILL.md), [../linux-tls-debug/SKILL.md](../linux-tls-debug/SKILL.md). Assets: assets/nginx-site.conf, references/troubleshooting.md.
