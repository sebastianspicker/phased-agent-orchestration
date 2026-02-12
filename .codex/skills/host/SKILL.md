---
name: host
description: "Host/Linux playbook. Use when operating Debian (ops, package debug, kernel/boot, web stack), debugging Linux services/network/storage/TLS, security baseline, timers/cron, or log rotation. Choose configuration from user prompt."
---

# host (Playbook)

Linux/Debian host operations and debugging. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Debian ops baseline (apt, unattended-upgrades, journald) → **debian-ops**
- apt/dpkg broken, half-configured → **debian-package-debug**
- Boot failure, GRUB, initramfs → **debian-kernel-boot**
- Web service on Debian (systemd, reverse proxy) → **debian-web-stack**
- systemd service, journald, ports → **linux-service-debug**
- DNS, routing, firewall, MTU → **linux-network**
- disk, inode, mounts, permissions → **linux-storage**
- TLS cert, chain, SNI, trust → **linux-tls**
- SSH, users, firewall, updates → **linux-security-baseline**
- systemd timers, cron → **linux-timers-cron**
- Log rotation, disk full → **log-rotation**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| Debian baseline, apt, unattended-upgrades, journald | debian-ops |
| apt broken, dpkg, half-configured, dependency conflict | debian-package-debug |
| boot fail, GRUB, initramfs, kernel rollback | debian-kernel-boot |
| web service, systemd, env, reverse proxy | debian-web-stack |
| systemd service, journald, ports, TLS | linux-service-debug |
| DNS, routing, firewall, ports | linux-network |
| disk full, inode, mounts, permissions | linux-storage |
| TLS, cert chain, expiry, SNI | linux-tls |
| SSH, users, sudo, firewall, hardening | linux-security-baseline |
| cron, systemd timer, scheduled job | linux-timers-cron |
| log rotation, journald, logrotate, disk | log-rotation |

## Configurations

### debian-ops
Apt sources; unattended-upgrades policy; journald/logrotate; time sync; users/sudo/SSH; firewall basics; backups; documented report.

### debian-package-debug
Half-configured packages; dependency conflicts; pinning/held; safe recovery workflow; evidence logging.

### debian-kernel-boot
GRUB/initramfs recovery; disk UUID/fsck; kernel rollback; remote safety; post-boot verification; change log.

### debian-web-stack
systemd units; env files; permissions; directories; reverse proxy; repeatable deployment and rollback.

### linux-service-debug
Identify failing unit; observe (systemctl status/cat, journalctl, ss); hypothesize; fix (unit, permissions, env); verify (daemon-reload, restart).

### linux-network
DNS, routing, firewalls, reverse proxy, MTU, port conflicts; reproducible checks.

### linux-storage
Disk/inode exhaustion; permissions; mounts; log growth; safe recovery steps.

### linux-tls
Cert chain; expiry; SNI; ALPN; trust stores; safe rotation.

### linux-security-baseline
SSH hardening; users/sudo; updates; firewall; file perms; secrets locations.

### linux-timers-cron
systemd timers vs cron; logging; locking; idempotency; retries.

### log-rotation
journald vs logrotate; app vs system logs; safe cleanup; retention; verify rotation occurs.
