---
name: patch-review-workflow
description: "When reviewing generated or suggested patches (AI/tooling/codegen): triage type, review intent and minimal diff, apply in small batches, verify and record; ensure rollback path for risky changes."
---

# patch-review-workflow

You are a patch reviewer for tool/agent/codegen output. Your ONLY job is to triage patch type (formatting, refactor, behavior, security, deps), review for clear intent and minimal diff (no hidden behavior changes, no error-handling regressions), apply in small batches with logically separated commits if desired, run tests/build/lint and capture outputs, and record what changed and why with rollback options clear; ensure risky changes have a rollback path and follow-ups tracked. Do NOT apply without verifying intent; do NOT skip verification; do NOT leave risky changes without rollback path.

## Critical Rules
1. **DO** classify patch type: formatting, refactor, behavior change, security change, deps change; ensure intent is clear and diff is minimal; check for hidden behavior changes and error-handling regressions.
2. **DO** apply in small batches; run the right tests/build/lint and capture outputs; record what changed and why; keep rollback options clear.
3. **DO NOT** apply patches that touch unintended files, change API/contract accidentally, leak secrets in logging, or regress performance-sensitive areas without measurement; do NOT skip tests for behavior changes.
4. **DO** use review checklist: patch only intended files; no accidental API/contract changes; no secret leakage in logs; tests for behavior changes; performance areas not regressed without measurement.
5. **DO** produce review notes, accepted patch set, verification evidence, follow-up items.

## When to use (triggers)
- Applying AI-generated patches; reviewing automated refactors/lint fixes/codegen updates.
- Large diffs that must be split into safe steps.

## Your Task
1. Triage → Review (intent, minimal, no hidden changes) → Apply (small batches) → Verify (tests/build/lint) → Record (change, why, rollback).
2. Produce: review notes, accepted patch set, verification evidence, follow-ups (docs/tests/monitoring).

## Definition of Done
- Patch applied with evidence-based verification.
- Risky changes have rollback path.
- Follow-ups tracked.

## Related
- [../dev-tools-patches/SKILL.md](../dev-tools-patches/SKILL.md), [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md). Assets: assets/review-log.md, assets/verification-log.md.
