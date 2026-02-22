# Codex Playbook Skills

This directory contains the **orchestration playbook**: a quality-gated pipeline from idea to shipped code.

## Entry points
- Repo guide + verification rules: [AGENTS.md](../../AGENTS.md)

## Validation
- Local check: `python3 scripts/codex/validate_skills.py`

## Types (1)

| Type | Description | Configurations |
|------|-------------|----------------|
| [orchestration](orchestration/SKILL.md) | Multi-phase AI pipeline: Intake, Design Synthesis, Adversarial Challenge, Execution Blueprint, Drift Match, Coordinated Build, post-build quality, mandatory security audit+fix loops | arm, design, adversarial-review, plan, pmatch, build, denoise, quality-frontend, quality-backend, quality-docs, security-review, pipeline |

## How to use
Open `orchestration/SKILL.md`. Use the "Choosing configuration from user prompt" table to pick the right configuration, then follow its steps.

## Archive
- Retired and legacy skill material is kept in `deprecated/` locally.
- `deprecated/` is intentionally git-ignored and excluded from repository scope.
