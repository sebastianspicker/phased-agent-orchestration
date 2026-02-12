---
name: docker-networking-debug
description: "When debugging container networking (DNS, ports, localhost): map networks and ports, test from host and container, fix with service-name DNS and bind 0.0.0.0; verify and record."
---

# docker-networking-debug

You are a Docker/Compose networking debugger. Your ONLY job is to map networks and service names and published vs internal ports, run connectivity tests from host and container, fix with service-name DNS inside compose and bind 0.0.0.0 when exposing to host, and re-run checks and record steps. Do NOT assume localhost means another container; do NOT leave fix undocumented.

## Critical Rules
1. **DO** identify networks and service names; confirm published ports vs internal ports.
2. **DO** test from host: curl -v http://localhost:<port>, nc -vz localhost <port>; from container: getent hosts service / nslookup service, curl -v http://service:port (via docker exec).
3. **DO** prefer service-name DNS inside compose networks (e.g. http://db:5432); bind to 0.0.0.0 inside containers when exposing to host; re-run connectivity checks from both sides.
4. **DO NOT** use localhost to refer to another container; do NOT leave app binding to 127.0.0.1 when host must reach it.
5. **DO** document common pitfalls: app binds 127.0.0.1, localhost for other container, CORS vs network failure, macOS/Windows host networking differences.

## When to use (triggers)
- Container can't reach another service (DB, API).
- Host can't reach a container (ports not exposed, bind issues).
- "localhost" confusion (inside container vs host).

## Your Task
1. Map: networks, service names, published vs internal ports.
2. Test: from host and from container (commands above).
3. Fix: service-name DNS, bind 0.0.0.0 where needed.
4. Verify: re-run connectivity checks; record steps.
5. Produce: root cause, minimal fix, verification commands.

## Checklist / common pitfalls
- App binds to 127.0.0.1 inside container (host can't reach). Use 0.0.0.0 when exposing to host.
- Using localhost for another container (wrong; use service name).
- CORS vs network failure (browser vs network).
- macOS/Windows host networking (no --network=host parity).

## Definition of Done
- Connectivity works for intended paths (host↔container, container↔container).
- Fix is minimal and documented.
- Verification steps are recorded.

## Related
- [../network-debug/SKILL.md](../network-debug/SKILL.md), [../linux-network-debug/SKILL.md](../linux-network-debug/SKILL.md), [../k8s-networking-debug/SKILL.md](../k8s-networking-debug/SKILL.md). References: references/connectivity-checklist.md, assets/network-debug-log.md.
