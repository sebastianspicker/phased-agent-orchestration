# Pd patch review checklist (template)

## Readability
- Signal flow direction consistent.
- Subpatches/abstractions used for repeated logic.
- Names convey intent (not just numbers).

## Correctness
- Message scheduling assumptions explicit.
- Audio-rate changes smoothed (ramps).
- No unintended feedback loops.

## Performance
- CPU hotspots identified (if needed).
- Unused DSP parts disabled.
- Polyphony/density bounded.

## Reproducibility
- Pd version recorded.
- Externals list recorded.
- Minimal repro patch exists for tricky bugs.

