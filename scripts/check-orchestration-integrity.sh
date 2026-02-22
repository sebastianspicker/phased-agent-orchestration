#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v rg >/dev/null 2>&1; then
  echo "ERROR: ripgrep (rg) is required for orchestration integrity checks." >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required for orchestration integrity checks." >&2
  exit 2
fi

declare -A adapters=(
  [arm]=".cursor/skills/orchestration-arm/SKILL.md"
  [design]=".cursor/skills/orchestration-design/SKILL.md"
  [adversarial-review]=".cursor/skills/orchestration-ar/SKILL.md"
  [plan]=".cursor/skills/orchestration-plan/SKILL.md"
  [pmatch]=".cursor/skills/orchestration-pmatch/SKILL.md"
  [build]=".cursor/skills/orchestration-build/SKILL.md"
  [quality-static]=".cursor/skills/orchestration-quality-static/SKILL.md"
  [quality-tests]=".cursor/skills/orchestration-quality-tests/SKILL.md"
  [post-build]=".cursor/skills/orchestration-postbuild/SKILL.md"
  [release-readiness]=".cursor/skills/orchestration-release-readiness/SKILL.md"
)

declare -A expected_gates=(
  [arm]="arm-gate.json"
  [design]="design-gate.json"
  [adversarial-review]="adversarial-review-gate.json"
  [plan]="plan-gate.json"
  [pmatch]="pmatch-gate.json"
  [build]="build-gate.json"
  [quality-static]="quality-static-gate.json"
  [quality-tests]="quality-tests-gate.json"
  [post-build]="postbuild-gate.json"
  [release-readiness]="release-readiness-gate.json"
)

failures=()

for stage in "${!adapters[@]}"; do
  file_path="$root_dir/${adapters[$stage]}"
  if [[ ! -f "$file_path" ]]; then
    failures+=("missing adapter for stage '$stage': ${adapters[$stage]}")
    continue
  fi

  expected_gate="${expected_gates[$stage]}"
  if ! rg --fixed-strings --quiet "$expected_gate" "$file_path"; then
    failures+=("adapter '${adapters[$stage]}' does not reference expected gate '$expected_gate'")
  fi
done

# pmatch-specific expectations
pmatch_adapter="$root_dir/.cursor/skills/orchestration-pmatch/SKILL.md"
if [[ -f "$pmatch_adapter" ]]; then
  if ! rg --fixed-strings --quiet 'drift_config.mode = "dual-extractor"' "$pmatch_adapter"; then
    failures+=("pmatch adapter must use dual-extractor mode")
  fi
  if ! rg --fixed-strings --quiet "extractor_claim_sets" "$pmatch_adapter"; then
    failures+=("pmatch adapter must reference extractor_claim_sets")
  fi
fi

# Stage order consistency in Cursor pipeline adapter and core playbook.
if ! python3 - "$root_dir" <<'PY'
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
tokens = [
    "arm",
    "design",
    "adversarial-review",
    "plan",
    "pmatch",
    "build",
    "quality-static",
    "quality-tests",
    "post-build",
    "release-readiness",
]

def assert_order(path: pathlib.Path) -> None:
    text = path.read_text(encoding="utf-8")
    idx = -1
    for token in tokens:
        pos = text.find(token, idx + 1)
        if pos == -1:
            raise RuntimeError(f"{path}: missing stage token '{token}'")
        if pos < idx:
            raise RuntimeError(f"{path}: stage token '{token}' appears out of order")
        idx = pos

assert_order(root / ".cursor/skills/orchestration-pipeline/SKILL.md")
assert_order(root / ".codex/skills/orchestration/SKILL.md")
PY
then
  failures+=("stage ordering mismatch between pipeline adapter and orchestration playbook")
fi

# Contract phase coverage checks.
if ! python3 - "$root_dir" <<'PY'
import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
qg = json.loads((root / "contracts/quality-gate.schema.json").read_text(encoding="utf-8"))
phase_enum = set(qg["properties"]["phase"]["enum"])
expected = {
    "arm",
    "design",
    "adversarial-review",
    "plan",
    "pmatch",
    "build",
    "quality-static",
    "quality-tests",
    "denoise",
    "quality-frontend",
    "quality-backend",
    "quality-docs",
    "security-review",
    "release-readiness",
}
missing = sorted(expected - phase_enum)
if missing:
    raise RuntimeError(f"quality-gate phase enum missing: {', '.join(missing)}")
PY
then
  failures+=("quality gate schema phase enum is incomplete")
fi

if (( ${#failures[@]} > 0 )); then
  echo "FAIL: orchestration integrity check failed:" >&2
  for failure in "${failures[@]}"; do
    echo "  - $failure" >&2
  done
  exit 1
fi

echo "OK: orchestration integrity checks passed"
