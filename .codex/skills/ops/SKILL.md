---
name: ops
description: "Operations playbook. Use when operating Postgres, Redis, load testing, observability, incident response, postmortem, or secrets hygiene. Choose configuration from user prompt."
---

# ops (Playbook)

Databases, performance, observability, incidents. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Postgres migrations, backup, performance → **postgres**
- Redis persistence, memory, eviction → **redis**
- Load/performance testing, SLO → **perf-load-testing**
- Logs, metrics, traces, alerts → **observability**
- Incident severity, mitigation, comms → **incident-response**
- Postmortem, root cause, action items → **postmortem**
- Secrets, env, .env, CI, Docker → **secrets-hygiene**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| Postgres, migration, backup, restore, perf | postgres |
| Redis, persistence, memory, eviction, latency | redis |
| load test, performance, SLO, k6, artillery | perf-load-testing |
| observability, Prometheus, Grafana, OTel | observability |
| incident, severity, mitigation, comms | incident-response |
| postmortem, blameless, root cause | postmortem |
| secrets, .env, CI secrets, leak prevention | secrets-hygiene |

## Configurations

### postgres
Migrations (backward-compatible; rollback plan); backup/restore drills; performance triage (query plans, locks, pool); connection pooling; safe config changes; verification evidence.

### redis
Persistence strategy; memory/eviction policy; keyspace hygiene; latency spikes; replication/HA concepts; incident workflow; safe config.

### perf-load-testing
SLO-based pass criteria; environment parity; safe traffic generation; result reporting; regression gating.

### observability
Reliable logs/metrics/traces; MTTR; alerts/runbooks; instrument without leaking secrets.

### incident-response
Severity; mitigation; communication; evidence collection; follow-up actions.

### postmortem
Blameless postmortem; root cause; contributing factors; tracked action items.

### secrets-hygiene
Secrets in env/.env/CI/Docker; leak prevention; documented secure setup.
