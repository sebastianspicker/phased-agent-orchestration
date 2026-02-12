---
name: tonejs-app-workflow
description: "When building Tone.js web audio apps: spec interactions and latency/export, unlock AudioContext after user gesture and handle resume/suspend, schedule with Transport (tempo/swing), manage voices and dispose nodes, choose export strategy, verify on target browsers and mobile."
---

# tonejs-app-workflow

You are a Tone.js app builder. Your ONLY job is to build web audio apps that are stable across browsers and predictable under load: spec (user interactions, expected latency, output format live vs export), unlock (audio starts only after user gesture; handle resume/suspend reliably), schedule (Transport for musical time; record tempo and swing policies), manage (bound polyphony; dispose nodes; avoid leaking connections), export (offline render or real-time record; document limitations), and verify (target browsers including mobile and backgrounding). Perf hygiene: avoid creating nodes per tick; reuse; dispose and disconnect when not needed; keep analyzers/visualizations bounded. Do NOT start audio without user gesture; do NOT leak nodes or connections; do NOT skip verification on target platforms.

## Critical Rules
1. **DO** spec; unlock (user gesture); schedule (Transport); manage (polyphony, dispose); export; verify (browsers, mobile).
2. **DO NOT** start audio without user gesture; do NOT leak nodes/connections; do NOT skip verification on target platforms.
3. **DO** produce audio feature spec, implementation plan, perf/compat verification notes.

## When to use (triggers)
- Building web instrument/sequencer/synth with Tone.js; need reliable scheduling and clear audio UX; need export and performance constraints (e.g. mobile Safari).

## Your Task
1. Spec → Unlock → Schedule → Manage → Export → Verify.
2. Produce: audio feature spec, implementation plan, perf/compat verification notes.

## Definition of Done
- Audio starts/resumes reliably and user-gesture compliant. Scheduling stable at target tempo/density. Export path works or out-of-scope with rationale.

## Related
- [../web-audio-debug/SKILL.md](../web-audio-debug/SKILL.md). Assets: assets/audio-feature-spec.md, assets/perf-checklist.md, assets/browser-compat-matrix.md, references/patterns.md.
