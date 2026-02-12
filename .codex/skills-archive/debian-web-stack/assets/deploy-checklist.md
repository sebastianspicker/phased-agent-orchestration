# Debian web service deploy checklist (template)

- Code deployed to expected directory.
- Config/env file updated (no secrets in logs).
- systemd unit validated and reloaded.
- Reverse proxy config validated and reloaded.
- Smoke test performed (curl).
- Rollback path confirmed (previous release + config).

