# CI Decision

Date: 2026-02-06

## Decision
FULL CI (fast checks on PRs, heavier security on main/schedule).

## Repo Analysis (Why CI Is Worth It)
- Repo contains executable code and tests for two Node/TypeScript runtime skill packages.
- There is a Python validation script used as part of the verification gate.
- No production secrets or live infrastructure access is required for the core checks.
- The build/test workload is small and deterministic enough for GitHub-hosted runners.

## What Runs Where
PRs:
- `CI / Verify (skills)`
- `Security / Gitleaks`
- `Security / CodeQL` (only for same-repo PRs; skipped on fork PRs)

Push to `main`:
- `CI / Verify (skills)`
- `Security / Gitleaks`
- `Security / CodeQL`
- `Security / Npm Audit (scheduled)`

Schedule (weekly):
- `Security / Gitleaks`
- `Security / CodeQL`
- `Security / Npm Audit (scheduled)`

Manual (`workflow_dispatch`):
- Same as schedule

## Threat Model (CI)
- Untrusted fork PRs: no secrets are required; CodeQL upload is skipped for forks to avoid permission failures.
- No `pull_request_target` is used.
- Workflow permissions are least-privilege (`contents: read` by default, explicit `security-events: write` only for CodeQL).
- No deploy steps or external infrastructure access in CI.

## Limits / Assumptions
- GitHub-hosted Ubuntu runners provide Node 20 and Python 3.11.
- `npm audit` is intentionally not run on PRs to avoid nondeterministic failures from upstream advisory churn.

## If We Later Want “More Than Full CI”
To expand beyond the current full CI into release-grade pipelines:
- Add signed, versioned build artifacts (e.g., tarballs) with checksum verification.
- Add release workflows with approvals for tagged releases.
- Add integration tests (if any) gated behind a separate `workflow_dispatch` or schedule.
- Consider self-hosted runners if environment-specific tooling is required.
