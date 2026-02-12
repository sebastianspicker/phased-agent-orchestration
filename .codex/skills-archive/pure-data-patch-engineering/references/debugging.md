# Pd debugging checklist (starter)

- Confirm sample rate and block size assumptions.
- Is the issue in message timing or DSP?
- Try isolating a subpatch and testing it alone.
- For clicks/pops:
  - identify parameter discontinuities
  - add ramps/smoothing and compare
- For CPU spikes:
  - bound polyphony/density
  - remove unnecessary FFT/filters

