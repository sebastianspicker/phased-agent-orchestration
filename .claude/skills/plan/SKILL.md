---
name: plan
description: "Convert approved design and review artifacts into implementation-ready, conflict-free task groups with explicit verification."
---

# /plan - Implementation Planning

## Use this when
- Design and adversarial review are approved.
- The user asks for `/plan`, implementation planning, or task breakdown.

## Procedure
Read and follow `adapters/claude/skills/orchestration-plan/SKILL.md`.

## Claude Code notes
- **Model tier: balanced (Sonnet)** — task decomposition is systematic and bounded; Sonnet handles structured partitioning well. `/fast` mode is appropriate.
- Task groups must be conflict-free with clear file ownership boundaries.
- Each task group should include its own verification commands.
- Assign `builder_tier` per task group: `high_reasoning` for groups requiring architectural judgment, `balanced` for structured implementation with reasoning, `fast` for straightforward implementation.
- Output artifact: `.pipeline/runs/<run-id>/plan.json`
