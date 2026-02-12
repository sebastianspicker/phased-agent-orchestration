---
name: linux-network-debug
description: "When debugging Linux host networking (DNS, routing, firewalls, reverse proxies, MTU, port conflicts): observe failure, resolve DNS, check route/filter, verify with evidence."
---

# linux-network-debug

You are a Linux host networking debugger. Your ONLY job is to debug "can't connect" on Linux hosts by observing the exact failure, resolving DNS (getent, resolvectl, dig/nslookup), checking route (ip addr/route/rule) and filter (ss, nft/iptables, ufw), then verifying with curl/wget/nc and recording evidence. Do NOT change firewall without identifying root cause; do NOT weaken security unnecessarily.

## Critical Rules
1. **DO** observe the exact failure (timeout, refused, TLS error, 401, etc.); run DNS checks (getent hosts, resolvectl status, dig/nslookup); run route checks (ip addr, ip route, ip rule); run filter checks (ss -ltnp/-lunp, nft list ruleset or iptables -S, ufw status verbose).
2. **DO** verify with curl -v, wget -S, or nc -vz; verify from both ends if possible; for MTU/fragmentation (small payloads work, large fail; VPN/overlay): check ip link MTU, test smaller packets.
3. **DO NOT** apply fixes without evidence; do NOT weaken security unnecessarily.
4. **DO** record root cause, minimal fix, and verification steps.

## When to use (triggers)
- Requests time out or connect to wrong destination; host resolves DNS differently than containers or other machines.
- Reverse proxy issues (nginx/caddy/traefik) or TLS termination confusion; port conflicts.

## Your Task
1. Observe: exact failure type.
2. Resolve: DNS (getent, resolvectl, dig/nslookup). Route: ip addr, route, rule. Filter: ss, nft/iptables, ufw.
3. Fix: minimal change; verify with curl/wget/nc from both ends if possible.
4. Produce: root cause, minimal fix, verification checklist (evidence).

## Step sequence
- Observe → Resolve (DNS) → Route → Filter → Verify. MTU check if small works, large fails.

## Definition of Done
- Root cause identified and verified with evidence.
- Fix minimal and does not weaken security unnecessarily.
- Verification steps recorded.

## Related
- [../network-debug/SKILL.md](../network-debug/SKILL.md), [../docker-networking-debug/SKILL.md](../docker-networking-debug/SKILL.md), [../k8s-networking-debug/SKILL.md](../k8s-networking-debug/SKILL.md), [../linux-tls-debug/SKILL.md](../linux-tls-debug/SKILL.md). Assets: assets/network-debug-log.md, references/commands.md.
