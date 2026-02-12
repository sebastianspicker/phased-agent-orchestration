# Connectivity matrix (template)

## Scenario
- Source pod:
- Destination (service/ingress/external):
- Protocol/port:
- Expected behavior:

## Hops
| Hop | Test | Expected | Observed |
|---|---|---|---|
| Pod -> DNS | nslookup | resolves | |
| Pod -> Service ClusterIP | curl/nc | connects | |
| Service -> Endpoints | get endpoints | non-empty | |
| Pod -> Ingress | curl with Host | 200/expected | |
| External -> Ingress | curl from outside | 200/expected | |

## Notes / findings
- 

