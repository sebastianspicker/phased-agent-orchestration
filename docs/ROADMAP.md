# Gap Analysis & Roadmap (Feb 2026)

## Implementation Status (Feb 22, 2026)

- [x] Gap A (P0): execution trace contract, runtime emission, and trace-collector validation/summaries are implemented.
- [x] Gap B (P0): evaluation-report contract, matrix runner, schema-validated tasksets, and metric aggregation are implemented.
- [x] Gap C (P1): context manifests and runtime budget gates (`count-max`, `number-max`) are implemented.
- [x] Gap D (P1): deterministic orchestration policy is documented, configured, and enforced at runtime.
- [x] Gap E (P1): end-to-end traceability linkage and MUST-coverage gates are implemented.
- [x] Gap F (P2): drift taxonomy, goldset, and precision/recall/F1 benchmark thresholds are implemented.

## Phased Agent Orchestration — Research Alignment and Closure Status

> **Goal of this document:** derive concrete improvements / next steps for
> `phased-agent-orchestration` from the repo’s own scientific framing _and_ from
> recent research on (1) long-context failure modes, (2) multi-agent
> orchestration cost/benefit, and (3) evaluation + observability of multi-agent
> systems.

This roadmap is designed to be **repo-native**:

- keep the workflow **phase-scoped** (no “accumulated chat soup”),
- keep validations **machine-checkable** (schemas + gates),
- keep runtime tooling **offline / runner-agnostic** where possible.

---

## Status Note (Feb 22, 2026)

All Gap A-F workstreams are implemented in repository code and active verification flows.
The analysis sections below are intentionally retained as scientific rationale and historical framing.

- Gap A: `contracts/artifacts/execution-trace.schema.json`, `scripts/pipeline/lib/trace.mjs`, `skills/dev-tools/trace-collector/`
- Gap B: `contracts/artifacts/evaluation-report.schema.json`, `scripts/eval/run-matrix.mjs`, `scripts/eval/aggregate.mjs`, `scripts/eval/lib/taskset-validate.mjs`
- Gap C: `contracts/artifacts/*context_manifest*`, `skills/dev-tools/quality-gate/src/lib/criteria.ts`, `scripts/pipeline/runner.mjs`
- Gap D: `docs/ORCHESTRATION_POLICY.md`, `docs/pipeline/pipeline-state.template.json`, `scripts/pipeline/lib/policy.mjs`
- Gap E: `contracts/artifacts/traceability-check.schema.json`, `scripts/pipeline/lib/traceability.mjs`, `scripts/pipeline/runner.mjs`
- Gap F: `docs/eval/drift_goldset/`, `scripts/eval/drift-benchmark.mjs`

---

## 0) TL;DR — What’s already strong, and what was initially missing

### What the repo already does well (and why this is scientifically aligned)

- **Phase separation + typed artifacts + hard gates**: deterministic control
  around non-deterministic generators (LLMs).
  (`contracts/artifacts/*.schema.json`, `contracts/quality-gate.schema.json`,
  `skills/dev-tools/quality-gate`)
- **Context minimization / scoped transfer**: explicitly prevents long-context
  “attention dilution” and “lost in the middle” effects.
- **Bounded multi-agent parallelism** (lead + workers, isolated reviewers) +
  dedup: reduces “too many cooks” coordination overload and correlated errors.
- **Mechanized drift detection** (including dual-extractor adjudication option):
  formalizes “design → plan → implementation” alignment and blocks
  self-certification.

### What was most missing in the initial analysis (now implemented)

1. **Standardized execution traces + system signals** (latency, cost, failures,
   tool-use, phase transitions) to enable reliable evaluation and debugging at
   scale. This is a central theme in recent MAS evaluation work (e.g., MAESTRO).
2. **An evaluation harness** that can answer: _Does this orchestration help vs.
   single-agent baselines under realistic constraints?_ (cost, latency,
   availability). This directly connects to recent findings that orchestration
   can be overestimated and only helps under certain differentials.
3. **Explicit context budgets + “context manifests”** per phase (what was
   loaded, why, and how big). This is the operational bridge between your theory
   (“context is noise”) and measurable engineering reality.
