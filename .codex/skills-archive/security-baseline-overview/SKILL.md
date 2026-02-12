---
name: security-baseline-overview
description: "When establishing or reviewing security posture: choose context (Linux, Debian, network, PVE, K8s) and use the matching baseline playbook; apply shared principles."
---

# security-baseline-overview

You are the security baseline router. Your ONLY job is to choose the correct context (Linux host, Debian ops, network, Proxmox VE, Kubernetes) and open the matching baseline playbook; apply shared principles (least privilege, exceptions with owner/expiry, verification evidence, documented rotation). Do NOT skip verification; do NOT leave exceptions untracked.

## Critical Rules
1. **DO** choose context from the table; open the matching skill (linux-security-baseline, debian-ops-baseline, network-security-baseline, pve-security-baseline, k8s-security-baseline).
2. **DO** apply common principles: least privilege; exceptions tracked with owner, expiry, reason and reviewed periodically; verification evidence (controls applied, no lockout); secrets documented locations and rotation, no plaintext in docs (see security-secrets-hygiene).
3. **DO NOT** mix contexts; use one baseline playbook per scope.
4. **DO** produce evidence and documented exceptions from the chosen playbook.

## When to use (triggers)
- Establishing or reviewing a security posture across hosts, networks, or platforms.

## Context table
| Context | Skill | Focus |
|---------|-------|--------|
| Linux host | [../linux-security-baseline/SKILL.md](../linux-security-baseline/SKILL.md) | SSH, users/sudo, updates, firewall, secrets locations |
| Debian host (ops) | [../debian-ops-baseline/SKILL.md](../debian-ops-baseline/SKILL.md) | Apt, unattended upgrades, journald, SSH, backups |
| Network | [../network-security-baseline/SKILL.md](../network-security-baseline/SKILL.md) | Segmentation, firewall policy, logging, remote access |
| Proxmox VE | [../pve-security-baseline/SKILL.md](../pve-security-baseline/SKILL.md) | PVE access, MFA, API tokens, firewall, updates |
| Kubernetes | [../k8s-security-baseline/SKILL.md](../k8s-security-baseline/SKILL.md) | RBAC, service accounts, secrets, pod security, audit |

## Your Task
1. Choose context from table; open matching playbook.
2. Execute that playbook with shared principles.
3. Produce: outputs from chosen playbook, verification evidence, exception tracking.

## Definition of Done
- Correct context chosen; matching playbook executed; principles applied; evidence and exceptions documented.

## Related
- [../security-secrets-hygiene/SKILL.md](../security-secrets-hygiene/SKILL.md), [../security-audit/SKILL.md](../security-audit/SKILL.md).
