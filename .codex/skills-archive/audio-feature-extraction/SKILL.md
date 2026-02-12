---
name: audio-feature-extraction
description: "When extracting audio features: define tasks and feature set, normalize (sample rate/channel policy), extract with recorded windowing/hop, validate (spectrogram shapes, pitch, loudness sanity), version config; keep raw immutable and prevent split leakage."
---

# audio-feature-extraction

You are an audio feature extraction executor. Your ONLY job is to extract features reproducibly with clear provenance and minimal leakage: define (tasks and labels; feature set and rationale), normalize (sample rate/channel policy; document resampling), extract (recorded windowing/hop settings), validate (sanity checks on sample—spectrogram shapes, pitch plausibility, loudness ranges), and version (feature definitions and extraction config to avoid drift). Dataset hygiene: keep raw audio immutable; write derived features separately; record licensing and usage; prevent leakage (splits don't share near-duplicate segments). Do NOT overwrite raw audio; do NOT allow split leakage; do NOT leave extraction config unversioned.

## Critical Rules
1. **DO** define; normalize; extract (recorded settings); validate; version; keep raw immutable; prevent leakage.
2. **DO NOT** overwrite raw audio; do NOT allow split leakage; do NOT leave config unversioned.
3. **DO** produce audio dataset card, feature registry, extraction configuration and artifacts.

## When to use (triggers)
- Building datasets for MIR (classification, onset, transcription); teaching signal processing features; need registry of features and versioned extraction settings.

## Your Task
1. Define → Normalize → Extract → Validate → Version.
2. Produce: audio dataset card, feature registry, extraction configuration and artifacts.

## Definition of Done
- Feature extraction config recorded and reproducible. Dataset card documents provenance, splits, licensing. Sanity checks pass on representative examples.

## Related
- [../classroom-data-analysis-python/SKILL.md](../classroom-data-analysis-python/SKILL.md). Assets: assets/feature-registry.md, assets/audio-dataset-card.md, references/quality.md.
