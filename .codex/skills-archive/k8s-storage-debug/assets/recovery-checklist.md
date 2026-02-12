# Storage recovery checklist (starter)

- Confirm reclaim policy and backup posture before deleting anything.
- If PVC is pending:
  - confirm StorageClass exists and is intended
  - confirm provisioner is healthy
- If mount/attach errors:
  - check events for CSI error codes/messages
  - confirm node health and pressure
- For permissions:
  - confirm runtime user/group and fsGroup policy
  - prefer minimal changes; document why

