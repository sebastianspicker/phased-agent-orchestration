# Helm values layout (convention)

Suggested structure:

- `charts/<name>/`
  - `Chart.yaml`
  - `values.yaml` (base defaults)
  - `values.dev.yaml`
  - `values.staging.yaml`
  - `values.prod.yaml`

Rules:
- Put only non-secret config in values.
- Keep overrides small and environment-focused.
- Document non-obvious defaults in a short README per chart.

