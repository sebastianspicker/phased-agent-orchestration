# Connectivity checklist

- [ ] correct service name used (compose DNS)
- [ ] correct port used (internal vs published)
- [ ] app binds to `0.0.0.0` if it must be reachable from host
- [ ] firewall not blocking published port (host side)
- [ ] healthcheck confirms readiness (not just “container started”)