4. **End-to-end traceability**: requirement → design constraint → plan task →
   test case → implementation evidence → gate result. You have the right
   building blocks; the missing piece is a _first-class linking mechanism_
   across artifacts.

---

## 1) Current repo architecture (as the baseline for “what to improve”)

### 1.1 The “phased pipeline” is already encoded as an institutional control structure

The repo encodes the workflow as a canonical sequence (arm → design →
adversarial-review → plan → pmatch → build → quality-\* → release-readiness)
with explicit “advance only if gate passes” semantics.

### 1.2 Contracts + gates make outputs machine-checkable

- Artifact schemas define **structural contracts** (e.g., brief, design doc,
  review report, plan, drift report, quality report, release readiness).
- `quality-gate` validates schema + acceptance criteria and produces structured
  gate results with statuses and evidence.

### 1.3 Multi-model review and drift detection are already partially “formalized”

- Dedup uses token-overlap Jaccard similarity to reduce redundant findings
  (signal-to-noise improvement).
- Drift detection supports (a) heuristic matching and (b) dual-extractor
  adjudication where two independent claim sets are correlated and conflicts are
  resolved via a deterministic policy.

### 1.4 Your README’s “why the old playground degraded” matches known failure modes

The repo explicitly states it evolved from a broader orchestration playground
and became noisy as context grew and contributors multiplied (“signal-to-noise
degraded”, “too many cooks”).

---

## 2) Research signals (2023–2026) that should influence next steps

### 2.1 Long-context isn’t “free”; position effects are real

**Lost in the Middle** shows that performance can degrade significantly
depending on where relevant information appears, with models often doing better
when relevant info is near the beginning or end, and worse when it’s in the
middle of long contexts.

**Implication for this repo:**  
Your “phase-scoped context” principle is _directionally correct_, but the **next
maturity step** is to (a) _measure_ and (b) _enforce_ context budgets and
retrieval/ordering policies per phase.

### 2.2 Benchmarking long-context understanding is now standard practice

**LongBench** explicitly exists because “comprehensive benchmarks tailored for
evaluating long context understanding are lacking,” and it provides a multi-task
benchmark to evaluate long-context behavior.

**Implication for this repo:**  
To claim state-of-the-art alignment, you want a **repeatable evaluation
harness** that includes long-context stress tests and measures whether your
orchestration reduces failure probability _relative to baseline workflows_.

### 2.3 Multi-agent orchestration benefits are conditional, not automatic

**When Should We Orchestrate Multiple Agents?** warns orchestration strategies
can overestimate performance and underestimate costs, and argues orchestration
is effective only if there are performance/cost differentials between agents
under realistic constraints.

**Implication for this repo:**  
You should add an explicit _policy layer_ that decides **when to go
multi-agent** (and how many agents) based on budget + expected marginal value.

### 2.4 Evaluation & observability for MAS is becoming a first-class research area

**MAESTRO** positions itself as an evaluation suite for
testing/reliability/observability of LLM-based multi-agent systems, emphasizing
standardized configuration/execution and exporting framework-agnostic traces and
system-level signals (latency/cost/failures).

**Implication for this repo:**  
The design was already close conceptually (phase state + gates), but it lacked
a first-class **trace layer** to make behavior empirically inspectable and comparable.

---

## 3) Gap analysis (repo vs. historical baseline)

### Gap A — Observability and trace standardization (P0)

**What you have:**

- `pipeline-state.template.json` tracks phases and completed gates.
- `quality-gate` reports execution time and logs for that tool execution.

**What was missing in the original baseline (state-of-the-art expectation):**

- A **run-level execution trace** that spans the entire pipeline and includes:
  - phase transitions,
  - which artifacts were read/written,
  - which agents/models participated (even as abstract tiers),
  - system signals: latency, costs, failures, retries,
  - tool-use metadata,
  - gate outcomes + blockers.

This aligns directly with MAESTRO’s emphasis on framework-agnostic traces and
system-level signals.

**Implemented repository changes (Feb 2026):**

