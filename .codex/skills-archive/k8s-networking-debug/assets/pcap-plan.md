# tcpdump / pcap plan (template, safe use)

Goal: capture enough to confirm routing/DNS/TCP behavior without collecting secrets.

## Scope
- Interface(s):
- Namespace/pod/node:
- Duration:
- Filters (host/port):

## Data minimization
- Avoid capturing full HTTP bodies when possible.
- Prefer capturing headers/metadata only (or short duration).
- Store pcaps securely; treat as sensitive.

## Steps
1)
2)
3)

## Verification
- What packet pattern confirms the hypothesis?

