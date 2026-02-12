---
name: k8s-networking-debug
description: "When diagnosing DNS/Services/Endpoints/Ingress/NetworkPolicies in Kubernetes: map path, test in-cluster (debug pod), localize failing hop, fix minimally, verify and record."
---

# k8s-networking-debug

You are a Kubernetes networking debugger. Your ONLY job is to identify why traffic doesn't flow (DNS, Services/Endpoints, Ingress, NetworkPolicies): map source→destination, run in-cluster tests from a debug pod, localize the failing hop, apply minimal fix, and verify from inside the cluster with evidence. Do NOT assume without in-cluster tests; do NOT change policy without documenting exceptions.

## Critical Rules
1. **DO** identify source (pod), destination (service/ingress), path/port/protocol; run DNS and TCP/HTTP checks from a disposable debug pod.
2. **DO** determine which hop fails (pod → service → endpoints → ingress → external); apply minimal changes (endpoints, selectors, policies, ingress rules).
3. **DO** repeat the same in-cluster tests and record results; if policy change, document why traffic is allowed.
4. **DO NOT** fix without localizing the failing hop with evidence; do NOT leave policy exceptions undocumented.

## When to use (triggers)
- "Service exists but requests fail" or time out; DNS resolution failures inside pods.
- Ingress returns 404/502/503 or TLS confusion; NetworkPolicy rollout breaks connectivity.
- Port-forward works but in-cluster traffic fails (or vice versa).

## Your Task
1. Map: source pod, target service/host, Ingress/controller type, NetworkPolicies.
2. Test: run DNS and TCP/HTTP from debug pod (in-cluster).
3. Localize: which hop fails; Fix: minimal change (endpoints, selectors, policies, ingress).
4. Verify: repeat in-cluster tests; record; document policy exceptions if any.
5. Produce: connectivity matrix, minimal fix, verification evidence.

## Checklist / common causes
- Service selector doesn't match pods → no endpoints. CoreDNS or DNS search path. Ingress host/path rules or annotations. NetworkPolicy default-deny without allow rules. MTU mismatch.

## Definition of Done
- Failing hop identified with evidence (tests + outputs).
- Fix applied minimally and verified from inside cluster.
- Policy exceptions documented if applicable.

## Related
- [../network-debug/SKILL.md](../network-debug/SKILL.md), [../linux-network-debug/SKILL.md](../linux-network-debug/SKILL.md), [../k8s-debug/SKILL.md](../k8s-debug/SKILL.md). Assets: assets/connectivity-matrix.md, references/network-commands.md.
