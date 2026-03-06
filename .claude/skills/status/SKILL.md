---
name: status
description: "Report current pipeline state including phase, completed gates, and any blocked or failed stages."
---

# /status - Pipeline Status

## Use this when
- Checking progress of an active pipeline run.
- The user asks for `/status`, pipeline state, or progress check.

## Procedure

1. Read `.pipeline/pipeline-state.json`.
2. Summarize:
   - Current phase and status
   - Completed gates with pass/fail counts
   - Pending stages
   - Any blocked or failed stages with reasons
3. If no pipeline state file exists, inform the user and suggest running `/init-pipeline`.
