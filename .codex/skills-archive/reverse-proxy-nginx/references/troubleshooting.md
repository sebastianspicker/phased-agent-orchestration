# Nginx reverse proxy troubleshooting checklist

- Confirm upstream is healthy on localhost (curl direct).
- Check `nginx -t` and reload result.
- Inspect access/error logs around request timestamp.
- Verify headers: Host / X-Forwarded-* are set correctly.
- For 502/503: check upstream listen address/port, health, and firewall.
- For WebSockets: confirm Upgrade/Connection headers and proxy_http_version 1.1.
- For uploads: confirm client_max_body_size and upstream limits.
- For TLS: validate certificate chain/SNI and trust store.

