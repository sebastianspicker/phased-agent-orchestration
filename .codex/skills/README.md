# Codex Playbook Skills

This directory contains the **orchestration playbook**: a quality-gated pipeline from idea to shipped code.

## Entry points
- Repo guide + verification rules: [AGENTS.md](../../AGENTS.md)

## Validation
- Local check: `python3 scripts/codex/validate_skills.py`

## Types (1)

| Type | Description | Configurations |
|------|-------------|----------------|
| [orchestration](orchestration/SKILL.md) | Multi-phase AI pipeline: Intake, Design Synthesis, Adversarial Challenge, Execution Blueprint, Drift Match, Coordinated Build, static/test gates, post-build quality, release-readiness, mandatory security audit+fix loops | arm, design, adversarial-review, plan, pmatch, build, quality-static, quality-tests, denoise, quality-frontend, quality-backend, quality-docs, security-review, release-readiness, pipeline |

## How to use
Open `orchestration/SKILL.md`. Use the "Choosing configuration from user prompt" table to pick the right configuration, then follow its steps.

## Archive
- Retired and legacy skill material is kept in `deprecated/` locally.
- `deprecated/` is intentionally git-ignored and excluded from repository scope.
