# Helm release checklist (template)

## Inputs pinned
- Chart source:
- Chart version:
- Values files:
- Namespace/context:

## Preflight
- Rendered manifests reviewed.
- Diff reviewed (key resources, selectors, probes, resources).
- Rollback plan prepared.

## Apply
- Upgrade/install executed (command recorded).
- Rollout monitored (status/events).

## Verify
- Smoke checks pass.
- Key metrics stable.

