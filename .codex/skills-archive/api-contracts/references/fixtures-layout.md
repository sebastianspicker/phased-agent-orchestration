# Contract fixtures layout (convention)

Keep fixtures small, deterministic, and privacy-safe.

Suggested structure:

- `fixtures/contracts/<contract-name>/old-valid/`
- `fixtures/contracts/<contract-name>/new-valid/`
- `fixtures/contracts/<contract-name>/invalid/`

Each fixture should include:
- a short README explaining what it demonstrates
- sanitized payloads (no secrets / PII)

