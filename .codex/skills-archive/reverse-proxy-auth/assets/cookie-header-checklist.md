# Cookie + header checklist (starter)

## Cookies
- Secure
- HttpOnly
- SameSite policy chosen and documented
- Domain/path scope minimal

## Headers
- Strip user-provided identity headers at edge
- Set/overwrite upstream identity headers explicitly
- Avoid leaking tokens to upstream logs

