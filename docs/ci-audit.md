# CI Audit

Date: 2026-02-06

## Recent Runs
No failed workflow runs were found in the last 4 runs (all succeeded on 2026-02-05).

## Findings and Fix Plan

| Workflow | Failure(s) | Root Cause | Fix Plan | Risk | Verification |
| --- | --- | --- | --- | --- | --- |
| `CI` | None | Hardening gaps: no caching, timeouts, concurrency, or pinned Python runtime. | Add npm cache, timeouts, concurrency, and setup Python. | Low | `./scripts/ci-local.sh` and GitHub Actions run `CI` on PR/push. |
| `Security` | None | Hardening gaps and PR noise risk: npm audit on PRs; CodeQL on fork PRs can fail with insufficient permissions. | Add timeouts/concurrency, cache npm, restrict npm audit to main/schedule, skip CodeQL on fork PRs. | Low | GitHub Actions run `Security` on push/schedule; PRs verify Gitleaks + CodeQL (same-repo only). |

Status: fixed (2026-02-06)
