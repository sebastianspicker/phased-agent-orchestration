# Latency tuning checklist (starter)

- Start stable (larger buffers), then reduce gradually.
- If glitches occur:
  - increase buffer size
  - reduce DSP load/voices
  - confirm CPU headroom
- Ensure sample rate matches device and project assumptions.
- Document the lowest stable latency settings per device.

