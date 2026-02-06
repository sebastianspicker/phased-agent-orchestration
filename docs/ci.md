# CI

## Overview
This repo uses two GitHub Actions workflows:
- `CI` (fast, deterministic verification)
- `Security` (CodeQL + secret scanning + scheduled npm audit)

## Triggers
`CI`:
- `push` (all branches)
- `pull_request`

`Security`:
- `push` to `main`
- `pull_request`
- `schedule` (weekly, Monday 06:00 UTC)
- `workflow_dispatch` (manual)

## Jobs
`CI`:
- `Verify (skills)`

`Security`:
- `CodeQL` (skips fork PRs because SARIF upload requires `security-events: write`)
- `Gitleaks`
- `Npm Audit (scheduled)` (runs on `main`/schedule/manual only)

## Local Verification
Fast path (matches PR checks):
```bash
./scripts/ci-local.sh
```

Full verification (same as `CI` job):
```bash
./scripts/verify.sh
```

Optional security checks locally (not required for PRs):
- Gitleaks: install and run `gitleaks detect --source .`
- npm audit: `npm audit --audit-level=high` per package
- CodeQL: run via CodeQL CLI if needed

## Toolchain Pinning
- Node: 20 (GitHub Actions uses `actions/setup-node` with npm cache)
- Python: 3.11 (for `scripts/codex/validate_skills.py`)
- OS: `ubuntu-22.04`

## Secrets
- `GITHUB_TOKEN`: provided by GitHub Actions (read-only for fork PRs)
- `GITLEAKS_LICENSE`: optional (only needed for Gitleaks Pro)

## Extending CI
When adding a new runtime skill package:
- Add its verify steps to `scripts/verify.sh`
- Add its `package-lock.json` to the `cache-dependency-path` in workflows
- Update this document to include the new job or steps

## Using `act` (optional)
You can run jobs locally with `act` if you have Docker installed. Keep in mind:
- Some security jobs (CodeQL) are not practical with `act`
- Use `act -W .github/workflows/ci.yml` for fast checks
