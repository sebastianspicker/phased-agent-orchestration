#!/usr/bin/env bash
set -euo pipefail

# Initialize a new pipeline run in .pipeline/
# Usage: ./scripts/pipeline-init.sh [project-root]

project_root="${1:-.}"
pipeline_dir="$project_root/.pipeline"
run_id="$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())' 2>/dev/null || date +%s)"
run_id="$(echo "$run_id" | tr '[:upper:]' '[:lower:]')"
run_dir="$pipeline_dir/runs/$run_id"

mkdir -p "$run_dir/drift-reports"
mkdir -p "$run_dir/quality-reports"
mkdir -p "$run_dir/gates"

timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$pipeline_dir/pipeline-state.json" <<EOF
{
  "run_id": "$run_id",
  "created_at": "$timestamp",
  "current_phase": "arm",
  "completed_gates": [],
  "artifacts": {
    "brief": null,
    "design": null,
    "review": null,
    "plan": null,
    "drift_reports": [],
    "quality_reports": []
  },
  "config": {
    "cognitive_tiers": {
      "arm": "high_reasoning",
      "design": "high_reasoning",
      "adversarial_review_lead": "high_reasoning",
      "adversarial_review_reviewers": "fast",
      "plan": "high_reasoning",
      "pmatch": "fast",
      "build_lead": "high_reasoning",
      "build_worker": "fast",
      "post_build": "fast"
    },
    "reviewer_roles": [
      "architect-reviewer",
      "security-engineer",
      "performance-engineer"
    ],
    "post_build": [
      "denoise",
      "quality-frontend",
      "quality-backend",
      "quality-docs",
      "security-review"
    ]
  }
}
EOF

echo "Pipeline initialized:"
echo "  run_id:    $run_id"
echo "  run_dir:   $run_dir"
echo "  state:     $pipeline_dir/pipeline-state.json"
