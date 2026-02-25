# Platform / adapter notes

This repo is split into a **platform-agnostic core** and optional **platform adapters**.

## Core (platform-agnostic)

The core is designed to work in any environment that can read/write files and run shell commands:

- Contracts: `contracts/` (JSON Schemas for artifacts and quality gates)
- Orchestration playbook (legacy compatibility): `.codex/skills/orchestration/SKILL.md`
- Runtime skills (no paid model APIs): `skills/dev-tools/*` (`quality-gate`, `multi-model-review`, `trace-collector`)
- Run state scaffolding: `scripts/pipeline-init.sh` + `.pipeline/` (gitignored)

Canonical top-level stage order:

`arm -> design -> adversarial-review -> plan -> pmatch -> build -> quality-static -> quality-tests -> post-build -> release-readiness`

## Adapters (platform-specific)

Adapters translate the playbook into the primitives of a specific IDE/runner.

- Canonical adapter root: `adapters/<runner>/skills/`
- Source-of-truth mapping and invariants: `adapters/spec/adapter-manifest.json`
- Canonical templates: `adapters/templates/`
- Generator + sync-check: `scripts/adapters/generate_adapters.py` (`--check` mode in CI/verify)
- Supported runners: `codex`, `cursor`, `claude`, `gemini`, `kilo`
- Legacy paths `.codex/` and `.cursor/` are compatibility shims; treat `adapters/` as authoritative.

## Verification modes

- Full verification: `./scripts/verify.sh`
- Diff-aware fast verification: `./scripts/verify.sh --changed-only [--changed-base <git-ref>]`
- Markdown integrity check (also part of verify): `python3 scripts/check-markdown-links.py --root "$(pwd)"`

## Minimum platform capabilities

To run the pipeline as intended, a platform/runner should support:

- **Scoped contexts** per phase/worker (no implicit cross-talk)
- **Parallel workers/reviewers** (at least 3 reviewers for adversarial-review, N builders for build)
- **Filesystem access** (read codebase; write `.pipeline/runs/<run-id>/...` artifacts)
- **Live documentation/search grounding** (via MCP or equivalent; Context7 is one example)
