# Codex Playbook Skills

This directory contains **type-based playbooks**: one folder per type, one `SKILL.md` per type. Each skill describes how to **choose a configuration from the user prompt** (keywords/themes → config) and lists all configurations (compact in SKILL.md or in `config/<name>.md`).

They complement (and do not replace) the **runtime skills** under `skills/dev-tools/*`.

Only the contents of **`.codex/skills/`** are documented here. Other siblings under `.codex/` (e.g. audit or tooling) are out of scope for this index.

## Entry points
- Repo guide + verification rules: [AGENTS.md](../../AGENTS.md)
- Human index for dev-tools: [agents/dev-tools/README.md](../../agents/dev-tools/README.md)
- Naming conventions: [NAMING.md](NAMING.md)

## Validation
- Local check: `python3 scripts/codex/validate_skills.py`

## Types (15)

| Type | Description | Example configurations |
|------|-------------|------------------------|
| [core](core/SKILL.md) | Debug (root-cause), TDD (red-green), verify-before-claim | debug-root-cause, tdd-red-green, verify-before-claim |
| [repo](repo/SKILL.md) | Tool definitions, contracts, CI, bisect, dev-tools, release | tool-definitions, contracts, run-commands, bisect-regressions, dev-tools-run-skill, git-pr, ci-triage, patch-review, cicd-release, … |
| [code](code/SKILL.md) | TS/Py/PS/Sh: debug, implement, quality, refactor, testing, lint, codegen, … | debug, implement, quality, refactor, testing, lint, perf, arch, … (× language) |
| [containers](containers/SKILL.md) | Docker/Compose debug, Dockerfile, image size, networking, security scans | debug, dockerfile-hardening, image-size-perf, compose-production, networking-debug, security-scans |
| [k8s](k8s/SKILL.md) | Kubernetes debug, deploy, networking, storage, observability, Helm, Kustomize | debug, deploy, networking, storage, observability, security-baseline, helm, kustomize |
| [pve](pve/SKILL.md) | Proxmox VE ops, networking, ZFS/Ceph, backup, PBS, templates, security | basics, networking, storage-zfs, storage-ceph, backup-restore, pbs-ops, vm-templates, security-baseline |
| [host](host/SKILL.md) | Debian/Linux: ops, package debug, kernel/boot, web stack, service/network/storage/TLS, timers, log rotation | debian-ops, debian-package-debug, linux-service-debug, linux-network, linux-storage, linux-tls, log-rotation, … |
| [network](network/SKILL.md) | Network debug, testing, DNS, firewall, VPN (WireGuard, OpenVPN, policy) | debug, testing, dns-ops, security-baseline, firewall-review, vpn-wireguard, vpn-openvpn |
| [edge](edge/SKILL.md) | Reverse proxy (generic, Nginx, Caddy, Traefik), auth, TLS/ACME | reverse-proxy, nginx, caddy, traefik, auth, tls-acme |
| [ops](ops/SKILL.md) | Postgres, Redis, load testing, observability, incident, postmortem, secrets | postgres, redis, perf-load-testing, observability, incident-response, postmortem, secrets-hygiene |
| [security](security/SKILL.md) | Audit, secure-implement, web audit, threat modeling, incident, supply chain, authn/authz, WAF | audit, secure-implement, web-audit, threat-modeling, supply-chain, authn-authz, waf |
| [frontend](frontend/SKILL.md) | React, Next.js App Router, Expo Router, Playwright | react, next-app-router, expo-router, playwright |
| [research](research/SKILL.md) | Reverse-spec, academic research, paper/latex, astro-*, exoplanet/eclipsing-binary, teaching, phyphox, runbook, docs | reverse-spec, academic-research, paper-writing, latex, astro-*, classroom-data, docs-coauthoring, … |
| [music](music/SKILL.md) | Sonic Pi, Pure Data, Tone.js, web audio, audio DSP/features, lab design, submission eval | sonic-pi-livecoding, sonic-pi-snippets, pure-data, pd-audio-routing, tonejs, web-audio-debug, lab-design, submission-eval |
| [llm](llm/SKILL.md) | Prompts, eval harness, RAG, local LLM ops, prompt-injection defense, production evals | prompt-workflow, eval-harness, rag, local-ops, prompt-injection-defense, local-evals-prod |

## How to use
- **From a user prompt:** Pick the type that matches the task (e.g. repo, code, k8s). Open that type’s `SKILL.md`. Use the “Choosing configuration from user prompt” section (table or logic) to choose the configuration, then follow that configuration’s steps (in SKILL.md or in `config/<name>.md`).

## Archive
- Previous per-skill folders are under `.codex/skills-archive/` for reference.
