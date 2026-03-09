---
name: design
description: "Produce a first-principles design document from a validated brief with evidence-backed research and repository alignment."
---

# /design - Design from Brief

## Use this when
- The brief (`arm` stage) is complete and approved.
- The user asks for `/design`, architecture, or design exploration.

## Procedure
Read and follow `adapters/claude/skills/orchestration-design/SKILL.md`.

## Claude Code notes
- **Model tier: balanced (Sonnet)** — architecture design follows structured templates with evidence grounding. Sonnet provides sufficient reasoning at lower cost; `/fast` mode is appropriate.
- Use the Task tool with Explore subagents for codebase research to ground design in actual repo structure.
- Design decisions must reference evidence, not assumptions.
- Output artifact: `.pipeline/runs/<run-id>/design.json`
