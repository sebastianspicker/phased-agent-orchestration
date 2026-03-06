Report the current pipeline status.

Read `.pipeline/pipeline-state.json` and summarize:
- Current phase and status
- Completed gates with pass/fail counts
- Pending stages
- Any blocked or failed stages with reasons

If `.pipeline/pipeline-state.json` does not exist, inform the user that no pipeline run is active and suggest running `/init-pipeline`.
