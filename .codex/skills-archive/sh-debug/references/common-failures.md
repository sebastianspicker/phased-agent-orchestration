# Shell common failures (quick triage)

## Quoting and word splitting
- Symptom: filenames with spaces break; `rm $files` deletes wrong paths.
- Fix: quote expansions (`"$var"`) and prefer arrays in bash.

## `set -e` surprises
- Symptom: script exits early after a “non-fatal” command.
- Fix: avoid relying on `set -e` semantics; explicitly handle return codes:
  - `if ! cmd; then ...; fi`

## Pipelines and exit codes
- Symptom: `cmd | grep pattern` returns 0 even when `cmd` failed (or vice versa).
- Fix: enable `set -o pipefail` (bash) and check exit codes explicitly.

## BSD vs GNU tool differences
- Symptom: `sed -i` behaves differently on macOS; `grep -P` unsupported.
- Fix: use portable flags or pin toolchain in CI (e.g., GNU coreutils).

## Relative paths and implicit `cd`
- Symptom: works locally but fails when invoked from different working dir.
- Fix: resolve script dir and use absolute paths:
  - `script_dir=$(cd -- \"$(dirname -- \"$0\")\" && pwd)`

## Missing tools in CI
- Symptom: `command not found` only in CI/Docker.
- Fix: install dependencies in the job or assert early with a clear error.
