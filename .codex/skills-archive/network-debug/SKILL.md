---
name: network-debug
description: "When connectivity fails: choose context (Linux host, Docker/Compose, Kubernetes) and use the matching playbook; all follow Observe/Map → Test → Fix → Verify."
---

# network-debug

You are the network debugging router. Your ONLY job is to choose the correct context (Linux host vs Docker/Compose vs Kubernetes) and then open the matching skill: linux-network-debug, docker-networking-debug, or k8s-networking-debug. Do NOT guess context; confirm where the failure is (host, container, cluster) then follow that playbook's Observe/Map → Test → Fix → Verify.

## Critical Rules
1. **DO** identify where the failure is: Linux host (DNS, routing, firewalls, reverse proxies, MTU, port conflicts), Docker/Compose (container↔container or host↔container, service discovery, localhost), or Kubernetes (pod↔Service, DNS/CoreDNS, Ingress, NetworkPolicies, port-forward vs in-cluster).
2. **DO** open the matching skill and execute its step sequence (Observe/Map → Test → Fix → Verify).
3. **DO NOT** mix contexts; use one playbook per failure scope.
4. **DO** when TLS is the failure mode: use linux-tls-debug or the proxy/TLS skill for the context.

## When to use (triggers)
- Connectivity fails and you need to choose the right context: Linux host, Docker/Compose, or Kubernetes.

## Your Task
1. Determine context: Host | Docker/Compose | Kubernetes (see table).
2. Open the matching skill: [../linux-network-debug/SKILL.md](../linux-network-debug/SKILL.md) | [../docker-networking-debug/SKILL.md](../docker-networking-debug/SKILL.md) | [../k8s-networking-debug/SKILL.md](../k8s-networking-debug/SKILL.md).
3. Execute that skill's step sequence and produce evidence.
4. Produce: context choice, link to skill used, and that skill's outputs (root cause, fix, verification).

## Context table
| Context        | Skill | When |
|----------------|-------|------|
| Linux host     | linux-network-debug | DNS, routing, firewalls, reverse proxies, MTU, port conflicts on host |
| Docker/Compose | docker-networking-debug | Container↔container or host↔container; Compose DNS; localhost pitfalls |
| Kubernetes     | k8s-networking-debug | Pod↔Service, DNS/CoreDNS, Ingress, NetworkPolicies; port-forward vs in-cluster |

## Definition of Done
- Correct context chosen; matching playbook executed; evidence and fix from that playbook.

## Related
- [../linux-network-debug/SKILL.md](../linux-network-debug/SKILL.md), [../docker-networking-debug/SKILL.md](../docker-networking-debug/SKILL.md), [../k8s-networking-debug/SKILL.md](../k8s-networking-debug/SKILL.md), [../linux-tls-debug/SKILL.md](../linux-tls-debug/SKILL.md).
