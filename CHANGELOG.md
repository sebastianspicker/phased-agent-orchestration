# Changelog

All notable changes to this project will be documented here.

Format: grouped by milestone. No formal versioning yet — use `git log` for a full commit history.

---

## [Unreleased]

### Added
- `CONTRIBUTING.md` with setup and contribution guidelines.
- `CHANGELOG.md`.
- `Makefile` with common task targets.
- Pre-commit hook (`scripts/hooks/pre-commit`) and installer (`scripts/install-hooks.sh`).

---

## [Mar 2026] — Security, CI, and polish

### Added
- `SECURITY.md` with responsible disclosure policy and private vulnerability reporting.
- `CODEOWNERS` enforcing review on security-critical paths (`.github/`, `scripts/`, `contracts/`).
- `.github/dependabot.yml` for weekly npm and GitHub Actions dependency PRs.
- `security.yml` workflow: CodeQL static analysis, Gitleaks secret scanning, `npm audit`.
- `ci.yml` workflow: diff-aware fast verification on PRs, full verify + pipeline smoke on push to main.
- `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml` (structured forms).
- `.github/pull_request_template.md` with verification checklist.
- Mermaid pipeline flow diagrams in README.
- All GitHub Actions pinned by full commit SHA (no `@main` tags).

### Changed
- README rewritten: clear quickstart (2 commands), architecture summary, runtime package table.

### Fixed
- `scripts/verify.sh`: xargs injection antipattern replaced with positional `$1` passing.
- Hoisted `@biomejs/biome` and `vitest` to root devDependencies for CI cache consistency.

---

## [Mar 2026] — Code quality and test coverage

### Fixed
- Extracted `resolveModuleDefault<T>()` helper in `_shared/src/ajv.ts` to remove duplicated CJS/ESM unwrapping.
- Merged `validatedDriftConfig` double-check in `multi-model-review/src/lib/input.ts`.
- Removed mid-file `import` in `drift.ts` (moved to top).
- Removed unnecessary `as number` casts in `mergeConfidence`.
- Replaced duplicated `readJson`/`writeJson` in `aggregate.mjs` and `run-matrix.mjs` with shared `state.mjs` functions.
- Fixed hardcoded skill entrypoint in `traceability.mjs` to use `SKILL_ENTRYPOINTS` constant.

### Added
- 26 new unit tests for pipeline runner dispatch, error handling, and traceability.
- `runStage` decomposition for cleaner testability.

---

## [Feb 2026] — Roadmap gap closure (v0.2)

### Added
- Execution trace contract (`contracts/artifacts/execution-trace.schema.json`) and trace-collector skill.
- Evaluation harness: `scripts/eval/run-matrix.mjs`, `scripts/eval/aggregate.mjs`, evaluation-report schema.
- Context manifest support: `count-max` and `number-max` quality-gate criterion types.
- Orchestration policy: `docs/ORCHESTRATION_POLICY.md` and `scripts/pipeline/lib/policy.mjs`.
- End-to-end traceability: `contracts/artifacts/traceability-check.schema.json` and `scripts/pipeline/lib/traceability.mjs`.
- Drift benchmark: goldset, precision/recall/F1 thresholds (`scripts/eval/drift-benchmark.mjs`).
- Cognitive tiering: model-tier mapping for Claude CLI (Opus/Sonnet/Haiku).

---

## [Jan 2026] — Initial release (v0.1)

### Added
- 10-stage phased pipeline: arm → design → adversarial-review → plan → pmatch → build → quality-static → quality-tests → post-build → release-readiness.
- Runtime skill packages: `quality-gate`, `multi-model-review`, `trace-collector`.
- Adapter system: `adapters/spec/adapter-manifest.json`, templates, and generated adapters for codex, cursor, claude, gemini, kilo.
- Pipeline runner CLI (`scripts/pipeline/runner.mjs`) with `run-stage`, `start-phase`, `end-phase`, `record-artifact`, `record-gate`, `summarize-run`.
- Artifact schemas in `contracts/artifacts/` and gate schema in `contracts/quality-gate.schema.json`.
- `scripts/verify.sh` with full and diff-aware modes.