1. Added the execution trace contract:
   - `contracts/artifacts/execution-trace.schema.json`
2. Added run-level trace artifacts:
   - `.pipeline/runs/<run_id>/trace.jsonl` (append-only event stream)
   - `.pipeline/runs/<run_id>/trace.summary.json` (collector summary)
3. Added and integrated the runtime trace validator/summarizer:
   - `skills/dev-tools/trace-collector/`
   - `scripts/pipeline/lib/trace.mjs`
   - `scripts/pipeline/runner.mjs`

#### Recommended minimal trace event model (JSONL)

```json
{
  "ts": "2026-02-22T12:00:00Z",
  "event": "phase_start",
  "phase": "design",
  "run_id": "..."
}
{
  "ts": "...",
  "event": "artifact_read",
  "phase": "design",
  "path": ".pipeline/runs/.../brief.json",
  "bytes": 12345
}
{
  "ts": "...",
  "event": "agent_call",
  "phase": "design",
  "tier": "high_reasoning",
  "model_hint": "(optional)",
  "tokens_in": 1234,
  "tokens_out": 567
}
{
  "ts": "...",
  "event": "gate_result",
  "phase": "design",
  "status": "pass",
  "gate_id": "design-gate",
  "blocking_failures": []
}
```

This preserves your runner-agnostic philosophy: tier is required; `model_hint`,
`tokens_*`, `cost_*` are optional but strongly recommended.

### Gap B — Quantitative evaluation harness (P0)

**What you have:**

- The scientific doc already suggests metrics: pass/fail rates, drift trends,
  dedup ratio, time-to-closure.

**What was missing in the original baseline:**

- A repeatable, comparable evaluation harness across runs and configurations:
- baseline (single-agent, no phased gates),
- phased pipeline (current),
- phased + N reviewers,
- phased + context budget enforcement,
- phased + different drift modes.

This is crucial given research warning that orchestration can be mis-costed and
only helps under certain differentials.

**Implemented repository changes (Feb 2026):**

- Added the evaluation report artifact contract:
  - `contracts/artifacts/evaluation-report.schema.json`
- Added a taskset contract plus strict schema validation:
  - `contracts/eval-taskset.schema.json`
  - `scripts/eval/lib/taskset-validate.mjs`
- Added matrix execution + aggregation flow:
  - `scripts/eval/run-matrix.sh`
  - `scripts/eval/run-matrix.mjs`
  - `scripts/eval/aggregate.mjs`
  - `.pipeline/evaluations/<eval_id>/evaluation-report.json`

#### Minimal metrics set (scientifically defensible)

Let:

- $G_k \in \{\text{pass}, \text{fail}, \text{warn}\}$ gate status for phase $k$
- $T_k$ = phase duration
- $D$ = drift score between design and implementation

You already define drift conceptually; formalize in evaluation:

$$
\mathrm{Drift}(D,X)=
\frac{\sum_{c\in\mathcal{C}(D)} w_c \cdot \mathbf{1}[\neg c(X)]}
{\sum_{c\in\mathcal{C}(D)} w_c}
$$

(Your scientific foundation uses this style of definition.)

Then track:

