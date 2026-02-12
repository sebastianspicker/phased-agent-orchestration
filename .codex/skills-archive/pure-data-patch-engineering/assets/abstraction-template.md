# Pd abstraction template (convention)

## Name
- `ab_<domain>_<purpose>` (example: `ab_env_adsr`)

## Interface
- Inlets:
  - inlet 1: primary control (type/units)
  - inlet 2: optional modulation
- Outlets:
  - outlet 1: main signal
  - outlet 2: debug/monitor (optional)

## Parameters
- defaults:
- safe ranges:

## Notes
- expected sample rate/block size assumptions (if any)

