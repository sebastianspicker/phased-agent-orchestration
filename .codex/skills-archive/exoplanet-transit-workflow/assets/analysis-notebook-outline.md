# Transit analysis notebook outline (template)

## 0. Setup
- Environment (Python version, key packages):
- Random seeds:
- Data paths (input/output):

## 1. Data ingestion
- Source/provenance:
- Columns and units:
- Time standard:
- Quality flags handling:

## 2. Initial visualization
- Raw light curve plot (full + zoom around event window):
- Error model sanity check:

## 3. Cleaning policy
- Outlier definition (predeclared):
- Gaps/invalid points handling:

## 4. Detrending/systematics
- Candidate regressors (airmass/seeing/pos/temperature/etc):
- Baseline model(s) tried:
- Selection criterion and decision log:

## 5. Transit model
- Parameterization:
- Priors and rationale:
- Limb darkening policy (fixed vs fitted):

## 6. Fit
- Deterministic fit results:
- MCMC setup (walkers/steps/burn-in):

## 7. Diagnostics
- Trace plots:
- Autocorrelation / ESS:
- Residual checks:
- Posterior predictive checks:

## 8. Injection & recovery
- Injection grid:
- Recovery metrics:

## 9. Report
- Posterior summary table:
- Figures:
- Limitations/assumptions:

