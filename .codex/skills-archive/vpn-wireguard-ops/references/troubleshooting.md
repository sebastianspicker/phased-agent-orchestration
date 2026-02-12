# WireGuard troubleshooting checklist

- Handshake present but no traffic:
  - check routes/AllowedIPs
  - check firewall/NAT
  - check MTU
- No handshake:
  - endpoint reachability
  - port open
  - keys match
- DNS issues:
  - ensure intended DNS server is reachable through tunnel

