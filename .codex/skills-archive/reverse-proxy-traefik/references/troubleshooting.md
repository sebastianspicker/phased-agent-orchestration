# Traefik troubleshooting checklist

- Confirm router rule matches the request (host/path).
- Confirm correct entrypoint is used.
- Confirm service discovery produced the intended service/port.
- Inspect access logs for router/service selected.
- For 502: confirm upstream is reachable from Traefik network/namespace.
- For TLS: confirm cert resolver and SNI domain; check expiry/renewal logs.

