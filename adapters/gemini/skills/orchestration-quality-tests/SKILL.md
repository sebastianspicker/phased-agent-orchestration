---
name: orchestration-quality-tests
description: "Gemini adapter for /quality-tests. Runs predeclared test commands as a dedicated gate before post-build audits."
---

# /quality-tests - Test Quality Gate (Gemini Adapter)

## Use this when
- `quality-static` gate has passed.
- The user requests dedicated test validation or test-gate execution.

## Model tier
Use fast worker models for test execution and report assembly.

## Semantic intent
- Predeclared verification: execute the tests defined in planning/verification commands.
- Separation of duties: test validation runs independently from build implementation.

## Input
- Changed implementation files
- `.pipeline/runs/<run-id>/plan.json`

## Procedure

### 1. Execute test commands
Run test commands for relevant packages/components and collect:
- exit status,
- execution duration,
- failing test identifiers,
- reproduction command.

### 2. Build quality report
Write quality report artifact (`audit_type: tests`) to:
- `.pipeline/runs/<run-id>/quality-reports/tests.json`

### 3. Gate evaluation
Require:
- all required test commands exit 0,
- no critical/high unresolved test-related violations in report,
- report conforms to `contracts/artifacts/quality-report.schema.json`.

Write gate output to:
- `.pipeline/runs/<run-id>/gates/quality-tests-gate.json`

## Non-negotiables
- Test failures block progression.
- Skipped tests must be explicitly justified and approved.
