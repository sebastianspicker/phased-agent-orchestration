# Patch patterns (starter)

## Strategic merge patch
- Best for small key-based overrides (replicas, env vars, resources).

## JSON6902 patch
- Best for precise operations (add/replace/remove) and avoiding merge ambiguity.

## Tips
- Keep patches small and named after intent (e.g., `patch-add-readiness.yaml`).
- Avoid patching generated fields.

