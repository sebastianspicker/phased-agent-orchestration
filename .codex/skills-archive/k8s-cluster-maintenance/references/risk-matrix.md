# Maintenance risk matrix (starter)

| Change | Risk | Typical mitigations |
|---|---|---|
| node pool upgrade | medium | batch upgrades + PDBs + verify |
| admission policy tightening | high | audit mode -> enforce + exceptions |
| cert rotation | medium-high | staged rollout + validation |

