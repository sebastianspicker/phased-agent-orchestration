# Render + verify (notes)

## Render
- Render to a file for review:
  - `helm template <release> <chart> -n <ns> -f values.yaml -f values.<env>.yaml > rendered.yaml`

## Diff (if available)
- Prefer a diff step before applying (tooling varies by environment).

## Verify
- `kubectl -n <ns> rollout status deploy/<name>`
- Run an in-cluster smoke check (see `k8s-deploy-workflow`).

