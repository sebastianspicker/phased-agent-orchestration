# Kubernetes release checklist (template)

## Before
- Target context/namespace confirmed.
- Manifests render/validate.
- Config/Secrets present (or creation included).
- Rollback method prepared (command + target revision).
- Migrations plan reviewed (if any).

## During
- Rollout started (how/where recorded).
- `kubectl rollout status` monitored.
- Events monitored for warnings/errors.

## Verify
- Rollout complete (evidence captured).
- Smoke checks pass (links or command outputs).
- Key metrics stable (latency/error rate/saturation).

## After
- Monitoring window complete.
- Follow-ups filed (alerts/runbook/tests).

