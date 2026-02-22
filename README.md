# Phased Agent Orchestration

This repository defines a practical way to ship software with AI agents without letting quality drift.

Originally, this repository was a broader orchestration playground with many parallel patterns, prompts, and agent collaboration styles. That worked for exploration, but as context windows became very large, the signal-to-noise ratio degraded: too much context produced too much noise, and too many concurrent contributors often meant too many cooks spoiling the broth.

The repository therefore shifted to a phased orchestration model with strict gates, scoped context, and explicit handoffs. It now uses that same principle to evolve itself: changes are designed, challenged, implemented, and validated through the same phased pipeline that the repository defines.

The system is built around one simple rule:
**no stage can move forward until its output is validated.**

Each stage has a clear job, a typed artifact, and a gate. This prevents the usual failure mode where planning, coding, and auditing blur together.

## Why This Architecture Exists

Many AI-assisted workflows fail for predictable reasons:
- ideas are vague when implementation starts,
- design choices are not grounded in current docs or real repo constraints,
- builders validate their own work,
- quality and security checks happen too late.

This orchestration addresses those problems directly:
- capture intent before design (Intake / `arm`),
- force evidence-backed design (Design Synthesis / `design`),
- pressure-test design from independent perspectives (Adversarial Challenge / `adversarial-review`),
- create deterministic build instructions (Execution Blueprint / `plan`),
- detect drift before and after coding (Drift Match / `pmatch`),
- enforce static and test quality gates before audits (`quality-static`, `quality-tests`),
- separate implementation from audit (Coordinated Build / `build` + post-build checks),
- require explicit ship readiness evidence (`release-readiness`),
- close security findings before shipping (`security-review` loop).

## Scientific Intuition (Beginner-Friendly)

The scientific docs in this repo explain the same idea in math form:

- `docs/SCIENTIFIC_FOUNDATION.md`
- `docs/MATH_AND_CS_BEHIND_THE_REPO.md`
- `docs/SCIENTIFIC_IMPLEMENTATION_MAP.md`

Here is the plain-language version.

1. More context is not always better.
If we define information density as:
`eta(C) = I(I;C) / |C|`
then adding many irrelevant tokens usually increases `|C|` faster than useful information `I(I;C)`. So quality can drop even when context gets larger.

1. More parallel contributors can create communication overhead.
For `n` participants:

- fully connected communication channels: `n(n-1)/2`
- hub-and-spoke communication channels: `n-1`

This is why the pipeline uses phased handoffs and a lead-orchestrated flow instead of free-form all-to-all coordination.

1. Gates reduce error propagation.
If a phase introduces defects with probability `p`, and a gate catches defects with probability `d`, then:
`p_res = p(1-d)`

Lower residual error per phase compounds across the pipeline, which is why every stage has a required pass/fail gate before advancing.

## Delivery Stages

```text
Intake -> Design Synthesis -> Adversarial Challenge -> Execution Blueprint -> Drift Match -> Coordinated Build -> Quality Static -> Quality Tests -> post-build -> Release Readiness
Brief      Design            Review                   Plan                    Drift         Build              Static Gate        Test Gate        Quality + Security   Ship Gate
```

Canonical phase aliases:
`arm -> design -> adversarial-review -> plan -> pmatch -> build -> quality-static -> quality-tests -> post-build -> release-readiness`

| Stage (alias) | Why this stage exists | Required output |
|---|---|---|
| Intake (`arm`) | Turn fuzzy input into explicit requirements and constraints. | `brief.json` |
| Design Synthesis (`design`) | Build the approach from validated facts, not assumptions. | `design.json` |
| Adversarial Challenge (`adversarial-review`) | Expose blind spots via independent specialist critique. | `review.json` |
| Execution Blueprint (`plan`) | Remove guesswork for builders with atomic, testable tasks. | `plan.json` |
| Drift Match (`pmatch`) | Detect source-vs-target drift using dual independent extractors. | `drift-reports/pmatch.json` |
| Coordinated Build (`build`) | Execute in parallel with strict scope boundaries and conformance checks. | build changes + `build-gate.json` |
| Quality Static (`quality-static`) | Enforce lint, format-check, and type checks before downstream audits. | `quality-reports/static.json` + `quality-static-gate.json` |
| Quality Tests (`quality-tests`) | Enforce dedicated test verification before post-build audits. | `quality-reports/tests.json` + `quality-tests-gate.json` |
| post-build | Run denoise + frontend/backend/docs/security audits before closure. | `quality-reports/*.json` + `postbuild-gate.json` |
| Release Readiness (`release-readiness`) | Final go/no-go gate for semver impact, changelog, migration, rollback, and approvals. | `release-readiness.json` + `release-readiness-gate.json` |

