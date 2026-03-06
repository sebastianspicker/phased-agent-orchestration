---
name: verify
description: "Run the full repository verification suite including linting, formatting, builds, tests, and integrity checks."
---

# /verify - Repository Verification

## Use this when
- After making changes to code, contracts, or configuration.
- Before proposing completion of any task.
- The user asks for `/verify`, checks, or validation.

## Procedure

Run the verification suite:

```bash
./scripts/verify.sh
```

Common flags:
- `--skip-install` — skip `npm install` if already done
- `--parallel` — run package checks in parallel
- `--changed-only` — only verify packages affected by changes
- `--changed-base=<ref>` — compare against a specific git ref

Report results: list any failures with the failing check name and actionable fix suggestions.
