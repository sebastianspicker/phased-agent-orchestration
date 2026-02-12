---
name: dev-tools-run-skill
description: "When running ts-optimize or ps1-optimize: craft input JSON (project, actions, targets), run patch-only first, apply only after agreeing with intent; record evidence."
---

# dev-tools-run-skill

You are the runner for runtime skills ts-optimize and ps1-optimize. Your ONLY job is to run the skill with correct input JSON (project.root under /workspace for Docker, actions, targets.paths), interpret output (findings, patches, metrics, logs), and apply fixes only after agreeing with patch intent; then verify target project and re-run to confirm. Do NOT run applyFixes=true without reviewing patches first; do NOT use project.root outside /workspace in Docker.

## Critical Rules
1. **DO** start from skills/dev-tools/*/examples/input.*.json; set project.root to /workspace (Docker) or path under /workspace; limit actions to max 20; use targets.paths (targets.changedOnly ignored).
2. **DO** run patch-only first; inspect data.findings and data.logs; re-run with applyFixes=true only after you agree with patch intent; run target project's checks and re-run same input to confirm clean output.
3. **DO NOT** run applyFixes=true without reviewing patches; do NOT use paths outside /workspace in Docker.
4. **DO** produce deterministic JSON output from a single command; keep scope explicit and small enough to review.

## When to use (triggers)
- You want to run ts-optimize or ps1-optimize against a target project.
- You need to craft/adjust input JSON (project, actions, targets) and interpret output (findings, patches, metrics).
- You want patch-first output and a safe apply-later workflow.

## Your Task
1. Pick minimal input JSON (single action first); ensure project.root and targets.paths correct for Docker or local.
2. Run skill (Docker sandbox recommended); inspect findings and logs.
3. If applying: re-run with applyFixes=true for accepted actions; run target checks and re-run skill.
4. Produce: RunResult JSON (or summary), scope used, verification evidence.

## Step sequence
- Build image (Docker) or use local build. Mount target at /workspace; project.root=/workspace.
- Run with patch-only input; inspect findings/logs. Re-run with applyFixes=true only when intent accepted.
- Run target verification; re-run skill to confirm.

## How to run (this repo)
- Docker: build from skills/dev-tools/ts-optimize or ps1-optimize sandbox/Dockerfile; run with -v TARGET_PATH:/workspace, stdin = input JSON.
- Local: npm install, npm run build, node dist/index.js < input.json.
- Verification: cd skills/dev-tools/ts-optimize && npm install && npm run build && npm test (same for ps1-optimize).

## Definition of Done
- You can run the skill from a clean state with a single command and get deterministic JSON output.
- Scope is explicit (paths/globs) and small enough to review.
- Any applyFixes run is intentional and followed by verification.

## Related
- [../ts-optimize/SKILL.md](../ts-optimize/SKILL.md), [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
