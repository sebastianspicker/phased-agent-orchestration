# OpenVPN connectivity test plan (template)

## Scope
- Client type:
- Target subnet(s):
- DNS expectations:

## Tests
1) Connect and verify VPN IP assigned.
2) Ping gateway inside VPN network (if allowed).
3) Reach an internal service (TCP connect / HTTP health).
4) DNS resolution:
   - internal name resolves
   - external name behavior as expected (split/full)
5) MTU sanity:
   - large packet test (platform-specific) or upload/download check.

## Results log
| Test | Command/tool | Expected | Observed |
|---|---|---|---|
| | | | |

