# AGENTS

This repo implements a phased AI orchestration pipeline with two layers:
- **Orchestration playbook** (agent guidance under `.codex/skills/orchestration/`).
- **Runtime skills** (Node packages under `skills/dev-tools/*`).

## Repo map
- `.codex/skills/orchestration/SKILL.md` — core pipeline playbook (15 configurations: Intake/arm, Design Synthesis/design, Adversarial Challenge/adversarial-review, Execution Blueprint/plan, Drift Match/pmatch, Coordinated Build/build, quality-static, quality-tests, denoise, quality-frontend, quality-backend, quality-docs, security-review, release-readiness, pipeline).
- `.cursor/skills/orchestration-*/` — 11 Cursor phase adapter skills (Intake, Design Synthesis, Adversarial Challenge, Execution Blueprint, Drift Match, Coordinated Build, quality-static, quality-tests, post-build, release-readiness, pipeline).
- `contracts/artifacts/` — artifact schemas (brief, design-document, review-report, execution-plan, drift-report, quality-report, release-readiness).
- `contracts/artifacts/` — artifact schemas (brief, design-document, review-report, execution-plan, drift-report, quality-report, release-readiness, execution-trace, evaluation-report).
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