- Pipeline success rate:
  $\frac{\#\text{runs with all mandatory gates pass}}{\#\text{runs}}$
- Mean drift and drift tail risk (e.g., 95th percentile)
- Dedup ratio:

$$
\rho_{\text{dedup}} = \frac{|F_{\text{raw}}|}{|F_{\text{dedup}}|}
$$

(multi-model-review explicitly deduplicates findings.)

- Security time-to-closure: derived from quality-report fix-loop rounds and
  critical/high counts.

Why this matters (long-context + MAS research):

- Long-context evaluation is now standard (LongBench).
- MAS evaluation is shifting toward trace + signals, not just “final
  correctness”.

---

### Gap C — Explicit context budgets + “context manifest” (P1)

**What you have:**

- You state the principle and give the information-theoretic motivation: add
  noise -> increase $H(C)$ without increasing $I(I;C)$.
- Your pipeline config already encodes cognitive tiers per phase.

**What was missing in the original baseline:**

- A measurable representation of “what context was used” per phase.
- A gateable budget (token or approximate size).

This matters because “Lost in the Middle” shows long-context usage degrades
depending on relevance position. The operational fix is not just “use less
context,” but enforce curated context selection and ordering.

**Implemented repository changes (Feb 2026):**

- Added optional `context_manifest` to artifact schemas:
  - `files_loaded`: list of file paths + byte sizes
  - `docs_loaded`: list of URLs + `retrieved_at`
  - `selection_policy`: free text + parameters
  - `token_estimate` or `char_count_estimate`
- Added quality-gate criterion types:
  - `count-max` for list lengths (`files_loaded <= K`)
  - `number-max` for `token_estimate <= budget`
- Added runtime budget enforcement in `scripts/pipeline/runner.mjs` with shadow/enforce behavior via `context_budget_v1`.

(You currently support `field-exists`, `field-empty`, `count-min`,
`regex-match`.)

Math justification (already in your foundation): you define attention weights:

$$
a_i = \frac{\exp(q\cdot k_i)}{\sum_{j=1}^{L}\exp(q\cdot k_j)}
$$

and argue adding irrelevant tokens increases the denominator, reducing mass
allocated to true signal tokens.

A practical engineering corollary: “budget + selection policy” is not
optional—it is the mechanism that turns the theory into control.

---

### Gap D — Orchestration policy: when to use multiple agents and how many (P1)

**What you have:**

- Strong “coordination tax” modeling and the “star topology reduces edges from
  O(n²) to O(n)” rationale.
- A cognitive tiering plan in pipeline config.

**What was missing in the original baseline:**

- A decision procedure to choose:
- single-agent vs multi-agent,
- number of reviewers/builders,
- whether to run a phase in parallel or sequentially.

This is especially important because the 2025 orchestration paper argues
orchestration isn’t always beneficial; it depends on performance/cost
differentials under realistic conditions.

**Implemented repository changes (Feb 2026):**

- Added `config.orchestration_policy` to pipeline-state template:
  - `max_reviewers`, `max_builders`
  - `budget_usd` (optional), `latency_budget_s` (optional)
  - `min_expected_gain` threshold
- Added a policy specification in docs:
  - `docs/ORCHESTRATION_POLICY.md`
- Added runtime policy computation:
  - `scripts/pipeline/lib/policy.mjs`
  - Policy decisions emitted as `agent_call` trace events in `scripts/pipeline/runner.mjs`.

A simple policy model (start here)

Let:

- $Q(n)$ be expected quality (or error reduction) with $n$ agents
- $C_{\text{coord}}(n)$ coordination cost
- $C_{\text{inf}}(n)$ inference/runtime cost

Orchestrate if:

$$
\Delta(n) = \big(Q(n)-Q(1)\big) -
\lambda\big(C_{\text{inf}}(n)-C_{\text{inf}}(1)\big) -
\mu C_{\text{coord}}(n) > 0
$$

Use your existing coordination model:

$$
C_{\text{coord}}(n)\approx \alpha\frac{n(n-1)}{2}
\quad\text{(unstructured)}
\qquad
C_{\text{coord}}(n)\approx \alpha(n-1)
\quad\text{(hub-and-spoke)}
$$

and explicitly prefer hub-and-spoke (lead + workers) because it scales linearly
in edges.

This ties your mathematical justification to a concrete control knob.

### Gap E — End-to-end traceability across artifacts (P1)

**What you have:**

- The brief schema gives requirements IDs.
- The plan schema exists and can list tests/verification.
- Gates produce structured pass/fail outputs.

**What was missing in the original baseline:**

- A required linkage like:
- tasks reference `requirement_ids`
- tests reference `requirement_ids`
- drift claims reference `requirement_ids` or `constraint_ids`

Without this, you can’t compute:

- “coverage of MUST requirements by tests”
- “coverage of constraints by drift checks”
- “which requirement caused a gate failure”

**Implemented repository changes (Feb 2026):**

- Updated schemas with traceability fields:
  - `trace_id` on every requirement/constraint
  - `covers: ["REQ-1", "REQ-7"]` on tasks and tests
- Added traceability gate enforcement:
  - plan phase: MUST coverage by plan tasks + plan tests
  - build phase: MUST coverage by plan tasks + plan tests + drift claims
  - design linkage: warning-only (non-blocking)
  - implementation: `contracts/artifacts/traceability-check.schema.json`, `scripts/pipeline/lib/traceability.mjs`, `scripts/pipeline/runner.mjs`

This directly strengthens the repo’s “judgment-centric” claim: it makes intent
preservation auditable, not just stated.

---

### Gap F — Drift detection quality: from heuristics to measurable precision/recall

(P2)

**What you have:**

- A heuristic drift detector that uses:
- section heading presence checks,
- keyword overlap,
- deterministic threshold mapping.
- A dual-extractor mode where two independent claim sets are correlated via
  token similarity and adjudicated.

**What was missing in the original baseline:**

- Drift detection is only as good as claim extraction quality. Right now, claim
  extraction is implied (external agents produce claims), but you don’t have:
- a standardized claim taxonomy,
- an evaluation dataset,
- measures of false positives / false negatives.

**Implemented repository changes (Feb 2026):**

- Standardized drift claim types:
  - e.g., interface, invariant, security, performance, doc
- Added a versioned goldset:
  - `docs/eval/drift_goldset/` with known design/plan pairs and expected drift
    findings
- Added dual-mode benchmark and thresholds:
  - `scripts/eval/drift-benchmark.mjs` computes precision/recall/F1 per class and mode (`heuristic`, `dual-extractor`)
  - default thresholds: `precision >= 0.75`, `recall >= 0.65`, `f1 >= 0.70`

This aligns with the general trend in long-context benchmarking (LongBench) and
MAS evaluation (MAESTRO): you need systematic tests, not anecdotes.

---

## 4) Prioritized roadmap (historical baseline and closure)

P0 — “To be state-of-the-art credible”

- Completed: execution trace schema + trace event stream (`trace.jsonl`)
- Completed: evaluation harness producing `evaluation-report.json`
- Completed: metrics aggregation across matrix runs

P1 — “Make the theory enforceable”

- Completed: context manifests + per-phase budget gates
- Completed: orchestration policy (runtime fanout decisions)
- Completed: end-to-end traceability (requirements -> tasks -> tests -> drift)

P2 — “Improve measurement and robustness”

- Completed: drift taxonomy + goldset + precision/recall/F1 benchmark
- Review dedup: configurable similarity threshold + better tokenization
  (optional)
- Completed: regression coverage for gate criteria and schema evolution in runtime package tests

---

## 5) How to integrate MAESTRO-style ideas without losing runner-agnosticism

MAESTRO’s key ideas (standardize config/execution; export traces + system
signals) do not require you to adopt a specific agent framework.

A compatible approach for your repo:

- Define “adapter contracts” as data formats, not runtime dependencies:
- artifact JSON schemas,
- gate result schemas,
- trace event schemas,
- evaluation report schemas.
- Then provide lightweight example adapters in `adapters/` (optional):
- Cursor adapter already exists conceptually in `.cursor/skills/*`.
- You can add more without changing core principles.

---

## 6) Why these next steps preserve the repo’s identity

Your repo’s core stance is: reliability comes from institutional structure:

- phase separation,
- scoped context,
- separation of duties,
- mechanized gates.

Everything proposed here extends that same stance:

- traces make gates measurable at system level,
- evaluation harness makes claims repeatable,
- policies make parallelism economically rational,
- traceability makes intent preservation auditable.

That is exactly the difference between:

“we have a good process” and “we have a falsifiable, instrumented system.”

---

## References

- Liu et al. Lost in the Middle: How Language Models Use Long Contexts
  (arXiv:2307.03172).
- Bai et al. LongBench: A Bilingual, Multitask Benchmark for Long Context
  Understanding (arXiv:2308.14508).
- MAESTRO: Multi-Agent Evaluation Suite for Testing, Reliability, and
  Observability of LLM-based MAS (arXiv:2601.00481).
- Bhatt et al. When Should We Orchestrate Multiple Agents? (arXiv:2503.13577).
