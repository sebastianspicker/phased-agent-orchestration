# Kubernetes debug log (template)

## Context
- Date/time:
- Cluster/context:
- Namespace:
- Workload (type/name):
- Symptom:
- First observed:
- Recent change (deploy/config):

## Quick snapshot
- `kubectl get pods -o wide`:
- `kubectl get events --sort-by=.lastTimestamp | tail`:
- Rollout status:

## Hypotheses
1) Primary hypothesis:
2) Alternative:

## Evidence (Command -> Observation)
| Command | Observation |
|---|---|
| | |
| | |

## Fix / Mitigation
- Change applied (what/where):
- Rollback plan:

## Verification
- `kubectl rollout status ...`:
- Health checks/smoke test:
- Evidence links/snippets:

## Follow-ups
- Prevention (alert/runbook/test):
- Owner + due date:

