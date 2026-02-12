# TLS verification commands (starter)

## curl
- `curl -vI https://example.com`

## openssl
- `openssl s_client -connect example.com:443 -servername example.com -showcerts </dev/null`

Checks to perform:
- hostname matches (SNI)
- chain is complete
- expiry is in the future
- ALPN negotiated as expected (e.g., h2/http1.1)

