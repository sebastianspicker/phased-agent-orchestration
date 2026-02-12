# Prompt injection defense checklist (starter)

- Untrusted inputs identified and labeled.
- Sensitive data sinks identified (secrets, internal APIs, tools).
- Tool allowlist is context-specific and deny-by-default.
- Output schema enforced and validated.
- Adversarial eval cases exist and run as regressions.
- Logs minimize sensitive content; decisions are auditable.

