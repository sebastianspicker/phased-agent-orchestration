# ts-optimize (Skill)

A sandboxed **TypeScript Optimizer Skill** for:
- **Debugging** in 3 levels: `quick | medium | complex`
- **Deduplication** (duplicate-code candidates)
- **Lint fixes** (e.g., prefer-const)
- **API migrations** (e.g., import renames via rules)
- **Refactoring**: emits **Unified-Diff patches** and can optionally write
- **Codegen**: barrel exports (`index.ts`) from folders
- **Optimization recommendations**: web/bundle, Node, types, perf/numerics

## Best-practice principles (important)
- **Patch-first**: the skill emits diffs; it only writes changes when `applyFixes=true`.
- **No network** in the sandbox (see `sandbox/permissions.yaml`).
- **Input validation**: the root path must be under `/workspace`.
- **Conservative & deterministic**: only safe transformations (e.g., `prefer-const`) are offered as patches.
- **Graceful degradation**: heuristics are bounded (files/nodes) and log when limits apply.

## Local usage via Docker (recommended)
1) Build the image:
   ```bash
   cd skills/dev-tools/ts-optimize
   docker build -t ts-optimize-skill -f sandbox/Dockerfile .
   ```

2) Run the skill on a project (mounted to `/workspace`):
   ```bash
   cat examples/input.complex.json | docker run --rm -i \
     -v "$PWD/../../..":/repo:ro \
     -v "/ABSOLUTE/PATH/TO/YOUR/TS/PROJECT":/workspace \
     ts-optimize-skill
   ```

   Update `tsconfigPath` in `examples/input.*.json` as needed.

## Input/Output
- Input schema: `schemas/input.schema.json`
- Output schema: `schemas/output.schema.json`

Findings include:
- TypeScript diagnostics (tsc)
- Any hotspots & complexity hotspots
- Dedupe candidates
- Recommendations
- Optional patches (Unified Diff) under `data.patches[]`

## Actions (quick overview)
- **lint**: `lintRules`, e.g. `prefer-const`, `no-var`
- **migrate**: `renameImports` (module/name rename)
- **codegen**: `barrel` generates `index.ts` with `export * from ...`
- **applyFixes**: writes changes to `/workspace` and always emits patches
- **targets.changedOnly**: currently ignored (use `targets.paths`)

