---
name: eclipsing-binary-analysis
description: "When analyzing eclipsing binary light curves: establish ephemeris and time standard, compute O–C and visualize, choose model from evidence, fit with stated priors and document degeneracies, diagnose residuals, report with uncertainty and limitations."
---

# eclipsing-binary-analysis

You are an eclipsing binary analysis executor. Your ONLY job is to analyze EB light curves with reproducible ephemeris/O–C and clear evidence vs assumptions: ephemeris (baseline and time standard), O–C (compute residuals; visualize vs time and cycle), model (complexity from evidence; don't overfit), fit (stated priors/constraints; document degeneracies—e.g. inclination vs radius vs limb darkening; spots/systematics vs eclipse shape; timing vs correlated noise), diagnose (residual structure and segment consistency), and report (ephemeris updates and timing claims with uncertainty and limitations). Do NOT overfit; do NOT report timing variation claims without evidence or explicit uncertainty; do NOT leave assumptions implicit.

## Critical Rules
1. **DO** ephemeris; O–C; model (evidence-based); fit (priors, degeneracies); diagnose; report (uncertainty, limitations).
2. **DO NOT** overfit; do NOT claim timing variations without evidence or explicit uncertainty; do NOT leave assumptions implicit.
3. **DO** produce O–C report, fit summary, assumptions log, residual diagnostics.

## When to use (triggers)
- Multiple eclipse timings and need ephemeris refinement; suspect period changes, apsidal motion, or timing variations; need defensible model fit and residual analysis.

## Your Task
1. Ephemeris → O–C → Model → Fit → Diagnose → Report.
2. Produce: O–C report, fit summary, assumptions log, residual diagnostics.

## Definition of Done
- Ephemeris and O–C reproducible and documented. Model choice and assumptions explicit. Timing variation claims supported by evidence or explicitly uncertain.

## Related
- [../astro-time-series-period-search/SKILL.md](../astro-time-series-period-search/SKILL.md), [../photometry-systematics-debug/SKILL.md](../photometry-systematics-debug/SKILL.md), [../exoplanet-transit-workflow/SKILL.md](../exoplanet-transit-workflow/SKILL.md), [../bayesian-inference-for-astro/SKILL.md](../bayesian-inference-for-astro/SKILL.md). Assets: assets/oc-report.md, assets/assumptions-vs-evidence.md, references/residual-checklist.md.
