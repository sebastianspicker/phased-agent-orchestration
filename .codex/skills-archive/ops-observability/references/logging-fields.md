# Logging field conventions (starter)

Use stable keys so queries and alerts don’t break.

## Correlation / identity
- `request_id`: request correlation id (generated at entry)
- `trace_id`, `span_id`: only if tracing exists
- `session_id`: prefer opaque ids; avoid raw cookies
- `user_id`: only if privacy-approved (prefer hashed/opaque)

## Context
- `service`, `component`, `version` (commit/deploy id)
- `env` (dev/staging/prod)
- `region`, `az` (if applicable)
- `route` / `operation`

## Timing
- `duration_ms` (integer)
- `timeout_ms` (integer)

## Errors
- `error_kind` (stable classification)
- `error_code` (domain code; avoid stacktrace-only)
- `status` (HTTP status when relevant)

## Redaction guidance
- Never log: auth headers, passwords, tokens, private keys, full request bodies by default.
- Prefer: lengths, hashes, or “present/absent” booleans for sensitive fields.

