# Skill naming and organization (guidelines)

This repo keeps skills in a flat directory (`.codex/skills/<skill-name>/`) to match AgentSkills conventions.
To keep the index readable, we use **prefixes** to group by topic.

## Prefix conventions
- `core-*`: cross-cutting engineering guardrails (debugging, TDD, verification)
- `ts-*`, `ps-*`, `py-*`, `sh-*`: language workflows
- `docker-*`: containers and builds
- `k8s-*`: Kubernetes
- `pve-*`: Proxmox VE (hypervisor, storage, backups)
- `debian-*`: Debian host operations
- `network-*`: networking operations and policy
- `vpn-*`: remote access / VPN operations and policy
- `reverse-proxy-*`: edge proxies
- `ops-*`: operational workflows (incident response, postmortems, observability)
- `security-*`: security-focused workflows (secrets, audits, hardening)
- `perf-*`: performance-focused workflows (load testing, profiling)

## Naming rules
- Prefer action/workflow names: `*-debug`, `*-workflow`, `*-ops`, `*-baseline`, `*-maintenance`.
- Avoid tool/provider lock-in in the name unless it’s essential (e.g., `reverse-proxy-nginx` is tool-specific on purpose).
- Keep names short and specific; avoid “general” duplicates when a specific prefix exists.

## Dedupe approach
- Prefer linking to an existing skill in “Related skills” instead of copying large blocks of text.
- If two skills share a workflow core, keep the core in one skill and make the other focus on domain-specific deltas.

## Generalized skills with configurations
- **One skill per workflow type** (e.g. `language-debug`, `language-quality`, `language-implement`, `language-refactor`, `language-testing`): the SKILL.md holds the shared workflow and a **Configurations** section (table or subsections) listing variants (e.g. TypeScript/JavaScript, Python, PowerShell, Shell) with triggers, verification, and optional toolbox per variant.
- Language-specific entries (`ts-debug`, `py-debug`, etc.) are **redirects**: they point at the generalized skill and state which configuration to use; they keep existing links and search terms valid.
- Before adding a new `ts-*` / `py-*` / `ps-*` / `sh-*` skill: check whether it fits as a new **configuration** in an existing generalized skill (e.g. a new row in the Configurations table) instead of a separate skill.
