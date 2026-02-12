# Network commands (quick)

## Ports
```bash
ss -ltnp
ss -lunp
```

## DNS
```bash
getent hosts example.com
resolvectl status || true
dig example.com || true
```

## Routes
```bash
ip addr
ip route
```
