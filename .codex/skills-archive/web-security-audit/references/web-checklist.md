# Web security checklist (detailed)

## Headers
- [ ] CSP considered for XSS reduction
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy` appropriate
- [ ] `Permissions-Policy` considered

## Auth/session
- [ ] cookie flags correct (`Secure`, `HttpOnly`, `SameSite`)
- [ ] session rotation on login/privilege changes
- [ ] logout invalidates sessions

## Input and routing
- [ ] validate IDs and ownership on every access (IDOR prevention)
- [ ] open redirect prevented
- [ ] file upload validation and storage controls

## APIs
- [ ] rate limits on auth and sensitive endpoints
- [ ] consistent error shapes (don’t leak internals)
