# TLS verify commands

```bash
openssl s_client -connect example.com:443 -servername example.com -showcerts </dev/null
curl -v https://example.com/health
```
