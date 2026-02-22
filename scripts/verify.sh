#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$root_dir/scripts/codex/validate_skills.py"
"$root_dir/scripts/check-no-stale-refs.sh"
"$root_dir/scripts/check-orchestration-integrity.sh"

for pkg in "skills/dev-tools/quality-gate" "skills/dev-tools/multi-model-review"; do
  echo "==> verify $pkg"
  (
    cd "$root_dir/$pkg"
    npm ci
    npm run lint
    npm run format:check
    npm run build
    npm test
  )
done
