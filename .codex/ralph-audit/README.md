# Ralph Audit Loop (OpenAI Codex) — coding-agents-space

This directory contains a **tailored** Ralph audit loop for **coding-agents-space**. It runs a long-lived, autonomous, **read-only** code audit: the agent documents problems and writes markdown reports under `audit/*.md`; it does not modify the repo.

## Analysis Summary (This Repo)

**Repository type:** Monorepo for AI coding agent tooling (runtime skills + playbook skills + contracts + agent-config).

**Stack:**
- **Runtime skills:** Node.js 20+, TypeScript, Vitest. Two packages: `skills/dev-tools/ts-optimize` (TypeScript/JS optimizer) and `skills/dev-tools/ps1-optimize` (PowerShell optimizer). Each has `manifest.yaml`, JSON schemas (input/output), sandbox (Dockerfile, permissions.yaml), and unit/integration tests.
- **Contracts:** Shared JSON Schema under `contracts/` (skill-manifest, tool-definition, run-result, permissions). Skill-specific schemas under `skills/dev-tools/*/schemas/`.
- **Playbook skills:** `.codex/skills/` — 15 type folders (core, repo, code, containers, k8s, pve, host, network, edge, ops, security, frontend, research, music, llm), each with one `SKILL.md` and prompt→config tables.
- **Agent config:** `agent-config/tool-definitions/tools.generated.json` with `$ref` to skill input schemas; `agent-config/constraints.yaml`.
- **Scripts & CI:** `scripts/verify.sh`, `scripts/codex/validate_skills.py` (Python), `.github/workflows/ci.yml` (Node 20, npm cache, verify.sh).
- **No:** React/Next.js app, Supabase/Postgres, Stripe, user auth, or payment flows.

**Audit focus:** Contract/schema consistency, runtime skill I/O and sandbox safety, playbook skill frontmatter and refs, tool-definition wiring, scripts and CI correctness, dead code and error handling in TS, examples/fixtures validity. Priority order: contracts & runtime behavior > sandbox safety > config & docs > tests & slop.

---

## What’s Different Here (The Codex Part)

The loop runs with **Codex** in **read-only** mode (`-s read-only`). Each iteration:

- Picks the next story in `prd.json` where `passes: false`
- Builds a prompt from that story plus `CODEX.md`
- Runs `codex exec` in read-only mode
- Optionally enables web research with `--search`
- Writes the model’s final message to the audit file declared in the story’s acceptance criteria (e.g. `Created .codex/ralph-audit/audit/01-contracts.md ...`)
- Marks the story passed and continues

## Prerequisites

- **codex** CLI on your PATH and authenticated
- **jq** (used to read/update `prd.json`)
- Bash

## Setup Instructions

1. **Install and authenticate Codex**
   - Ensure `codex` is on your PATH.
   - Authenticate (e.g. `codex login` or `printenv OPENAI_API_KEY | codex login --with-api-key`).

2. **Check jq**
   ```bash
   jq --version
   ```
   If missing: macOS `brew install jq`; Linux `apt install jq` or equivalent.

3. **Optional: environment**
   - If you use `OPENAI_API_KEY` or `CODEX_*` in your shell, the script does not log them. For extra caution on shared machines, run the loop in a clean env or avoid exporting long-lived secrets.

4. **macOS vs Linux**
   - `ralph.sh` uses `sed -i ''` (macOS). On Linux, change to `sed -i` (no space after `-i`) where the script updates `progress.txt` (see inline comment in script if added, or adjust the `sed` line in `mark_progress_checked`).

5. **Model and reasoning**
   - The script is pinned to a specific model and reasoning effort (see `REQUESTED_MODEL`, `REASONING_EFFORT` in `ralph.sh`). To use different values, edit those variables or unset `CODEX_MODEL` / `CODEX_REASONING_EFFORT` if the script allows override.

## How to Run

From the repo root or from this directory:

```bash
cd .codex/ralph-audit
./ralph.sh 20
```

With web research disabled:

```bash
./ralph.sh 20 --no-search
```

Reports are written to `.codex/ralph-audit/audit/*.md`. The PRD’s acceptance criteria define the exact filenames (e.g. `01-contracts.md`, `02-ts-optimize.md`, …).

## Logs / Tailing

- High-level progress: `events.log`
- Full Codex output: `run.log`

```bash
tail -n 200 -f .codex/ralph-audit/events.log
tail -n 200 -f .codex/ralph-audit/run.log
```

## Output

- **Audit reports:** `.codex/ralph-audit/audit/01-contracts.md` … `16` (and `00-INDEX.md` from the final consolidation story).
- **Progress:** `progress.txt` checkboxes are updated as stories complete.

## Customize

- **prd.json** — Edit user stories to add/remove audit areas or change paths for this repo.
- **CODEX.md** — Adjust safety notice, web research policy, or problem categories.
- **ralph.sh** — Change `REQUESTED_MODEL`, `REASONING_EFFORT`, or `sed` for your OS.

## Files in This Directory

| File        | Purpose |
|------------|---------|
| `prd.json` | Product Requirements Document: 16 audit stories for coding-agents-space (contracts, ts/ps1-optimize, agent-config, playbook skills, scripts, sandbox, tests, manifests, docs, types, error handling, dead code, examples, ralph self-audit, index). |
| `CODEX.md` | System instructions for the auditor: read-only, no fixes, severity levels, output format, domain-specific checks (schema drift, sandbox safety, tool defs, playbook frontmatter). |
| `ralph.sh` | Bash loop: picks next story, runs Codex read-only, persists report, marks story passed. |
| `progress.txt` | Human-readable checklist of audit tasks. |
| `audit/`    | Created by the script; holds `00-INDEX.md` and `01-…` through `16-…` markdown reports. |
