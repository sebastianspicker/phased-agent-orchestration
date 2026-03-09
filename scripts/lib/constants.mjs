export const PHASE_ORDER = [
  "arm",
  "design",
  "adversarial-review",
  "plan",
  "pmatch",
  "build",
  "quality-static",
  "quality-tests",
  "post-build",
  "release-readiness",
];

export const CONFIG_IDS = [
  "baseline_single_agent",
  "phased_default",
  "phased_plus_reviewers",
  "phased_with_context_budgets",
  "phased_dual_extractor_drift",
];

export const DEFAULT_CONFIG_ID = "phased_default";

export const PIPELINE_DIR = ".pipeline";

export const COGNITIVE_TIERS = ["high_reasoning", "balanced", "fast"];

export const SKILL_ENTRYPOINTS = {
  quality_gate: "skills/dev-tools/quality-gate/dist/index.js",
  trace_collector: "skills/dev-tools/trace-collector/dist/index.js",
};

