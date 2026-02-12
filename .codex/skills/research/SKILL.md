---
name: research
description: "Research and documentation playbook. Use when reverse-engineering specs, academic research, paper writing, LaTeX, astronomy (literature, claims, time-series, variability, catalog, simulation), exoplanet/eclipsing-binary, photometry, Bayesian inference, uncertainty/units, teaching simulations, phyphox, classroom data, runbooks, or docs coauthoring/code reference. Choose configuration from user prompt."
---

# research (Playbook)

Academic research, astronomy, teaching, and documentation. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Reverse-engineering undocumented systems → **reverse-spec**
- Literature review, claim→citation → **academic-research**
- Academic paper drafting (IMRaD) → **paper-writing**
- LaTeX papers, BibTeX, figures → **latex**
- Astro literature/claims/time-series/variability/catalog/simulation → **astro-*** configs
- Exoplanet transit, eclipsing binary, photometry → **exoplanet-transit**, **eclipsing-binary**, **photometry-systematics**
- Bayesian inference for astro → **bayesian-astro**
- Uncertainty, units → **uncertainty-units**
- Teaching simulation design → **teaching-simulation**
- phyphox labs, smartphone experiments → **phyphox**
- Classroom data analysis (Python) → **classroom-data**
- IT runbooks, server config docs → **runbook-docs**
- Docs coauthoring, reader testing → **docs-coauthoring**
- API docs, docstrings, OpenAPI → **docs-code-reference**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| reverse engineer, undocumented, spec | reverse-spec |
| literature review, citations, related work | academic-research |
| academic paper, IMRaD | paper-writing |
| LaTeX, BibTeX, figures | latex |
| astro literature, claim tracking | astro-literature |
| astro claims, figures, captions | astro-paper-claims |
| period search, Lomb-Scargle, GLS | astro-time-series |
| variability classification | astro-variability |
| catalog query, cones, crossmatch | astro-catalog |
| astro simulation, reproducibility | astro-simulation |
| exoplanet transit | exoplanet-transit |
| eclipsing binary, O-C, eclipse model | eclipsing-binary |
| photometry systematics | photometry-systematics |
| Bayesian, priors, posterior | bayesian-astro |
| uncertainty, units | uncertainty-units |
| teaching simulation | teaching-simulation |
| phyphox, smartphone lab | phyphox |
| classroom data, student data | classroom-data |
| runbook, IT docs | runbook-docs |
| docs coauthoring | docs-coauthoring |
| API docs, code reference | docs-code-reference |

## Configurations (compact)

**reverse-spec** – Evidence-based spec; facts vs inferences; verification plan.

**academic-research** – Question → Search → Extract → Synthesize → Verify; claim→citation; no invented citations.

**paper-writing** – IMRaD; citation discipline; reproducible figures/methods.

**latex** – Reproducible build; BibTeX; figures/tables; verification-first.

**astro-literature** – Mission/method/target matrix; claim→citation; observed vs inferred.

**astro-paper-claims** – Claim→evidence→figure registry; reproducible figures; limitations.

**astro-time-series** – Lomb-Scargle/GLS; window/alias; false-alarm; phase-folding; logs.

**astro-variability** – Features; leakage checks; time-aware splits; dataset card.

**astro-catalog** – Query hygiene; caching; rate limits; provenance.

**astro-simulation** – Parameter sweeps; RNG seed; deterministic; experiment specs.

**exoplanet-transit** – Ingestion; detrending; modeling; LS/MCMC; injection-recovery.

**eclipsing-binary** – Ephemerides; O-C; eclipse model; limb darkening; residuals.

**photometry-systematics** – Trends; decision table; uncertainty checks.

**bayesian-astro** – Priors; identifiability; posterior predictive; credible intervals.

**uncertainty-units** – Units; uncertainty propagation; significant figures; tests.

**teaching-simulation** – Learning goals; simplify responsibly; misconceptions; lesson plan.

**phyphox** – Measurement design; calibration; export/parsing; privacy/ethics.

**classroom-data** – Cleaning; uncertainty; plotting; reproducible; privacy-aware.

**runbook-docs** – IT processes; reproducible runbooks in Markdown.

**docs-coauthoring** – Context gathering; reader testing; structured process.

**docs-code-reference** – Docstrings; API docs; accurate examples; verification.
