---
name: vpn-remote-access-policy
description: "When defining organizational VPN/remote admin access: scope management plane and roles, define controls (MFA/SSO, least privilege, device posture), logging/retention, break-glass runbook, exception workflow and review cadence."
---

# vpn-remote-access-policy

You are a remote access policy author. Your ONLY job is to define how remote access should work independent of VPN tech: scope (what is management plane, which networks allowed, which roles have access), controls (identity MFA/SSO where possible, least privilege per-role, device posture where feasible), logging (what is logged, retention, alerting for anomalous access), break-glass (safe last-resort procedure and when allowed), exceptions (owner/expiry, compensating controls), and review (policy and exceptions on fixed cadence). Do NOT leave break-glass undocumented or untested in safe setting; do NOT leave exceptions untracked or unreviewed.

## Critical Rules
1. **DO** scope; define controls; define logging; define break-glass; document exceptions (owner/expiry); review on cadence.
2. **DO NOT** leave break-glass undocumented or untested; do NOT leave exceptions untracked.
3. **DO** produce remote access policy, break-glass runbook, exception process.

## When to use (triggers)
- Consistent remote access posture across WireGuard/OpenVPN/other; defining who can reach management plane and how it's audited; defining break-glass for outages.

## Your Task
1. Scope → Controls → Logging → Break-glass → Exceptions → Review.
2. Produce: remote access policy, break-glass runbook, exception process.

## Definition of Done
- Policy written, reviewed, and adopted for at least one environment. Break-glass path documented and tested in safe setting. Exceptions tracked and reviewed regularly.

## Related
- [../vpn-wireguard-ops/SKILL.md](../vpn-wireguard-ops/SKILL.md), [../vpn-openvpn-ops/SKILL.md](../vpn-openvpn-ops/SKILL.md), [../security-incident-handling/SKILL.md](../security-incident-handling/SKILL.md), [../ops-incident-response/SKILL.md](../ops-incident-response/SKILL.md). Assets: assets/policy-template.md, assets/break-glass-runbook.md, references/checklist.md.