## End-to-End Flow

```mermaid
flowchart TD
  A["Idea input"] --> B["Intake (arm): brief formation"]
  B --> C{"Intake gate pass?"}
  C -- "No" --> B
  C -- "Yes" --> D["Human checkpoint: brief approval"]

  D --> E["Design Synthesis (design): evidence-backed architecture"]
  E --> F{"Design gate pass?"}
  F -- "No" --> E
  F -- "Yes" --> G["Human checkpoint: design alignment"]

  G --> H["Adversarial Challenge (adversarial-review): parallel specialists"]
  H --> I{"critical/high findings unresolved?"}
  I -- "Yes" --> H
  I -- "No" --> J["Human checkpoint: review acceptance"]

  J --> K["Execution Blueprint (plan): deterministic task groups"]
  K --> L{"Plan gate pass?"}
  L -- "No" --> K
  L -- "Yes" --> M["Drift Match (pmatch): design vs plan (dual extractor adjudication)"]

  M --> N{"Drift Match gate pass?"}
  N -- "No" --> K
  N -- "Yes" --> O["Coordinated Build (build): parallel implementation"]

  O --> P["build includes plan-vs-implementation conformance check"]
  P --> Q{"build gate pass?"}
  Q -- "No" --> K
  Q -- "Yes" --> R["quality-static: lint + format + type"]

  R --> S{"quality-static gate pass?"}
  S -- "No" --> O
  S -- "Yes" --> T["quality-tests: required verification tests"]

  T --> U{"quality-tests gate pass?"}
  U -- "No" --> O
  U -- "Yes" --> V["post-build: denoise + qf + qb + qd + security-review"]

  V --> W{"post-build gate pass?"}
  W -- "No" --> X["targeted remediation + rerun relevant checks"]
  X --> V
  W -- "Yes" --> Y["release-readiness: semver + changelog + migration + rollback + approvals"]

  Y --> Z{"release-readiness gate pass?"}
  Z -- "No" --> X
  Z -- "Yes" --> AA["Ready to ship"]
```

## What Is New in the Current Orchestration

The current implementation strengthens existing behavior without reintroducing external model dependencies:

1. `pmatch` is first-class in Cursor via its own adapter:
- `.cursor/skills/orchestration-pmatch/SKILL.md`

2. Drift detection now supports **dual-extractor adjudication** (default in `pmatch`) with fallback heuristic mode:
- `drift_config.mode = "dual-extractor" | "heuristic"`
- exactly two `extractor_claim_sets` required in dual mode.

3. Drift artifacts now require explicit adjudication metadata:
- `mode`, `extractors`, `conflicts_resolved`, `resolution_policy`.

4. Fact-check closure is tighter in adversarial review:
- no critical/high finding can remain with `inconclusive` fact-check status.

5. Planning discipline is stronger but practical:
- target task-group size is 3-6,
- intentional deviations require `scope_override.reason`.

6. Design evidence is enforced at schema level:
- `research[].verified_at` is required.

7. Repo verify now enforces lint + format-check + build + tests for both runtime skill packages.
8. New top-level phases `quality-static`, `quality-tests`, and `release-readiness` are integrated into the canonical stage order.

## Runtime Architecture

