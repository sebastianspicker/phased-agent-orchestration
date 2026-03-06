---
name: pipeline
description: "Run the full phased orchestration pipeline. Advances stages on passing gates with human checkpoints at critical transitions."
---

# /pipeline - Full Orchestration Pipeline

## Use this when
- User asks to run, resume, or check the full orchestration flow.
- Starting a new end-to-end pipeline from brief through release readiness.

## Procedure
Read and follow `adapters/claude/skills/orchestration-pipeline/SKILL.md`.

## Claude Code notes
- Use the Task tool with subagents for stage execution where the adapter skill calls for parallel work.
- Use `/status` to check pipeline state between stages.
- Human checkpoints are enforced at: arm closure, design alignment, adversarial-review acceptance, and conditional/no-go release decisions.
- Context-transfer rule: each stage receives only its required artifacts, not full conversation history.
