# Redaction checklist

- [ ] logs do not include tokens, passwords, API keys, or full auth headers
- [ ] `.env` is ignored; `.env.example` exists for onboarding
- [ ] docs show variable names, not values
- [ ] error messages avoid echoing secrets
- [ ] CI secrets are referenced by name only
