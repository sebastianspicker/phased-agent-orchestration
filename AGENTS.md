# AGENTS

This repo implements a phased AI orchestration pipeline with two layers:
- **Orchestration adapters** (agent guidance under `adapters/<runner>/skills/`).
- **Runtime skills** (Node packages under `skills/dev-tools/*`).

## Repo map
- `adapters/spec/adapter-manifest.json` — source-of-truth for supported runners, stage order, stage adapter paths, and expected gate references.
- `adapters/templates/` — canonical templates for runner adapter files and root runner entry docs.
- `adapters/<runner>/skills/orchestration-*/` — per-runner stage adapters (`codex`, `cursor`, `claude`, `gemini`, `kilo`) for Intake, Design Synthesis, Adversarial Challenge, Execution Blueprint, Drift Match, Coordinated Build, quality-static, quality-tests, post-build, release-readiness, and pipeline.
- `scripts/adapters/generate_adapters.py` — deterministic generator (`--check` available) for adapters, legacy mirrors (`.codex/.cursor`), and runner root entry files.
- `scripts/check-adapter-sync.sh` — sync guard used by verify to ensure generated files match templates.
- `CODEX.md`, `CURSOR.md`, `CLAUDE.md`, `GEMINI.md`, `KILO.md` — runner-specific root entrypoints into the orchestration pipeline.
- `.codex/skills/orchestration/SKILL.md` — legacy-compatible core playbook reference.
- `contracts/artifacts/` — artifact schemas (brief, design-document, review-report, execution-plan, drift-report, quality-report, release-readiness, execution-trace, evaluation-report, context-manifest-gate, traceability-check).
- `contracts/quality-gate.schema.json` — reusable quality gate schema.
- `skills/dev-tools/quality-gate/` — runtime skill: artifact validation + acceptance criteria.
- `skills/dev-tools/multi-model-review/` — runtime skill: finding dedup, cost/benefit analysis, drift detection.
- `skills/dev-tools/trace-collector/` — runtime skill: execution trace validation + deterministic run summaries.
- `scripts/pipeline-init.sh` — initialize a pipeline run.
- `scripts/eval/` — matrix execution + evaluation aggregation scripts.
- `docs/pipeline/` — pipeline state template.
- `deprecated/` — local-only holding area for retired files (git-ignored, not part of repo).

## Verify changes

Repo-wide shortcut:
```bash
./scripts/verify.sh
```
This now includes an orchestration integrity smoke-check (`scripts/check-orchestration-integrity.sh`) before package build/tests.
It also includes adapter template sync validation (`scripts/check-adapter-sync.sh`).
It also enforces markdown link integrity (`scripts/check-markdown-links.py`) and tracked-file hygiene (`scripts/check-repo-hygiene.sh`).

Fast diff-aware mode:
```bash
./scripts/verify.sh --changed-only [--changed-base <git-ref>]
```

### quality-gate
```bash
cd skills/dev-tools/quality-gate
npm install
npm run lint
npm run format:check
npm run build
npm test
```

### multi-model-review
```bash
cd skills/dev-tools/multi-model-review
npm install
npm run lint
npm run format:check
npm run build
npm test
```

### trace-collector
```bash
cd skills/dev-tools/trace-collector
npm install
npm run lint
npm run format:check
npm run build
npm test
```

## Rules
- Do not break runtime skill packages: avoid moving/renaming `manifest.yaml`, `schemas/*`, `src/*`, or `sandbox/*`.
- Reproduce issues locally before changing behavior.
- Keep diffs small and focused.
- Artifacts validate against `contracts/artifacts/*.schema.json`.
- Quality gates validate against `contracts/quality-gate.schema.json`.
- Security-review artifacts (`audit_type=security`) must include structured remediation tracking (`security_audit` coverage, fix-loop evidence, accepted-risk owner/expiry).
