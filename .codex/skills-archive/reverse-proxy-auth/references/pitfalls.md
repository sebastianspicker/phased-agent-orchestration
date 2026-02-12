# Common pitfalls (reverse proxy auth)

- Redirect loops due to incorrect callback URLs or proxy headers.
- WebSockets failing because auth middleware blocks upgrade.
- Identity headers trusted from clients instead of overwritten by proxy.
- Cookie SameSite policy breaks cross-site flows unexpectedly.

