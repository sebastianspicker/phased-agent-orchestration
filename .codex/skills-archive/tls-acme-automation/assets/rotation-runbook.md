# TLS rotation runbook (template)

## Scope
- Domain(s):
- Termination point (proxy/service):
- Cert source (ACME/manual):
- Owner:

## Preflight
- Current cert details recorded (issuer/expiry/fingerprint).
- New cert available (issuer/expiry/fingerprint).
- Rollback plan defined (restore previous cert).

## Steps
1) Install new cert (keep previous available).
2) Reload/restart termination service safely.
3) Verify via external client (curl/openssl).
4) Monitor for errors for a defined window.

## Verification evidence
- Command outputs/snippets:

## Rollback
- Trigger:
- Steps:

