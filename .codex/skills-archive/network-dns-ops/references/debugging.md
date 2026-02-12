# DNS debugging checklist (starter)

- Identify which resolver the client is using.
- Compare results:
  - query direct to authoritative
  - query via recursive resolver
- Check TTL and caching effects.
- Distinguish:
  - NXDOMAIN (data)
  - SERVFAIL (resolver)
  - timeout (network/overload)

