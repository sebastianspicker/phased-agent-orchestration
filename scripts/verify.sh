#!/usr/bin/env bash
set -euo pipefail

SKIP_INSTALL=0
PARALLEL=0
CHANGED_ONLY=0
CHANGED_BASE="HEAD"
SECONDS=0

for arg in "$@"; do
  if [ "$arg" == "--skip-install" ]; then
    SKIP_INSTALL=1
  elif [ "$arg" == "--parallel" ]; then
    PARALLEL=1
  elif [ "$arg" == "--changed-only" ]; then
    CHANGED_ONLY=1
  elif [[ "$arg" == --changed-base=* ]]; then
    CHANGED_BASE="${arg#--changed-base=}"
  fi
done

for ((i=1; i<=$#; i++)); do
  if [ "${!i}" == "--changed-base" ]; then
    j=$((i + 1))
    if [ $j -le $# ] && [[ "${!j}" != --* ]]; then
      CHANGED_BASE="${!j}"
    else
      echo "ERROR: missing value for --changed-base" >&2
      exit 2
    fi
  fi
done

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run_core_checks() {
  python3 "$root_dir/scripts/skills/validate_skills.py" --manifest "$root_dir/adapters/spec/adapter-manifest.json" --root "$root_dir/.codex/skills"
  "$root_dir/scripts/check-no-stale-refs.sh"
  "$root_dir/scripts/check-repo-hygiene.sh"
  python3 "$root_dir/scripts/check-markdown-links.py" --root "$root_dir"
  "$root_dir/scripts/check-adapter-sync.sh"
  "$root_dir/scripts/check-orchestration-integrity.sh"
}

collect_changed_paths() {
  local base="$1"
  local diff_paths
  local untracked
  diff_paths="$(git -C "$root_dir" diff --name-only "$base" -- . || true)"
  untracked="$(git -C "$root_dir" ls-files --others --exclude-standard || true)"
  printf "%s\n%s\n" "$diff_paths" "$untracked" | sed '/^$/d' | sort -u
}

selected_packages_from_changes() {
  local base="$1"
  local changed_paths
  local full_verify=0
  local pkg_set=()
  local path

  if ! git -C "$root_dir" rev-parse --verify "$base" >/dev/null 2>&1; then
    echo "WARN: --changed-base '$base' not found; falling back to full package verification" >&2
    printf "%s\n" "ALL_PACKAGES"
    return 0
  fi

  changed_paths="$(collect_changed_paths "$base")"
  if [[ -z "$changed_paths" ]]; then
    printf "%s\n" "NO_PACKAGE_CHANGES"
    return 0
  fi

  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    case "$path" in
      skills/dev-tools/quality-gate/*)
        pkg_set+=("skills/dev-tools/quality-gate")
        ;;
      skills/dev-tools/multi-model-review/*)
        pkg_set+=("skills/dev-tools/multi-model-review")
        ;;
      skills/dev-tools/trace-collector/*)
        pkg_set+=("skills/dev-tools/trace-collector")
        ;;
      skills/dev-tools/_shared/*|contracts/*|biome.json|scripts/verify.sh|scripts/pipeline/*|scripts/lib/*|scripts/skills/*)
        full_verify=1
        ;;
      *)
        ;;
    esac
  done <<< "$changed_paths"

  if [ $full_verify -eq 1 ]; then
    printf "%s\n" "ALL_PACKAGES"
    return 0
  fi

  if [ ${#pkg_set[@]} -eq 0 ]; then
    printf "%s\n" "NO_PACKAGE_CHANGES"
    return 0
  fi

  printf "%s\n" "${pkg_set[@]}" | sort -u
}

run_core_checks

export SKIP_INSTALL
export root_dir

verify_pkg() {
  local pkg="$1"
  echo "==> verify $pkg"
  (
    cd "$root_dir/$pkg"
    if [ "$SKIP_INSTALL" -eq 0 ]; then
      npm ci
    fi
    npm run lint
    npm run format:check
    npm run build
    npm test
  )
}
export -f verify_pkg

verify_shared() {
  local pkg="skills/dev-tools/_shared"
  echo "==> verify $pkg"
  (
    cd "$root_dir/$pkg"
    if [ "$SKIP_INSTALL" -eq 0 ]; then
      npm ci
    fi
    npm run lint
    npm run format:check
    npm run build
  )
}

packages=(
  "skills/dev-tools/quality-gate"
  "skills/dev-tools/multi-model-review"
  "skills/dev-tools/trace-collector"
)

if [ "$CHANGED_ONLY" -eq 1 ]; then
  selection="$(selected_packages_from_changes "$CHANGED_BASE")"
  if [[ "$selection" == "ALL_PACKAGES" ]]; then
    :
  elif [[ "$selection" == "NO_PACKAGE_CHANGES" ]]; then
    packages=()
  else
    mapfile -t packages <<< "$selection"
  fi
fi

if [ ${#packages[@]} -eq 0 ]; then
  echo "==> verify runtime packages (skipped: no relevant package changes)"
else
  verify_shared
fi

if [ ${#packages[@]} -eq 0 ]; then
  :
elif [ "$PARALLEL" -eq 1 ] && [ ${#packages[@]} -gt 1 ]; then
  printf "%s\n" "${packages[@]}" | xargs -P 3 -I {} bash -c 'verify_pkg "{}"'
else
  for pkg in "${packages[@]}"; do
    verify_pkg "$pkg"
  done
fi

if [[ "${DRIFT_BENCHMARK:-0}" == "1" ]]; then
  echo "==> drift benchmark"
  node "$root_dir/scripts/eval/drift-benchmark.mjs" --root "$root_dir"
fi

echo "==> verify summary"
if [ "$CHANGED_ONLY" -eq 1 ]; then
  echo "mode: changed-only (base=$CHANGED_BASE)"
else
  echo "mode: full"
fi
if [ ${#packages[@]} -eq 0 ]; then
  echo "packages: none"
else
  echo "packages: ${packages[*]}"
fi
echo "duration_s: $SECONDS"
