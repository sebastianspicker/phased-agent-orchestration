---
name: music
description: "Music technology playbook. Use when working with Sonic Pi (livecoding, snippets), Pure Data (patch, audio I/O), Tone.js, web audio debug, audio DSP/features, lab design, or student submission eval. Choose configuration from user prompt."
---

# music (Playbook)

Sonic Pi, Pure Data, Tone.js, audio, and music tech teaching. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Sonic Pi live set, BPM, cues → **sonic-pi-livecoding**
- Sonic Pi snippets, patterns, reproducible → **sonic-pi-snippets**
- Pure Data patches, signal flow → **pure-data**
- Pd audio routing, ALSA/JACK/CoreAudio → **pd-audio-routing**
- Tone.js, web audio app → **tonejs**
- Web Audio clicks, timing, graph → **web-audio-debug**
- Audio DSP experiments, metrics → **audio-dsp**
- Audio features (STFT, onset, pitch) → **audio-features**
- Music tech lab design → **lab-design**
- Grading Sonic Pi/Pd/Tone.js submissions → **submission-eval**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| Sonic Pi live, performance, cues | sonic-pi-livecoding |
| Sonic Pi snippets, pattern library | sonic-pi-snippets |
| Pure Data, Pd patch | pure-data |
| Pd audio I/O, routing, latency | pd-audio-routing |
| Tone.js, web audio | tonejs |
| Web Audio debug, clicks, timing | web-audio-debug |
| audio DSP, experiment, SNR, ABX | audio-dsp |
| audio features, STFT, mel, onset | audio-features |
| music tech lab, learning goals | lab-design |
| student submission, grading | submission-eval |

## Configurations

### sonic-pi-livecoding
Audio routing; BPM/cues; reusable patterns; panic/fallback; recording/export; set notes.

### sonic-pi-snippets
Parameterized functions; seed for determinism; snippet index; expected outcomes.

### pure-data
Signal-flow; abstractions; message vs signal; scheduling; DSP graph; CPU; click/pop mitigation.

### pd-audio-routing
ALSA/CoreAudio/JACK; devices; latency; no feedback; routing diagram; config log.

### tonejs
AudioContext lifecycle (user gesture); Transport; polyphony; memory; offline render/export; browser constraints.

### web-audio-debug
Clicks/pops; drift; timing jitter; sample rate; AudioWorklet; minimal repro; symptom→graph.

### audio-dsp
Hypothesis; signal chain; test signals; SNR/THD/crest factor; ABX; reproducible report.

### audio-features
STFT/mel; onset; pitch; loudness; feature registry; dataset card.

### lab-design
Learning goals; scaffolding; rubrics; failure modes; accessibility; hearing safety.

### submission-eval
Light automation; deterministic render/export; copy-pattern awareness; structured feedback; rubrics.
