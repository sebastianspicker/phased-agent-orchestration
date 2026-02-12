# Safe cleanup plan (template)

## Goal
- Free space target:

## Candidate actions (ordered safest first)
1) Vacuum journald to a safe target (documented).
2) Truncate very large logs that are safe to truncate (document which).
3) Remove old rotated logs beyond retention (if policy allows).

## Risks
- What evidence may be lost?
- How will we preserve critical logs?

## Verification
- Services recover:
- Disk usage drops:
- Rotation fixed:

