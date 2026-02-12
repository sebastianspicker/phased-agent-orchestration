# Kustomize layout (convention)

Suggested structure:

- `k8s/`
  - `base/`
    - `kustomization.yaml`
    - core manifests
  - `overlays/`
    - `dev/kustomization.yaml`
    - `staging/kustomization.yaml`
    - `prod/kustomization.yaml`

Rules:
- Keep base generic; put env-specific values in overlays.
- Prefer patches over copy/paste.
- Document non-obvious patches.

