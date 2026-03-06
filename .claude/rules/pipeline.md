---
paths:
  - ".pipeline/**"
  - "scripts/pipeline/**"
  - "scripts/pipeline-init.sh"
---

# Pipeline Scripts & State

- Pipeline state lives in `.pipeline/` (gitignored). Run state under `.pipeline/runs/<run-id>/`.
- Gate results: `gates/`, quality reports: `quality-reports/`, drift reports: `drift-reports/`.
- Trace events appended to `trace.jsonl`.
- Pipeline runner CLI: `scripts/pipeline/runner.mjs` — supports `run-stage`, `start-phase`, `end-phase`, `record-artifact`, `record-gate`, `summarize-run`.
- Pipeline lib modules: `scripts/pipeline/lib/{artifacts,gates,commands,state,trace,utils,errors,subprocess}.mjs`.
- Constants (phases, config IDs): `scripts/lib/constants.mjs`.
