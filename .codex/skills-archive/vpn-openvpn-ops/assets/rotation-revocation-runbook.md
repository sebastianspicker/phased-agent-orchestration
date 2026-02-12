# OpenVPN rotation + revocation runbook (template)

## Scope
- Client(s)/group:
- Window:
- Owner:

## Preflight
- Inventory updated.
- Rollback plan (restore previous config) defined.

## Steps (rotation)
1) Issue new client credentials/profile.
2) Distribute securely to client.
3) Verify connectivity and DNS.
4) Keep previous credential valid for a short overlap window (if policy allows).

## Steps (revocation)
1) Revoke client credential immediately.
2) Confirm server reload/restart as needed.
3) Verify revoked client can no longer connect.

## Verification
- Handshake:
- Route reachability:
- DNS behavior:

