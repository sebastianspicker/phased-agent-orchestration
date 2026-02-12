---
name: k8s
description: "Kubernetes playbook. Use when debugging pods/workloads, deploying, networking, storage, observability, security baseline, cluster maintenance, Helm, or Kustomize. Choose configuration from user prompt."
---

# k8s (Playbook)

Kubernetes and related tooling. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Pod/workload failures, CrashLoopBackOff, probes → **debug**
- Releasing to cluster, GitOps/Helm → **deploy**
- DNS, Services, Ingress, NetworkPolicies → **networking**
- PVC/PV, StorageClass, CSI → **storage**
- Prometheus/Grafana/OTel, alerts → **observability**
- RBAC, least privilege, secrets → **security-baseline**
- Node upgrades, cordon/drain → **cluster-maintenance**
- Helm charts → **helm**
- Kustomize bases/overlays → **kustomize**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| CrashLoopBackOff, ImagePullBackOff, probes, Pending | debug |
| deploy, release, GitOps, rollout | deploy |
| DNS, Services, Ingress, NetworkPolicies, MTU | networking |
| PVC, PV, StorageClass, mount, expand | storage |
| metrics, logs, traces, alerts, SLO | observability |
| RBAC, security, secrets, pod security | security-baseline |
| upgrade, cordon, drain, maintenance | cluster-maintenance |
| Helm, chart, values | helm |
| Kustomize, overlay, patch | kustomize |

## Configurations

### debug
Scope (context, namespace, workload) → Observe (status, events, logs) → Explain (one hypothesis) → Fix (reversible: rollback, revert) → Verify. Triage: ImagePullBackOff (creds, tag, network); CrashLoopBackOff (crash, env, OOM); Pending (resources, PVC, taints); probe failures (port, startup). kubectl-first evidence.

### deploy
Plan rollout; handle config and migrations; verify and rollback gates. GitOps/apply/Helm as appropriate.

### networking
DNS/CoreDNS; Services/Endpoints; Ingress; NetworkPolicies; MTU; in-cluster tests.

### storage
PVC/PV binding; mount/attach; permissions; expansion; reclaim; data safety first.

### observability
Golden signals; kube-state-metrics; SLO/burn-rate alerts; runbook links; logs/metrics/traces correlation.

### security-baseline
Least-privilege RBAC; namespace isolation; service accounts; secret handling; pod security; audit; SBOM/scans.

### cluster-maintenance
Node pool upgrades; cordon/drain; certificate rotation; admission/policy rollout; verification and rollback.

### helm
Values layering; chart pinning; render/diff/validate; rollback-friendly releases.

### kustomize
Bases/overlays; patches; generators; render/diff/validate; environment-safe.
