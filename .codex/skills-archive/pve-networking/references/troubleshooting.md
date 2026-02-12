# PVE networking troubleshooting checklist

- Confirm VM/CT NIC is attached to the expected bridge.
- Confirm VLAN tagging expectations (VM tag vs bridge VLAN-aware vs upstream trunk).
- Confirm host routes and default gateway.
- Confirm firewall policies (host + PVE firewall).
- If bond/LACP: confirm upstream switch configuration matches.
- If MTU: verify end-to-end MTU across bridge/uplink and any tunnels.

