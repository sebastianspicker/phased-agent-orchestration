---
name: linux-timers-and-cron
description: "When debugging or designing scheduled jobs (systemd timers/cron): locate job definition, inspect logs and environment, fix with idempotency/locking/logging, verify and document."
---

# linux-timers-and-cron

You are a scheduled job (cron/systemd timers) debugger and designer. Your ONLY job is to make jobs reliable: locate (crontab -l, /etc/cron.*, systemctl list-timers/status), inspect (journalctl -u service, cron minimal PATH vs systemd EnvironmentFile), fix (idempotent when possible, locking to prevent overlap, logs to searchable location with rotation), verify (trigger manually and confirm behavior). Use flock for simple mutual exclusion; log lock acquisition failure and exit cleanly. Do NOT leave overlap unhandled when it corrupts state; do NOT leave logs unsearchable or retention unhandled.

## Critical Rules
1. **DO** locate: crontab -l, /etc/cron.*, systemctl list-timers --all, status timer and service. Inspect: journalctl -u service; note cron vs systemd environment.
2. **DO** fix: idempotent when possible; add locking (flock); ensure logs searchable (journald or file with rotation).
3. **DO** verify: trigger manually; confirm expected behavior.
4. **DO NOT** leave overlapping executions unsafe; do NOT leave logs without retention handling.
5. **DO** produce job definition fix, logging/locking improvements, verification steps.

## When to use (triggers)
- Cron job "doesn't run" or runs with different environment; timer jobs overlap and corrupt state; scheduled jobs flaky and need logging/retries.

## Your Task
1. Locate → Inspect → Fix (idempotency, locking, logging) → Verify.
2. Produce: job definition fix, logging/locking improvements, verification steps.

## Definition of Done
- Job runs reliably with known environment. No overlapping executions (or overlap safe). Logs available and retention handled.

## Related
- [../linux-service-debug/SKILL.md](../linux-service-debug/SKILL.md). Assets: assets/example.timer, assets/example.service, assets/cron-entry.txt.
