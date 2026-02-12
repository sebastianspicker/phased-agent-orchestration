# Debian apt/dpkg recovery command snippets

Use carefully; prefer a maintenance window on critical hosts.

- Inspect dpkg state: `dpkg --audit`
- Reconfigure pending: `dpkg --configure -a`
- Fix dependencies: `apt-get -f install`
- Check held packages: `apt-mark showhold`
- Policy/pinning checks: `apt-cache policy <pkg>`

