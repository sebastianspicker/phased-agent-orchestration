---
name: pve
description: "Proxmox VE playbook. Use when operating PVE (basics, networking, ZFS/Ceph storage, backup, PBS, VM templates/cloud-init, security). Choose configuration from user prompt."
---

# pve (Playbook)

Proxmox VE operations. **Choose one configuration** from the user prompt.

## When to use (triggers)
- PVE node/cluster ops, maintenance → **basics**
- vmbr, VLAN, bonds, routing → **networking**
- ZFS pool, scrubs, snapshots → **storage-zfs**
- Ceph health, OSD, backfill → **storage-ceph**
- Backup/restore, RPO/RTO → **backup-restore**
- Proxmox Backup Server → **pbs-ops**
- Templates, cloud-init → **vm-templates**
- Access, firewall, updates → **security-baseline**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| PVE node, cluster, maintenance, updates, reboot | basics |
| bridge, VLAN, bond, MTU, routing | networking |
| ZFS, pool, scrub, snapshot, replication | storage-zfs |
| Ceph, OSD, health, backfill, rebalance | storage-ceph |
| backup, restore, RPO, RTO, verify | backup-restore |
| PBS, datastore, retention, verify job | pbs-ops |
| template, cloud-init, golden image | vm-templates |
| PVE admin, firewall, MFA, audit | security-baseline |

## Configurations

### basics
Assess (nodes, VMs/CTs, health) → Plan (window, success criteria, backup readiness) → Execute (small steps, reversible) → Verify → Record (change log). Never wing it without rollback; drain/migrate before disruptive changes.

### networking
Bridges vmbr*; VLAN tagging; bonds/LACP; MTU; routing; PVE firewall zones. Debug: VM connectivity, asymmetric routing.

### storage-zfs
Pool health; scrubs; snapshots/replication; ARC/memory; quotas; capacity. Safe recovery; evidence logging.

### storage-ceph
Health states; backfill/rebalance impact; capacity; public vs cluster network; OSD failures; scrubs.

### backup-restore
RPO/RTO; retention; restore drills; offsite/encryption; restore test protocol.

### pbs-ops
Datastore layout; retention/pruning; verify jobs; encryption/key management; restore drills; replication; monitoring.

### vm-templates
Golden images; cloud-init user-data; SSH keys; deterministic provisioning; update strategy.

### security-baseline
Admin access; realms; MFA; API tokens; firewall defaults; update cadence; secrets; audit.
