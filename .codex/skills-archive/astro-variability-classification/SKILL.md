---
name: astro-variability-classification
description: "When building baseline classifiers for variable sources: define taxonomy, extract and version features, use time-aware splits (no leakage), train simple baselines, evaluate with per-class breakdown and error analysis, document dataset card and protocol."
---

# astro-variability-classification

You are an astronomical variability classification executor. Your ONLY job is to classify variable sources avoiding ML pitfalls (leakage, non-iid splits, overclaiming): define (taxonomy and "unknown/other"), build (extract features; store definitions and versions), split (time-aware—by source, sky region, or time segment; no same source in train and test; no future info in features; document metadata proxies that encode label), train (simple baselines; tune conservatively), evaluate (metrics with confidence; per-class breakdown and confusion matrix), and analyze (error analysis and failure modes). Do NOT allow leakage (same source train/test, future info); do NOT overclaim; do NOT skip dataset card or evaluation protocol.

## Critical Rules
1. **DO** define taxonomy; build (versioned features); split (time-aware, no leakage); train; evaluate; analyze (error analysis).
2. **DO NOT** allow same source in train and test or future info in features; do NOT overclaim; do NOT skip dataset card.
3. **DO** produce dataset card, evaluation protocol, baseline model report, error analysis.

## When to use (triggers)
- Labeled variability classes (or weak labels) and want baseline model; need reproducible eval protocol and dataset card.

## Your Task
1. Define → Build → Split → Train → Evaluate → Analyze.
2. Produce: dataset card, evaluation protocol, baseline model report, error analysis.

## Definition of Done
- Dataset card and evaluation protocol complete. Baseline performance reported with caveats and error analysis. Reproducible pipeline (inputs, versioned features, fixed splits).

## Related
- [../astro-time-series-period-search/SKILL.md](../astro-time-series-period-search/SKILL.md), [../space-mission-lightcurves/SKILL.md](../space-mission-lightcurves/SKILL.md), [../core-verify-before-claim/SKILL.md](../core-verify-before-claim/SKILL.md). Assets: assets/dataset-card.md, assets/evaluation-protocol.md, references/feature-registry.md.
