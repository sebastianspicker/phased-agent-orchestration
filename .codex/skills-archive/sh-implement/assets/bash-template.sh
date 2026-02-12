#!/usr/bin/env bash
set -euo pipefail

# Template: replace `script-name` and adjust flags/args to your needs.

usage() {
  cat >&2 <<'EOF'
Usage:
  script-name [--dry-run] [--] <arg>

Options:
  --dry-run    Print actions without executing
  -h, --help   Show help
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

dry_run=0
arg=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --)
      shift
      break
      ;;
    -*)
      usage
      die "unknown option: $1"
      ;;
    *)
      break
      ;;
  esac
done

if [[ $# -lt 1 ]]; then
  usage
  die "missing required argument"
fi

arg="$1"

run() {
  if [[ "$dry_run" == "1" ]]; then
    printf '[dry-run] %q ' "$@"
    printf '\n'
    return 0
  fi
  "$@"
}

main() {
  # Example action
  run echo "arg=$arg"
}

main
