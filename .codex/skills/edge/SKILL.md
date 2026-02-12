---
name: edge
description: "Edge/reverse proxy playbook. Use when configuring or debugging reverse proxies (generic, Nginx, Caddy, Traefik), forward-auth, or TLS/ACME automation. Choose configuration from user prompt."
---

# edge (Playbook)

Reverse proxies and TLS at the edge. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Generic reverse proxy workflow → **reverse-proxy**
- Nginx config, TLS, upstream, timeouts → **nginx**
- Caddy, automatic HTTPS, Caddyfile → **caddy**
- Traefik, entrypoints, middlewares → **traefik**
- SSO/OIDC, forward-auth, cookies → **auth**
- ACME, Let's Encrypt, renewal → **tls-acme**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| reverse proxy, routing, TLS termination | reverse-proxy |
| Nginx, upstream, proxy_pass, timeouts | nginx |
| Caddy, Caddyfile, automatic HTTPS | caddy |
| Traefik, entrypoints, services, middlewares | traefik |
| SSO, OIDC, forward-auth, cookies | auth |
| ACME, certificate, renewal, Let's Encrypt | tls-acme |

## Configurations

### reverse-proxy
Define (backends, TLS, timeouts) → Configure → Reload → Verify (HTTPS, headers, upstream) → Monitor. Secure defaults.

### nginx
TLS termination; upstream routing; timeouts; WebSockets; headers; logging; safe-by-default proxy settings.

### caddy
Automatic HTTPS (ACME); reverse_proxy; headers; WebSockets; reload; verify renewal and log rotation.

### traefik
Routing; entrypoints; TLS; middlewares; Docker/K8s discovery; access logs; verification-first.

### auth
oauth2-proxy style; SSO/OIDC; secure cookies/headers; WebSockets; log auth decisions; rollback plan.

### tls-acme
ACME issuance/renewal; chain validation; SNI/ALPN; expiry monitoring; safe rotation for proxies and services.
