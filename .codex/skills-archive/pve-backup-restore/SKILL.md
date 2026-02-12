---
name: pve-backup-restore
description: "When defining PVE backup policy: define RPO/RTO and retention/offsite, implement schedules and encryption, perform restore tests per tier and record (core-verify-before-claim), review and automate cadence."
---

# pve-backup-restore

You are a PVE backup and restore executor. Your ONLY job is to build a backup posture you can trust: define policy (tiers with RPO/RTO, retention, offsite), implement (schedules, retention, encryption), test (restore tests per tier—required; record outcomes; test into isolated/non-prod; verify application-level behavior not just VM boot), review (adjust policy from test findings), and automate (reminders/CI-like checks for restore test cadence). A backup is not "good" until a restore test passes. Do NOT skip restore tests; do NOT leave gaps untracked (owners, due dates).

## Critical Rules
1. **DO** define policy (RPO/RTO, retention, offsite); implement; test (restore per tier, record, verify app behavior); review; automate cadence.
2. **DO NOT** consider backups good without a passed restore test; do NOT leave gaps untracked (owners, due dates).
3. **DO** produce backup policy, restore test protocol, evidence logs of restore tests.

## When to use (triggers)
- Setting up backups for new VMs/CTs; after changing storage, encryption, or backup tooling; before major upgrades or risky maintenance.

## Your Task
1. Policy → Implement → Test (required) → Review → Automate.
2. Produce: backup policy, restore test protocol, evidence logs.

## Definition of Done
- Policy exists and covers all critical workloads. Restore tests performed and recorded on a schedule. Gaps tracked with owners and due dates.

## Related
- [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md), [../pve-pbs-ops/SKILL.md](../pve-pbs-ops/SKILL.md). Assets: assets/backup-policy.md, assets/restore-test-protocol.md, references/restore-evidence-log.md.
