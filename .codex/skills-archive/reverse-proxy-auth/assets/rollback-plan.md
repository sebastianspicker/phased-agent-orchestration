# Auth rollout rollback plan (template)

## Trigger
- What conditions cause rollback?

## Steps
1) Disable auth middleware/proxy routing (restore previous config).
2) Reload proxy safely.
3) Verify public health endpoints and critical app access.

## Verification
- curl checks:
- user flow checks:

