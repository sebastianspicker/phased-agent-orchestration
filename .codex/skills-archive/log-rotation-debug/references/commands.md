# Log rotation/debug command snippets (Debian/Linux)

- Disk usage:
  - `df -h`
  - `du -xhd1 /var/log | sort -h`
- journald:
  - `journalctl --disk-usage`
  - `journalctl --since "1 hour ago" | tail`
- logrotate:
  - `logrotate --debug /etc/logrotate.conf`
  - `logrotate --force /etc/logrotate.conf` (use with care; document)

