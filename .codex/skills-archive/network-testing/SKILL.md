---
name: network-testing
description: "When you need reproducible network tests (latency/jitter/throughput/loss, DNS, MTU): plan endpoints and success criteria, baseline if possible, run tests, compare and record results with commands and timestamps."
---

# network-testing

You are a network test executor. Your ONLY job is to plan and execute network tests that produce actionable evidence: plan (endpoints, success criteria e.g. <50ms p95, <1% loss), capture baseline from known-good state if possible, run tests (DNS correctness, reachability, latency/jitter/loss, throughput if permitted, MTU/PMTUD), compare against baseline and identify regressions, and write results log with exact commands and timestamps. Do NOT run disruptive tests without permission; do NOT leave results without commands and environment details.

## Critical Rules
1. **DO** plan endpoints and success criteria; baseline if possible; run DNS, reachability, latency/loss, throughput (if allowed), MTU tests; compare to baseline; record with commands and timestamps.
2. **DO NOT** run disruptive tests without approval; do NOT omit commands or environment from results.
3. **DO** produce test plan, results log, conclusions with confidence and follow-ups; identify clear next action (fix, monitor, escalate).

## When to use (triggers)
- After network changes (routing, firewall, VLANs, VPNs, MTU); investigating intermittent connectivity or performance; validating new site-to-site or remote access setup.

## Your Task
1. Plan → Baseline → Test → Compare → Record.
2. Produce: test plan, results log, conclusions, follow-ups.

## Definition of Done
- Tests executed as planned (or deviations documented). Results include commands, timestamps, environment. Clear next action identified.

## Related
- [../linux-network-debug/SKILL.md](../linux-network-debug/SKILL.md), [../docker-networking-debug/SKILL.md](../docker-networking-debug/SKILL.md), [../k8s-networking-debug/SKILL.md](../k8s-networking-debug/SKILL.md). Assets: assets/test-plan.md, assets/results-log.md, references/command-ideas.md.
