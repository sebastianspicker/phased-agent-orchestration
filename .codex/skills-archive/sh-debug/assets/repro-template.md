# Minimal repro template (shell)

## Goal
Capture a reproduction that is deterministic and runnable in one command.

## Checklist
- [ ] exact command line
- [ ] working directory (`pwd`)
- [ ] shell/version
- [ ] environment variables relevant to the failure
- [ ] expected vs actual output

## Example
```bash
set -euo pipefail
pwd
bash --version || true
export FOO="..."
./path/to/script.sh --flag value
```
