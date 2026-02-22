# Platform / adapter notes

This repo is split into a **platform-agnostic core** and optional **platform adapters**.

## Core (platform-agnostic)

The core is designed to work in any environment that can read/write files and run shell commands:

- Contracts: `contracts/` (JSON Schemas for artifacts and quality gates)
- Orchestration playbook: `.codex/skills/orchestration/SKILL.md`
- Runtime skills (no paid model APIs): `skills/dev-tools/*` (`quality-gate`, `multi-model-review`, `trace-collector`)
- Run state scaffolding: `scripts/pipeline-init.sh` + `.pipeline/` (gitignored)

Canonical top-level stage order:

`arm -> design -> adversarial-review -> plan -> pmatch -> build -> quality-static -> quality-tests -> post-build -> release-readiness`

## Adapters (platform-specific)

Adapters translate the playbook into the primitives of a specific IDE/runner.

- Cursor adapter skills live under `.cursor/skills/` and use Cursor-native concepts like Task subagents and `subagent_type`.

You can add additional adapters (e.g. for Claude Code agent teams, a custom MCP runner, etc.) without changing the core.

## Minimum platform capabilities

To run the pipeline as intended, a platform/runner should support:

- **Scoped contexts** per phase/worker (no implicit cross-talk)
- **Parallel workers/reviewers** (at least 3 reviewers for adversarial-review, N builders for build)
- **Filesystem access** (read codebase; write `.pipeline/runs/<run-id>/...` artifacts)
- **Live documentation/search grounding** (via MCP or equivalent; Context7 is one example)
