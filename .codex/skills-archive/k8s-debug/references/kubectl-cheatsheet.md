# kubectl cheatsheet (debug-first)

## Scope
- Current context: `kubectl config current-context`
- Namespaces: `kubectl get ns`

## Workloads and pods
- Get common resources: `kubectl -n <ns> get deploy,sts,ds,svc,ing`
- Pods wide: `kubectl -n <ns> get pods -o wide`

## Events and describe
- Recent events: `kubectl -n <ns> get events --sort-by=.lastTimestamp | tail -n 50`
- Describe pod: `kubectl -n <ns> describe pod <pod>`
- Describe deploy: `kubectl -n <ns> describe deploy <name>`

## Logs
- All containers: `kubectl -n <ns> logs <pod> --all-containers --tail=200`
- Previous crash logs: `kubectl -n <ns> logs <pod> --previous --tail=200`

## Rollouts
- Status: `kubectl -n <ns> rollout status deploy/<name>`
- History: `kubectl -n <ns> rollout history deploy/<name>`
- Undo: `kubectl -n <ns> rollout undo deploy/<name>`

