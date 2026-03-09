# Phased Agent Orchestration

A framework for shipping software with AI agents without letting quality drift. Each stage has a clear job, a typed artifact, and a gate — no stage moves forward until its output is validated.

## The Problem

AI-assisted development workflows typically fail for predictable reasons:

- Ideas are vague when implementation starts
- Design choices are not grounded in real repo constraints
- Builders validate their own work
- Quality and security checks happen too late

## The Solution

A 10-stage pipeline with strict gates, scoped context, and explicit handoffs:

```
arm → design → adversarial-review → plan → pmatch → build → quality-static → quality-tests → post-build → release-readiness
```

| Stage | Purpose | Output |
|-------|---------|--------|
| **Intake** (`arm`) | Turn fuzzy input into explicit requirements | `brief.json` |
| **Design** (`design`) | Evidence-backed architecture from validated constraints | `design.json` |
| **Adversarial Review** (`adversarial-review`) | Independent specialist critique from multiple perspectives | `review.json` |
| **Execution Plan** (`plan`) | Atomic, testable task groups with no ambiguity | `plan.json` |
| **Drift Match** (`pmatch`) | Dual-extractor drift detection between plan and implementation | `drift-reports/pmatch.json` |
| **Build** (`build`) | Parallel implementation with strict scope boundaries | `build-gate.json` |
| **Quality Static** (`quality-static`) | Lint, format, and type checks | `quality-static-gate.json` |
| **Quality Tests** (`quality-tests`) | Test verification | `quality-tests-gate.json` |
| **Post-Build** (`post-build`) | Security review, denoise, and audit aggregation | `postbuild-gate.json` |
| **Release Readiness** (`release-readiness`) | Semver, changelog, migration, rollback, and approvals | `release-readiness-gate.json` |

## Key Design Principles

1. **Context scoping over context stuffing.** Each stage gets only the artifacts it needs, not the full conversation history. More context is not always better — information density matters.

2. **Hub-and-spoke over all-to-all.** Parallel workers (reviewers, builders, extractors) are coordinated by a lead, not connected to each other. This reduces coordination overhead from O(n²) to O(n).

3. **Gates reduce error propagation.** A defect caught at a gate costs less than one that compounds through downstream stages. Every stage has a required pass/fail gate.

> For the formal mathematical foundation behind these principles, see [`docs/SCIENTIFIC_FOUNDATION.md`](docs/SCIENTIFIC_FOUNDATION.md).

## Architecture

The system has two layers:

- **Orchestration adapters** — agent guidance documents for 5 runners (Claude, Codex, Cursor, Gemini, Kilo), generated from shared templates
- **Runtime skills** — deterministic Node.js packages that perform validation, review, and trace collection (no model API calls)

```
adapters/templates/     → source of truth for stage guidance
adapters/<runner>/      → generated per-runner stage adapters
contracts/artifacts/    → JSON Schema validation for all artifacts
skills/dev-tools/       → runtime validation packages
scripts/pipeline/       → pipeline runner CLI
```

### Runtime Skills

| Package | Purpose |
|---------|---------|
| `quality-gate` | Schema validation + acceptance criteria evaluation |
| `multi-model-review` | Finding dedup, cost/benefit analysis, drift detection |
| `trace-collector` | Execution trace validation + run summaries |

All runtime packages are deterministic — they do not call external model APIs and do not require API keys.

## Getting Started

### Requirements

- Node.js >= 20
- npm
- Python 3

### Install and Verify

```bash
npm install
./scripts/verify.sh
```

### Initialize a Pipeline Run

```bash
./scripts/pipeline-init.sh
```

### Run a Stage

```bash
node scripts/pipeline/runner.mjs run-stage \
  --run-id <id> \
  --phase arm \
  --config-id phased_default
```

### Fast Verification (Changed Packages Only)

```bash
./scripts/verify.sh --changed-only
```

## Using with Different Runners

The contracts and runtime packages are runner-agnostic. Each supported runner has generated adapter files:

| Runner | Entry point |
|--------|-------------|
| Claude | `adapters/claude/skills/orchestration-pipeline/SKILL.md` |
| Codex | `adapters/codex/skills/orchestration-pipeline/SKILL.md` |
| Cursor | `adapters/cursor/skills/orchestration-pipeline/SKILL.md` |
| Gemini | `adapters/gemini/skills/orchestration-pipeline/SKILL.md` |
| Kilo | `adapters/kilo/skills/orchestration-pipeline/SKILL.md` |

To regenerate adapters after template changes:

```bash
python3 scripts/adapters/generate_adapters.py
python3 scripts/adapters/generate_adapters.py --check  # verify sync
```

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/INDEX.md`](docs/INDEX.md) | Documentation navigation |
| [`docs/RUNBOOK.md`](docs/RUNBOOK.md) | Verification commands and troubleshooting |
| [`docs/SCIENTIFIC_FOUNDATION.md`](docs/SCIENTIFIC_FOUNDATION.md) | Formal mathematical model and research citations |
| [`docs/SCIENTIFIC_IMPLEMENTATION_MAP.md`](docs/SCIENTIFIC_IMPLEMENTATION_MAP.md) | Theory-to-code mapping |
| [`docs/PLATFORMS.md`](docs/PLATFORMS.md) | Platform adapter support model |
| [`docs/ORCHESTRATION_POLICY.md`](docs/ORCHESTRATION_POLICY.md) | Fan-out policy and budget controls |
| [`docs/REPO_MAP.md`](docs/REPO_MAP.md) | Directory and file organization |

## Contributing

- Run `./scripts/verify.sh` before submitting changes
- Keep diffs small and focused
- Artifacts validate against `contracts/artifacts/*.schema.json`
- See [`AGENTS.md`](AGENTS.md) for detailed repository rules

## License

[MIT](LICENSE)
