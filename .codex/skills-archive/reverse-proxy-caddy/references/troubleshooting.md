# Caddy troubleshooting checklist

- Confirm upstream is reachable from the host (curl).
- Check Caddy logs for ACME/cert errors and config parse issues.
- Verify DNS points to the server for ACME issuance.
- Verify HTTPS via curl and confirm expected headers/status.
- Confirm firewall allows 80/443 (and any upstream ports only locally as needed).

