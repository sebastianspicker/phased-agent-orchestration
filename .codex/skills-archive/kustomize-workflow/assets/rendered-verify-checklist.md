# Rendered manifests verify checklist

- Render output for the target env is captured (file or artifact).
- Review changes to:
  - selectors/labels
  - service ports/targetPorts
  - probes and timeouts
  - resource requests/limits
  - ingress hosts/paths/TLS
  - secret/config references
- Apply method recorded (GitOps/apply).
- Verification evidence captured (rollout status + smoke test).

