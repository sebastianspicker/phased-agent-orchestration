# Instrumentation plan (template)

## Goal
- User-facing objective:
- Primary failure modes to detect:

## Service boundaries
- Entry points (HTTP routes, queue consumers, cron jobs):
- Dependencies (DB, cache, third-party APIs):

## Logs (structured)
- Correlation keys: `request_id`, `trace_id` (if available)
- Event taxonomy (top 10 events):
  1)
  2)
  3)
- Redaction rules:
- Sampling / rate limits:

## Metrics
- Traffic:
- Errors:
- Latency:
- Saturation:

## Tracing (optional)
- Propagation format:
- Key spans to add:
- Sampling strategy:

## Dashboards
- Overview dashboard link:
- Drill-down dashboards:

## Alerts
- Alert name:
  - Signal:
  - Threshold:
  - Severity:
  - Owner:
  - Runbook:

## Verification plan
- How to simulate a failure safely:
- Expected log lines:
- Expected metric changes:
- Expected trace shape:

