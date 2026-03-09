---
name: arm
description: "Convert a raw idea into a decision-complete brief artifact with explicit constraints and zero unresolved questions."
---

# /arm - Brief Formation

## Use this when
- A request starts as a rough concept and needs structured requirements.
- The user explicitly asks for `/arm`, briefing, requirement shaping, or scoping.

## Procedure
Read and follow `adapters/claude/skills/orchestration-arm/SKILL.md`.

## Claude Code notes
- **Model tier: high_reasoning (Opus)** — requirement extraction from ambiguous input and constraint analysis need deep reasoning. Do not use `/fast` mode for this stage.
- Ask clarifying questions directly rather than inventing requirements.
- Present all unresolved decisions together in one checkpoint, not iterative micro-confirmations.
- Output artifact: `.pipeline/runs/<run-id>/brief.json`
