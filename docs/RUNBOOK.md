# RUNBOOK

This runbook lists reproducible commands for setup, verification, and troubleshooting.

## Requirements
- Node.js >= 20 (see `skills/dev-tools/*/package.json` engines).
- npm (for `npm ci` / `npm run`).
- Python 3 (for `scripts/codex/validate_skills.py`).
- Docker (optional, for local sandbox execution).
- PowerShell (`pwsh`) is optional; used by `ps1-optimize` diagnostics when available.

## Repo-wide verification (full loop)
From repo root:
```bash
./scripts/verify.sh
```
This runs:
- `python3 scripts/codex/validate_skills.py`
- `npm ci`, `npm run build`, `npm test` for both runtime skill packages.

## Fast loop (per-package)
From repo root:
```bash
python3 scripts/codex/validate_skills.py
```
Then, in the relevant package:
```bash
cd skills/dev-tools/ts-optimize
npm ci
npm run build
npm test
```
```bash
cd skills/dev-tools/ps1-optimize
npm ci
npm run build
npm test
```

## Lint / Format
- No dedicated lint/format scripts are currently configured.

## Typecheck
- `npm run build` (per package, uses `tsc -p tsconfig.json`).

## Build
- Same as typecheck: `npm run build` per package.

## Tests
- `npm test` (per package, runs `vitest run`).

## Security (minimum baseline)
### Secret scanning
- CI: Gitleaks (`.github/workflows/security.yml`). For org accounts, set `GITLEAKS_LICENSE` secret if required.
- Local (optional): `gitleaks detect --source .` (requires gitleaks installed).

### SCA / dependency scanning
From repo root:
```bash
cd skills/dev-tools/ts-optimize
npm ci
npm audit --audit-level=high
```
```bash
cd skills/dev-tools/ps1-optimize
npm ci
npm audit --audit-level=high
```

### SAST
- CI: CodeQL (`.github/workflows/security.yml`).

## Troubleshooting
- Node version mismatch: ensure Node >= 20.
- Python not found: install Python 3 or adjust PATH.
- `npm ci` fails: delete `node_modules` and retry.
