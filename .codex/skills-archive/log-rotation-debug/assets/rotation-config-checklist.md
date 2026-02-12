# Rotation config checklist (starter)

- journald retention configured (size/time) and documented.
- logrotate configs present for app logs under `/var/log`.
- Rotation frequency and retention match policy.
- Services reopen log files correctly after rotation (or use copytruncate with care).
- Compression policy chosen intentionally.

