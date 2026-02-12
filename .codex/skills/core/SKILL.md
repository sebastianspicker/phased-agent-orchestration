---
name: core
description: "Core engineering guardrails. Use when debugging (root-cause-first), implementing with TDD (red-green-refactor), or verifying work before claiming done. Choose configuration from user prompt."
---

# core (Playbook)

Cross-cutting workflows for debugging, TDD, and verification. **Choose one configuration** based on the user prompt.

## When to use (triggers)
- User mentions debugging, root cause, repro, fix with evidence → configuration **debug-root-cause**.
- User mentions TDD, red-green-refactor, feature/bugfix with tests → configuration **tdd-red-green**.
- User mentions verify before claim, evidence, proof, done → configuration **verify-before-claim**.

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| debug, root cause, repro, hypothesis, minimal fix, evidence | debug-root-cause |
| TDD, red-green, refactor, regression test, feature/bugfix | tdd-red-green |
| verify, evidence, proof, done, tests pass, build works | verify-before-claim |

## Configurations

### debug-root-cause
Use when debugging any technical issue with a root-cause-first approach. **Step sequence:** Investigate (repro, smallest failing unit) → Hypothesize (“X causes Y because Z”) → Test (one variable) → Fix (at source, minimal) → Verify (re-run repro + gates). **Hard rules:** No stacking speculative fixes; no refactor while debugging; remove temporary debug output. **Evidence:** One-command repro; log boundaries; if regression and deterministic, use git bisect. Definition of Done: root cause evidenced, fix minimal, verification run. For bisect or derive verify commands, use repo skill (config bisect-regressions / run-commands).

### tdd-red-green
Use when implementing features/bugfixes with a Red-Green-Refactor loop. **Step sequence:** Red (smallest failing test, confirm it fails for right reason) → Green (minimum change to pass) → Refactor (clean up, same behavior) → Verify (broader suite). **Rules:** If you didn’t see the test fail, you don’t know what it proves; prefer real code paths over mocks. Legacy/no tests: write characterization test first, then refactor. Definition of Done: Red/Green cycle followed, refactor keeps tests green, broader gates pass.

### verify-before-claim
Use before claiming work is done. **Gate workflow:** Identify (commands that prove the claim) → Run (fresh) → Read (exit codes, hidden failures) → Report (what you ran, result). **Claims → evidence:** “Tests pass” → run repo test commands; “Build works” → build/typecheck; “Bug fixed” → re-run repro + regression test. Definition of Done: commands documented and run, results recorded.
