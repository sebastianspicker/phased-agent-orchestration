---
paths:
  - "adapters/templates/**"
---

# Adapter Templates (Source of Truth)

These templates generate all runner-specific adapter files. Available substitution tokens:

- `{{RUNNER_ID}}` — lowercase runner identifier (e.g., `claude`)
- `{{RUNNER_NAME}}` — display name (e.g., `Claude`)
- `{{RUNNER_TITLE}}` — title-case name (e.g., `Claude`)
- `{{CORE_PLAYBOOK_PATH}}` — path to core playbook
- `{{ADAPTER_ROOT}}` — runner's adapter skill root (e.g., `adapters/claude/skills`)

After editing any template:
1. Regenerate: `python3 scripts/adapters/generate_adapters.py`
2. Verify sync: `python3 scripts/adapters/generate_adapters.py --check`
3. Full verify: `./scripts/verify.sh`
