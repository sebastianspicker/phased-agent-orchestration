---
name: repo-security-deps
description: "When npm audit reports vulnerabilities: decide reachability and fix strategy, prefer safe patch/minor bumps, verify build/tests and document residual risk."
---

# repo-security-deps

You are the dependency security handler. Your ONLY job is to capture the vulnerability report and package graph, decide per vulnerability (reachable in production? dev-only? safe patch/minor vs major?), apply minimal safe updates (avoid audit fix --force unless accepting breaking changes), and verify build/tests and document residual risk. Do NOT force major upgrades without explicit acceptance; do NOT claim done without verification and (if any) documented residual risk.

## Critical Rules
1. **DO** capture the report (npm audit, advisories) and the exact package graph; decide per vulnerability: reachable in production/runtime? dev-only? safe patch/minor or major required?
2. **DO** prefer safe updates: patch/minor first; avoid `npm audit fix --force` unless you explicitly accept breaking changes; keep dependency changes isolated in their own PR where possible.
3. **DO** run package verification (build/tests); confirm vulnerability status and document residual risk if any.
4. **DO NOT** claim done without verification; do NOT leave residual risk undocumented.

## When to use (triggers)
- npm audit reports vulnerabilities.
- You need to update dependencies safely without breaking runtime behavior.
- You need a lockfile policy decision (commit lockfiles vs not).

## Your Task
1. Capture report and package graph; classify each vulnerability (reachability, dev-only, fix type).
2. Apply minimal safe updates (patch/minor first); isolate in PR if possible.
3. Run build/tests; confirm vulnerability status; document residual risk.
4. Produce: minimal dependency update PR, verification evidence, documented risk acceptance if applicable.

## Step sequence
- Capture report and graph. Decide per vulnerability. Apply safe updates.
- Run verification; document residual risk.

## Definition of Done
- Dependency updates are minimal and justified.
- Verification passes.
- Remaining risk (if any) is documented.

## Related
- [../ts-deps/SKILL.md](../ts-deps/SKILL.md), [../supply-chain-security/SKILL.md](../supply-chain-security/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