```mermaid
flowchart LR
  subgraph INIT["Run bootstrap"]
    A["scripts/pipeline-init.sh"] --> B[".pipeline/pipeline-state.json"]
    A --> C[".pipeline/runs/<run-id>/*"]
  end

  subgraph ADAPTERS["Stage adapters"]
    D["orchestration-arm"]
    E["orchestration-design"]
    F["orchestration-ar"]
    G["orchestration-plan"]
    H["orchestration-pmatch"]
    I["orchestration-build"]
    J["orchestration-quality-static"]
    K["orchestration-quality-tests"]
    L["orchestration-postbuild"]
    M["orchestration-release-readiness"]
    N["orchestration-pipeline"]
  end

  subgraph RUNTIME["Runtime skills"]
    O["quality-gate"]
    P["multi-model-review"]
  end

  subgraph CONTRACTS["Contracts"]
    Q["contracts/artifacts/*.schema.json"]
    R["contracts/quality-gate.schema.json"]
  end

  D --> O
  E --> O
  F --> P
  F --> O
  G --> O
  H --> P
  H --> O
  I --> H
  I --> O
  J --> O
  K --> O
  L --> O
  M --> O

  O --> Q
  O --> R
  P --> Q

  N --> D
  N --> E
  N --> F
  N --> G
  N --> H
  N --> I
  N --> J
  N --> K
  N --> L
  N --> M
```

## Key Contracts (Strengthened)

- `contracts/artifacts/design-document.schema.json`
  - `research[].verified_at` is required.

- `contracts/artifacts/execution-plan.schema.json`
  - `task_groups[].scope_override.reason` is available for justified deviations from target task granularity.

- `contracts/artifacts/drift-report.schema.json`
  - `adjudication` is required.
  - `claims[].extractor` is required.
  - `claims[].confidence` is optional (0..1).

- `skills/dev-tools/multi-model-review/schemas/input.schema.json`
  - `drift_config.mode` supports `heuristic` and `dual-extractor`.
  - `dual-extractor` requires exactly two `extractor_claim_sets`.

- `skills/dev-tools/multi-model-review/schemas/output.schema.json`
  - drift output includes required `adjudication` metadata.

- `contracts/artifacts/release-readiness.schema.json`
  - release decision and ship-readiness evidence are required before closure.

## Verification Model

`./scripts/verify.sh` runs:
1. skill validation,
2. stale reference checks,
3. orchestration integrity checks,
4. lint+format-check+build+tests for runtime packages.

The orchestration integrity step (`scripts/check-orchestration-integrity.sh`) verifies:
- adapter presence for all pipeline stages,
- expected gate filenames per adapter,
- stage-order consistency between pipeline adapter and playbook,
- phase coverage in `contracts/quality-gate.schema.json`.

## Repository Layout

```text
.codex/skills/orchestration/          core orchestration playbook
.cursor/skills/orchestration-*/       11 Cursor adapters (arm, design, ar, plan, pmatch, build, quality-static, quality-tests, post-build, release-readiness, pipeline)
contracts/artifacts/                  artifact schemas
contracts/quality-gate.schema.json    gate result schema
skills/dev-tools/quality-gate/        schema + criteria gate runtime
skills/dev-tools/multi-model-review/  review merge, cost/risk, drift adjudication runtime
scripts/pipeline-init.sh              run bootstrap
scripts/check-orchestration-integrity.sh
scripts/verify.sh                     repo verification entrypoint
docs/pipeline/                        pipeline state template
```

## API Independence

Runtime packages do not call paid model APIs and do not require API keys.

The system expects a runner that can:
- launch parallel worker contexts,
- read/write local artifacts,
- access live documentation/search tools when design/review phases need grounding.

## Using This Repo Across Runners

The contracts and runtime packages are runner-agnostic. Adapt only the orchestration layer per platform.

- Codex: use `.codex/skills/orchestration/SKILL.md`.
- Cursor: use `.cursor/skills/orchestration-*/` adapters.
- Any other runner: keep the same contracts, artifacts, and gate semantics.

## Requirements

- Node.js >= 20
- npm
- Python 3

## Quickstart

```bash
./scripts/verify.sh
./scripts/pipeline-init.sh
```

## Local Development

```bash
cd skills/dev-tools/quality-gate && npm ci && npm run lint && npm run format:check && npm run build && npm test
cd skills/dev-tools/multi-model-review && npm ci && npm run lint && npm run format:check && npm run build && npm test
```

## Deprecated Material

Legacy local-only files are moved to `deprecated/` and intentionally git-ignored.

## License

See `LICENSE`.
