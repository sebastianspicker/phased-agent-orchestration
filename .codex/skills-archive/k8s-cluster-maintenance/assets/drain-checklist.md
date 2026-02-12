# Cordon/drain checklist (starter)

- Confirm PDBs and replicas allow eviction.
- Cordon node before drain.
- Drain with appropriate flags for your environment (avoid data loss).
- Verify workloads reschedule and become ready.
- Uncordon only after node is healthy post-upgrade.

