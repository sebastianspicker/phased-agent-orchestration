# Web Audio debug checklist (starter)

- Confirm AudioContext lifecycle (resume/suspend) and user gesture.
- Record sample rate and platform.
- Build a minimal repro and freeze variables.
- For clicks:
  - add ramps for gain/param changes
  - avoid abrupt node connect/disconnect without smoothing
- For jitter:
  - move scheduling to lookahead mechanism
  - reduce main-thread work during audio scheduling

