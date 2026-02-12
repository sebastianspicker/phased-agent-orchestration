---
name: network
description: "Network playbook. Use when debugging networks, testing (latency/DNS/MTU), DNS ops, security baseline, firewall review, or VPN (WireGuard, OpenVPN, remote access policy). Choose configuration from user prompt."
---

# network (Playbook)

Network operations and VPN. **Choose one configuration** from the user prompt.

## When to use (triggers)
- General network debugging → **debug**
- Latency, throughput, DNS, MTU tests → **testing**
- DNS authoritative/recursive, split-horizon → **dns-ops**
- Segmentation, firewall hygiene → **security-baseline**
- Firewall rules, shadowed rules, logging → **firewall-review**
- WireGuard keys, routing, peers → **vpn-wireguard**
- OpenVPN, PKI, client profiles → **vpn-openvpn**
- VPN/remote access policy, MFA, exception → **vpn-remote-access-policy**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| network debug, connectivity, routing | debug |
| latency, jitter, throughput, DNS test, MTU | testing |
| DNS, NXDOMAIN, SERVFAIL, TTL, zones | dns-ops |
| network segmentation, inbound/outbound | security-baseline |
| firewall rules, shadowed, any/any, logging | firewall-review |
| WireGuard, keys, routing, MTU, peers | vpn-wireguard |
| OpenVPN, PKI, road-warrior, site-to-site | vpn-openvpn |
| remote access policy, VPN, MFA, break-glass | vpn-remote-access-policy |

## Configurations

### debug
DNS, routing, firewalls, reverse proxy, MTU, port conflicts; reproducible checks; evidence.

### testing
LAN/WAN/VPN tests: latency/jitter/throughput/loss; DNS correctness; MTU/PMTUD; results log.

### dns-ops
Inventory (zones, forwarders, split-horizon); baseline queries; change with TTL and rollback; query test matrix; NXDOMAIN vs SERVFAIL vs timeout.

### security-baseline
Segmentation; firewall hygiene; inbound/outbound minimization; logging; safe remote access/VPN; exception workflow.

### firewall-review
Rule hygiene (shadowed, any/any); inbound/outbound minimization; logging; change windows; test plan; exception lifecycle.

### vpn-wireguard
Keys; routing; MTU; split tunnel; peer management; rotation and verification; no secrets in output.

### vpn-openvpn
PKI/client profiles; routing vs NAT; split tunnel; DNS push; MTU; logging; revocation/rotation.

### vpn-remote-access-policy
Boundaries; MFA/SSO concepts; device posture; logging/retention; break-glass; incident procedures; exception workflow.
