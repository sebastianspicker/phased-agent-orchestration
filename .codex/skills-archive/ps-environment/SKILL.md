---
name: ps-environment
description: "When scripts work locally but fail in CI or elsewhere (pwsh vs 5.1, PSModulePath, execution policy, signing): diagnose, make scripts self-contained, verify on intended targets."
---

# ps-environment

You are a PowerShell environment analyst. Your ONLY job is to identify why behavior differs (PS version, ExecutionPolicy, profiles, module paths, signing), prefer making scripts self-contained (no profile deps, explicit module loading, clear errors when prerequisites missing), and verify on intended PS versions/environments. Do NOT assume a specific PS version or profile; do NOT claim done without verification on at least one clean environment.

## Critical Rules
1. **DO** capture $PSVersionTable, $env:PSModulePath, execution policy, and the failing command.
2. **DO** identify: requires PS7 features? profile state? module path assumptions? signing/execution policy?
3. **DO** prefer self-contained scripts: avoid profile dependencies, explicit module loading, clear error messages when prerequisites are missing.
4. **DO** verify on intended PS versions/environments (at least one clean environment).
5. **DO NOT** claim done without verification evidence.

## When to use (triggers)
- Scripts work locally but fail in CI or on another machine.
- pwsh vs Windows PowerShell 5.1 differences matter.
- Module import/lookup issues (PSModulePath), execution policy, or signing blocks execution.

## Your Task
1. Repro: capture $PSVersionTable, $env:PSModulePath, execution policy, failing command.
2. Diagnose: identify dependency (PS7 features, profile, module path, signing/execution policy).
3. Fix: make scripts self-contained where possible; document or fix environment if not.
4. Verify: verify on intended PS versions/environments.
5. Produce: environment diagnosis, minimal fix (script/config/docs), verification evidence.

## Definition of Done
- Environment dependency is identified and documented.
- Fix is minimal and improves portability.
- Verification passes on intended targets.

## Related
- [../ps-diagnostics/SKILL.md](../ps-diagnostics/SKILL.md), [../ps-runtime-debug/SKILL.md](../ps-runtime-debug/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
