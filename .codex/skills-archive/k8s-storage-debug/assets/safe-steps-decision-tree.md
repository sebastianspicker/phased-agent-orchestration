# Safe steps decision tree (starter)

1) Is data critical?
   - yes -> confirm backups/restore path; avoid destructive actions
2) Is PVC pending?
   - yes -> StorageClass/provisioner/topology investigation
3) Is pod stuck creating due to mount/attach?
   - yes -> events/CSI/node investigation
4) Is it a permissions error?
   - yes -> securityContext/fsGroup alignment and minimal change

Always:
- capture evidence
- apply one change at a time
- re-verify after each change

