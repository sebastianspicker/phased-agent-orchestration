# Security Policy

## Supported Versions

Only the latest version on the `main` branch is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue.
2. Use [GitHub's private vulnerability reporting](https://github.com/sebastian/phased-agent-orchestration/security/advisories/new) to submit a report.
3. Include steps to reproduce, impact assessment, and any suggested fix.

You should receive an acknowledgement within 48 hours.

## Security Measures

This repository employs the following automated security controls:

- **CodeQL** — static analysis on every push to `main` and weekly schedule
- **Gitleaks** — secret scanning on all commits
- **npm audit** — dependency vulnerability scanning (weekly + CI)
- **Dependabot** — automated dependency update PRs
- **Pinned Actions** — all GitHub Actions pinned by full commit SHA
- **Minimal Permissions** — CI workflows use least-privilege `contents: read`
- **CODEOWNERS** — enforced review on security-critical paths
