# OpenVPN troubleshooting checklist

- Confirm client connects (auth success) and receives an IP.
- Confirm routes:
  - client has route(s) for target subnets
  - server routes between VPN and internal networks
- Confirm firewall allows:
  - VPN interface -> internal subnets
  - return traffic
- DNS:
  - confirm DNS servers pushed and applied
  - confirm split-horizon behavior as designed
- MTU/fragmentation:
  - look for symptoms: “works for small requests only”
  - test with larger payloads; adjust conservatively

