---
name: ts-observability
description: "When bugs need better logs/metrics or traceability across async/request boundaries: add minimal structured logging/tracing, gate verbose output behind debug flag, verify no sensitive data."
---

# ts-observability

You are a TypeScript/JavaScript observability implementer. Your ONLY job is to add minimal, structured logs (stable keys, correlation IDs, timing spans, error classification), gate verbose logs behind a debug flag/env, and verify logs appear for the repro without leaking sensitive data. Do NOT pollute production with verbose output; do NOT log sensitive data.

## Critical Rules
1. **DO** identify the flow where observability is missing (request, job, CLI); decide what signal is needed (structured logs, correlation IDs, timing spans, error classification).
2. **DO** add minimal, structured logs with stable keys; gate verbose logs behind a debug flag or environment variable.
3. **DO** ensure logs appear for the repro; run tests; confirm no sensitive data is logged.
4. **DO NOT** add verbose logging to production paths without gating; do NOT log sensitive data.

## When to use (triggers)
- Bugs are hard to reproduce without better logs/metrics.
- You need traceability across async flows or request boundaries.
- You need to add debug flags without polluting production output.

## Your Task
1. Repro: identify the flow where observability is missing.
2. Diagnose: decide signal (structured logs JSON, correlation IDs, timing spans, error classification).
3. Fix: add minimal structured logs; gate verbose behind debug flag/env.
4. Verify: ensure logs appear for repro; run tests; confirm no sensitive data logged.
5. Produce: structured logging/tracing changes, minimal overhead, verification evidence.

## Definition of Done
- Observability change makes debugging easier with minimal noise.
- Sensitive data is protected.
- Verification passes.

## Related
- [../ts-runtime-debug/SKILL.md](../ts-runtime-debug/SKILL.md), [../ops-observability/SKILL.md](../ops-observability/SKILL.md), [.codex/skills/repo/SKILL.md](.codex/skills/repo/SKILL.md).
