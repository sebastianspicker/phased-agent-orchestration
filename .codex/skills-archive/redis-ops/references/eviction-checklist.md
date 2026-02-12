# Redis eviction checklist (starter)

- Confirm maxmemory and eviction policy.
- Identify top key patterns by memory usage (if possible).
- Enforce TTLs for cache keys; avoid unbounded growth.
- Verify client retry behavior doesn’t amplify load.

