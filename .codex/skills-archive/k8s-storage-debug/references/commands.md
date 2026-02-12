# Kubernetes storage command snippets

- PVC/PV:
  - `kubectl -n <ns> get pvc`
  - `kubectl -n <ns> describe pvc <name>`
  - `kubectl get pv <name> -o yaml`
- StorageClass:
  - `kubectl get storageclass`
  - `kubectl describe storageclass <name>`
- Pod events:
  - `kubectl -n <ns> describe pod <pod>`
  - `kubectl -n <ns> get events --sort-by=.lastTimestamp | tail -n 50`
- CSI drivers (cluster-specific):
  - check controller/daemonset pods in the CSI namespace

