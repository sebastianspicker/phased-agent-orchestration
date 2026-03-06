---
name: build
description: "Coordinate parallel builder subagents under strict context scoping and verify plan conformance after implementation."
---

# /build - Coordinated Parallel Implementation

## Use this when
- Plan and drift checks are complete.
- The user requests `/build` or implementation start.

## Procedure
Read and follow `adapters/claude/skills/orchestration-build/SKILL.md`.

## Claude Code notes
- Use the Task tool with `isolation: "worktree"` for builder subagents — each builder gets an isolated repo copy with only its scoped work package context.
- Lead coordinates and validates; lead does not author production code.
- Builders must not see other task groups or other builders' outputs.
- After all builders complete, run `/pmatch` for plan conformance.
- Output artifact: `.pipeline/runs/<run-id>/gates/build-gate.json`
