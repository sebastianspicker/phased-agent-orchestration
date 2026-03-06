---
name: ar
description: "Run independent specialist reviews in parallel, consolidate findings, and emit a fact-check-ready review report."
---

# /ar - Adversarial Review

## Use this when
- Design is complete and needs independent review before planning.
- The user asks for `/ar`, adversarial review, or design critique.

## Procedure
Read and follow `adapters/claude/skills/orchestration-ar/SKILL.md`.

## Claude Code notes
- Use the Task tool to launch independent reviewer subagents in parallel — each reviewer should have isolated context.
- Reviewers must not see each other's findings until consolidation.
- After consolidation, present findings for human acceptance checkpoint.
- Output artifact: `.pipeline/runs/<run-id>/review.json`
