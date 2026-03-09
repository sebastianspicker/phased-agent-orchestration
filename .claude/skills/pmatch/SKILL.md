---
name: pmatch
description: "Run dual independent claim extraction and adjudicate drift between plan and implementation before allowing progression."
---

# /pmatch - Plan Conformance Check

## Use this when
- Build is complete and plan conformance needs verification.
- The user asks for `/pmatch`, drift check, or plan-vs-implementation comparison.

## Procedure
Read and follow `adapters/claude/skills/orchestration-pmatch/SKILL.md`.

## Claude Code notes
- **Model tiers: Extractor subagents use fast (Haiku) for independent claim extraction; lead uses balanced (Sonnet) for adjudication and conflict resolution.** Sonnet handles structured claim comparison well; Opus is not needed here. `/fast` mode is appropriate for the lead.
- Uses dual independent extraction: two separate passes extract claims, then adjudicates disagreements.
- High-severity drift blocks progression; low-severity drift is logged as advisory.
- Output artifact: `.pipeline/runs/<run-id>/pmatch.json`
