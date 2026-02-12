# OpenTelemetry in Kubernetes patterns (high-level)

- Prefer a collector deployment strategy that matches your environment (daemonset vs gateway).
- Keep resource usage bounded (batching, sampling, queue limits).
- Ensure trace context propagation across service boundaries.
- Treat telemetry as potentially sensitive; apply redaction rules.

