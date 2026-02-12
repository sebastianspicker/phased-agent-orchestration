# Traefik routing checklist (template)

- Provider: Docker / Kubernetes / file
- Entrypoint(s): web / websecure / custom
- Router rule: Host()/PathPrefix()
- Service target: name + port
- Middlewares:
  - redirect http->https
  - headers (HSTS, etc.)
  - auth (if applicable)
- TLS:
  - resolver:
  - domains/SANs:
- Verification plan:
  - curl expected status/headers
  - access log confirmation

