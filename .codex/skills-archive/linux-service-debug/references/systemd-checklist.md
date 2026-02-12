# systemd checklist

- [ ] Unit file location known (`systemctl cat <unit>`)
- [ ] `ExecStart` absolute and correct
- [ ] `WorkingDirectory` correct (if used)
- [ ] `User`/`Group` correct and has permissions
- [ ] `EnvironmentFile` exists and is readable
- [ ] Restart policy appropriate
- [ ] Logs captured via journald
