# Secure coding checklist (implementation)

## Auth & authz
- [ ] default deny
- [ ] authz checked at the point of use (not only in UI)
- [ ] no IDOR (object access validated per-user/role)

## Input handling
- [ ] schema validation on boundary
- [ ] output encoding where applicable
- [ ] URL fetches constrained (SSRF mitigations)
- [ ] file uploads validated (type/size/storage)

## Secrets & logging
- [ ] secrets in env/secret manager only
- [ ] logs sanitized (no tokens, no passwords, no PII unless explicitly required)

## Crypto
- [ ] use well-known libs (don’t implement primitives)
- [ ] key management strategy documented
