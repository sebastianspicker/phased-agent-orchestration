---
paths:
  - "skills/dev-tools/**"
---

# Runtime Skill Packages

Packages: `_shared`, `quality-gate`, `multi-model-review`, `trace-collector`.

- Do not move or rename `manifest.yaml`, `schemas/*`, `src/*`, or `sandbox/*`.
- All packages use npm workspaces — install from root with `npm install`.
- After changes, verify the specific package:
  ```
  cd skills/dev-tools/<package> && npm run build && npm test
  ```
- Run `./scripts/verify.sh` for full validation.
- These packages do not call external model APIs — they are deterministic validation/analysis tools.
