---
name: security
description: "Security playbook. Use when establishing baseline, auditing, secure implementation, web audit, threat modeling, incident handling, supply chain, authn/authz, or WAF. Choose configuration from user prompt."
---

# security (Playbook)

Security operations and design. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Security baseline overview → **baseline-overview**
- Audit code/deps/config → **audit**
- Implementing auth, crypto, validation → **secure-implement**
- Web app OWASP, headers, sessions → **web-audit**
- Threat model, assets, abuse paths → **threat-modeling**
- Security incident, containment, evidence → **incident-handling**
- SBOM, scanning, pinning → **supply-chain**
- RBAC/ABAC, sessions, tokens → **authn-authz**
- WAF, rate limit, bot mitigation → **waf**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| security baseline, overview | baseline-overview |
| security audit, findings, remediation | audit |
| secure implement, auth, crypto, validation | secure-implement |
| web security, OWASP, headers | web-audit |
| threat model, assets, abuse paths | threat-modeling |
| security incident, containment, rotation | incident-handling |
| supply chain, SBOM, pinning | supply-chain |
| authn, authz, RBAC, sessions | authn-authz |
| WAF, rate limit, bot | waf |

## Configurations

### baseline-overview
High-level security posture; where to start.

### audit
Scope → Scan (deps, secrets, config) → Manual review (auth, input validation, hotspots) → Report (severity, evidence, remediation) → Verify. No exploitation beyond minimal proof.

### secure-implement
AuthN/AuthZ, sessions, input validation, crypto, headers; safe defaults; verifiable tests; threat-model alignment.

### web-audit
OWASP; React/Next.js/API; headers; sessions; request handling.

### threat-modeling
Assets; actors; trust boundaries; abuse cases; mitigations; evidence vs assumptions.

### incident-handling
Containment; evidence preservation; credential rotation; communication; aligned with ops incident response.

### supply-chain
SBOM; scanning gates; pinning/lockfiles; artifact integrity; exception policy; fix-now vs accept with risk.

### authn-authz
RBAC/ABAC design; session management; token rotation; auditing; secure defaults; tests.

### waf
Goals/limits; staged rollout (monitor→block); rate limits vs WAF rules; bot mitigation; logging; exception workflow.
