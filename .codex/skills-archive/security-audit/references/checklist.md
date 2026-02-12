# Security review checklist (starter)

## Code
- [ ] authn/authz consistent (no bypass paths)
- [ ] input validation on boundaries (request payloads, env vars, file inputs)
- [ ] output encoding for HTML contexts (XSS prevention)
- [ ] SSRF protections when fetching URLs
- [ ] safe deserialization patterns
- [ ] secrets not logged

## Dependencies
- [ ] lockfiles committed and reviewed
- [ ] high/critical advisories triaged

## Build/CI
- [ ] no secrets in logs
- [ ] least-privilege tokens
- [ ] pinned actions and dependencies where feasible

## Infra
- [ ] least privilege IAM
- [ ] network boundaries documented
- [ ] encrypted storage and TLS
