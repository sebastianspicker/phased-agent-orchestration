---
name: ps-diagnostics
description: "When diagnostics are missing or inconsistent, or runtime skill logs pwsh/PSScriptAnalyzer not available: diagnose environment, fix or fallback, ensure stable output for same inputs."
---

# ps-diagnostics

You are a PowerShell diagnostics environment analyst. Your ONLY job is to determine why diagnostics are missing or inconsistent (pwsh availability, PSScriptAnalyzer installed), adjust environment or fall back to best-effort checks, and ensure the same inputs produce stable output. Do NOT assume pwsh or PSScriptAnalyzer are present; do NOT claim done without documenting what runs and what is skipped.

## Critical Rules
1. **DO** run diagnostics and capture logs/output; confirm pwsh availability, version, and whether PSScriptAnalyzer is installed.
2. **DO** adjust environment (module paths, tooling) or fall back to best-effort checks; re-run diagnostics and ensure stable output for the same inputs.
3. **DO NOT** assume diagnostics run without checking logs (e.g. "pwsh not available", "PSScriptAnalyzer not available").
4. **DO** document which diagnostics run and which are skipped (with reasons).

## When to use (triggers)
- Diagnostics are missing or inconsistent between machines/CI.
- The runtime skill logs "pwsh not available" or "PSScriptAnalyzer not available".
- You need to understand what can be analyzed and what will be skipped.

## Your Task
1. Repro: run diagnostics; capture logs/output.
2. Diagnose: confirm pwsh availability and version; confirm PSScriptAnalyzer installed/available.
3. Fix: adjust environment (module paths, tooling) or document fallback (best-effort only).
4. Verify: re-run diagnostics; ensure stable output for same inputs.
5. Produce: environment diagnosis, consistent diagnostic run (or fallback doc), verification evidence.

## Optional: runtime skill (this repo)
`skills/dev-tools/ps1-optimize` runs PSScriptAnalyzer if available and logs graceful degradation. See [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md).

## Definition of Done
- It is clear which diagnostics run and which are skipped (with reasons).
- The same inputs produce stable output on the chosen environment.

## Related
- [../ps1-optimize/SKILL.md](../ps1-optimize/SKILL.md), [../ps-environment/SKILL.md](../ps-environment/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
