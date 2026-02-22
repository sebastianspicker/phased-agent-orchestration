<!-- markdownlint-disable MD013 -->

# Scientific & Engineering Rationale — Implementation Map for _Phased Agent Orchestration_

This document explains **(a)** the information-theoretic problem that breaks “big-context” agent workflows, **(b)** the scientific rationale behind **phased orchestration**, and **(c)** how this repository implements those ideas via **typed artifacts**, **quality gates**, **context scoping**, and **separation-of-duties**.

> **Core thesis**: Reliability in agentic software delivery is achieved less by “smarter prompts” and more by **institutional structure**: narrow context, explicit handoffs, verifiable artifacts, independent checks, and hard gates.

---

## 1) Why this repo exists (and why the “playground” approach collapses)

The repository intentionally moved away from a “many patterns in parallel” playground into a **phased pipeline** with strict validation and scoped context.

Two forces drive this:

1. **Large context windows do not scale linearly in value**
2. **Many concurrent agents create a coordination tax that grows superlinearly**

The resulting failure mode is predictable:

- More context → more irrelevant tokens → more noise
- More parallel patterns/contributors → more disagreements, duplicates, contradictions
- Planning/coding/auditing blur → agents “self-certify” their own output → drift accumulates until it’s expensive to fix

This repo’s countermeasure is a simple rule:

> **No stage can move forward until its output is validated.**

---

## 2) System architecture: two layers + contracts + gates

This repository is designed as **two separable layers**:

### 2.1 Orchestration layer (runner-specific)

- Codex playbook: **`../.codex/skills/orchestration/SKILL.md`**
- Cursor adapters: **`../.cursor/skills/orchestration-*/SKILL.md`**

These files define _how_ a runner should execute each stage and what artifacts/gates it must produce.

### 2.2 Runtime layer (runner-agnostic)

- Quality gate runtime: **`../skills/dev-tools/quality-gate/`**
- Review/drift runtime: **`../skills/dev-tools/multi-model-review/`**
- Artifact & gate schemas: **`../contracts/`**

These components are intentionally **API-independent** (no paid model API calls required). They validate, merge, adjudicate, and gate.

### 2.3 Contracts (typed artifacts)

Each phase produces an artifact validated against `../contracts/artifacts/*.schema.json`.

Key contracts include:

- `../contracts/artifacts/brief.schema.json`
- `../contracts/artifacts/design-document.schema.json`
- `../contracts/artifacts/review-report.schema.json`
- `../contracts/artifacts/execution-plan.schema.json`
- `../contracts/artifacts/drift-report.schema.json`
- `../contracts/artifacts/quality-report.schema.json`
- `../contracts/artifacts/release-readiness.schema.json`

### 2.4 Gate schema (universal)

All gates converge on:

- `../contracts/quality-gate.schema.json`

Gates are emitted as structured pass/fail/warn results and block progression on failure.

---

## 3) Canonical pipeline: phases, artifacts, gates, adapters

The pipeline order is canonical:

```text
arm -> design -> adversarial-review -> plan -> pmatch -> build
-> quality-static -> quality-tests -> post-build -> release-readiness
```

### 3.1 Phase-by-phase mapping (what lives where)

#### Phase: `arm` (Requirements crystallization)

- Cursor adapter: `../.cursor/skills/orchestration-arm/SKILL.md`
- Artifact schema: `../contracts/artifacts/brief.schema.json`
- Artifact output path: `.pipeline/runs/<run-id>/brief.json`
- Gate output path: `.pipeline/runs/<run-id>/gates/arm-gate.json`

**Gate intent**: enforce decision completeness (e.g., `open_questions` must be empty).

---

#### Phase: `design` (First-principles, evidence-backed design)

- Cursor adapter: `../.cursor/skills/orchestration-design/SKILL.md`
- Artifact schema: `../contracts/artifacts/design-document.schema.json`
- Artifact output path: `.pipeline/runs/<run-id>/design.json`
- Gate output path: `.pipeline/runs/<run-id>/gates/design-gate.json`

**Scientific intent**: stop “design by model memory”. The contract requires `research[].verified_at` timestamps to force explicit grounding.

---

#### Phase: `adversarial-review` (Parallel specialist critique + fact-check)

- Cursor adapter: `../.cursor/skills/orchestration-ar/SKILL.md`
- Artifact schema: `../contracts/artifacts/review-report.schema.json`
- Artifact output path: `.pipeline/runs/<run-id>/review.json`
- Gate output path: `.pipeline/runs/<run-id>/gates/adversarial-review-gate.json`

**Key mechanism**: reviewer outputs are consolidated via the runtime skill:

- `../skills/dev-tools/multi-model-review/` (action type `review`)

**Hard constraint**: no critical/high finding may remain `inconclusive` at fact-check closure.

---

#### Phase: `plan` (Deterministic execution blueprint)

- Cursor adapter: `../.cursor/skills/orchestration-plan/SKILL.md`
- Artifact schema: `../contracts/artifacts/execution-plan.schema.json`
- Artifact output path: `.pipeline/runs/<run-id>/plan.json`
- Gate output path: `.pipeline/runs/<run-id>/gates/plan-gate.json`

**Coordination control**:

- target 3–6 tasks per group (max 8)
- file ownership is _exclusive_ (`file_ownership`: no file appears in more than one group)
- each task has test cases + acceptance criteria

---

#### Phase: `pmatch` (Mechanized drift detection with dual-extractor adjudication)

- Cursor adapter: `../.cursor/skills/orchestration-pmatch/SKILL.md`
- Artifact schema: `../contracts/artifacts/drift-report.schema.json`
- Artifact output path: `.pipeline/runs/<run-id>/drift-reports/pmatch.json`
- Gate output path: `.pipeline/runs/<run-id>/gates/pmatch-gate.json`

**Default mode**: `dual-extractor` (two independent claim extractors).  
**Adjudication metadata is mandatory** (`mode`, `extractors`, `conflicts_resolved`, `resolution_policy`).

Runtime adjudicator:

- `../skills/dev-tools/multi-model-review/` (action type `drift-detect`)

---

#### Phase: `build` (Coordinated parallel implementation + conformance check)

- Cursor adapter: `../.cursor/skills/orchestration-build/SKILL.md`
- Artifact output: implementation changes + `.pipeline/.../gates/build-gate.json`

**Non-negotiables**:

- lead coordinates, builders implement
- builders see only their task group scope
- post-build conformance check uses `pmatch` plan vs implementation

---

#### Phase: `quality-static` (Lint/format/type/build as a hard gate)

- Cursor adapter: `../.cursor/skills/orchestration-quality-static/SKILL.md`
- Artifact schema: `../contracts/artifacts/quality-report.schema.json` (`audit_type = static`)
- Output path: `.pipeline/.../quality-reports/static.json`
- Gate path: `.pipeline/.../gates/quality-static-gate.json`

---

#### Phase: `quality-tests` (Predeclared tests as a dedicated gate)

- Cursor adapter: `../.cursor/skills/orchestration-quality-tests/SKILL.md`
- Artifact schema: `../contracts/artifacts/quality-report.schema.json` (`audit_type = tests`)
- Output path: `.pipeline/.../quality-reports/tests.json`
- Gate path: `.pipeline/.../gates/quality-tests-gate.json`

---

#### Phase: `post-build` (denoise + audits + security fix-loop)

- Cursor adapter: `../.cursor/skills/orchestration-postbuild/SKILL.md`
- Artifact schema: `../contracts/artifacts/quality-report.schema.json` (multiple audit types)
- Outputs:
  - `.pipeline/.../quality-reports/denoise.json`
  - `.pipeline/.../quality-reports/frontend.json`
  - `.pipeline/.../quality-reports/backend.json`
  - `.pipeline/.../quality-reports/docs.json`
  - `.pipeline/.../quality-reports/security.json`
- Gate: `.pipeline/.../gates/postbuild-gate.json`

**Security is special**: the quality schema enforces:

- mandatory category coverage
- fix-loop evidence (`before` vs `after`, rescan completed)
- accepted-risk requires `owner` + `expiry`

---

#### Phase: `release-readiness` (final ship gate)

- Cursor adapter: `../.cursor/skills/orchestration-release-readiness/SKILL.md`
- Artifact schema: `../contracts/artifacts/release-readiness.schema.json`
- Output: `.pipeline/.../release-readiness.json`
- Gate: `.pipeline/.../gates/release-readiness-gate.json`

This phase forces explicit:

- semver impact
- changelog update
- migration requirements (validated for major)
- rollback plan ownership + tested
- approvals

---

## 4) Runtime tools: how gating and adjudication are mechanized

### 4.1 `quality-gate` runtime skill

Location:

- `../skills/dev-tools/quality-gate/`

It validates:

1. **schema compliance** (JSON Schema)
2. **acceptance criteria** (lightweight checks) that block progression

The input schema supports criteria types such as:

- `field-exists`
- `field-empty`
- `count-min`
- `regex-match`

This means phases can express gates like:

- `open_questions` must be empty (arm)
- `research[].verified_at` must exist (design)
- “no TODO placeholders” in plan code_patterns (plan)

### 4.2 `multi-model-review` runtime skill

Location:

- `../skills/dev-tools/multi-model-review/`

This is the “adjudication engine” for:

- adversarial review consolidation (`action.type = review`)
- drift detection adjudication (`action.type = drift-detect`)

It produces structured outputs with:

- deduplicated findings
- fact-check statuses
- cost/benefit and recommendations
- drift claims + adjudication metadata

Crucially: it performs **no paid API calls**; it expects the runner (Cursor tasks / agent teams) to generate the raw findings/claims, and then it “institutionalizes” them into a deterministic artifact.

---

## 5) Verification harness: preventing the orchestration from rotting

The repo includes a “meta” rule: the pipeline must be able to verify itself.

### 5.1 One command to verify the entire repo

Run:

```bash
./scripts/verify.sh
```

This performs:

1. skill validation
2. stale reference checks
3. orchestration integrity checks
4. lint/format-check/build/test for runtime packages

### 5.2 Orchestration integrity checks (why this matters)

The integrity check script enforces:

- every pipeline stage has an adapter
- every adapter references its expected gate filename
- stage order consistency between pipeline adapter and orchestration playbook
- phase coverage exists in contracts/quality-gate.schema.json
- pmatch adapter must include dual-extractor references

This is an internal consistency theorem: if any of these invariants break, the orchestration is no longer scientifically testable (because you can’t even assert what “correct progression” means).

## 6. Mathematical rationale: why “phased, gated, scoped” beats “big context + many patterns”

### 6.1 Context is noise: an information-theoretic view

Let a context window be a sequence of tokens $X$ composed of:

- relevant signal $S$
- irrelevant content (noise) $N$

So $X = (S, N)$.

A useful proxy for “how learnable/useful the context is” for a given task $Y$ is mutual information:

$$
I(X; Y) = I(S,N;Y) = I(S;Y) + I(N;Y \mid S)
$$

In practice, $I(N;Y \mid S)$ is close to 0 (noise rarely helps) but it still consumes attention and increases the risk of spurious correlations.

A phase-scoped system implicitly optimizes a “mutual information per token” objective:

$$
\max_{\text{context}} \ \frac{I(X;Y)}{|X|}
$$

Phased orchestration improves this ratio by:

- reducing $|X|$ (tight context boundaries)
- maintaining $I(S;Y)$ by ensuring each phase receives only the required artifacts

This is exactly why this repo forbids carrying full conversational history across phases and instead transfers only typed artifacts.

---

### 6.2 Coordination tax: why many agents or patterns can get worse

With $n$ concurrent contributors, naive coordination overhead often scales like the number of pairwise interactions:

$$
C(n) \propto \binom{n}{2} = \frac{n(n-1)}{2}
$$

Even if each agent adds useful work $D_i$, total performance $P(n)$ can degrade:

$$
P(n) = \sum_{i=1}^{n} D_i - C(n)
$$

This repo reduces $C(n)$ structurally via:

- bounded task groups (3–6 tasks, max 8)
- exclusive file ownership (no shared writes)
- separation of duties (builders don’t certify)
- gated progression (failure halts the pipeline early)

---

### 6.3 Dual-extractor drift adjudication: reducing error by independent extraction

Assume two independent extractors produce claim verifications.
Let each extractor have probability $p$ of producing an incorrect verification for a given claim.

If their errors are independent, the probability both are wrong is:

$$
P(\text{both wrong}) = p^2
$$

So with $p = 0.2$, we get:

$$
p^2 = 0.04
$$

The dual-extractor mechanism therefore reduces “confidently wrong drift decisions” by an order of magnitude if independence is preserved.

This is why:

- extractor cross-talk is forbidden
- adjudication metadata is required
- dual-extractor is the default (heuristic mode is fallback-only)

---

### 6.4 Gates as an “absorbing” progression model

Each phase transition is permitted only on pass.
Model the pipeline as a Markov process over stage states:

- $s_i$: phase $i$
- $f_i$: failure state for phase $i$

With a gate, failures become absorbing states until remediation occurs (external intervention), which prevents silent drift accumulation.

This is the core safety property:

Bad states do not propagate forward.

---

## 7. Scientific framing: “judgment-centric agentic engineering”

The repo operationalizes a judgment-centric premise:

- Human judgment is the scarce asset
- Unverified code is a liability
- Therefore, the process must preserve intent and minimize unvalidated output

Mechanisms in this repo that encode that philosophy:

- /arm forces explicit decisions early (no “guessing requirements”)
- /design enforces evidence and repo alignment
- /ar enforces adversarial critique + fact-checking
- /plan forces predeclared verification
- /pmatch detects drift mechanistically (before it becomes expensive)
- quality gates enforce static, tests, docs, security
- release-readiness forces an explicit go/no-go governance artifact

---

## 8. What you can integrate next (research-backed extensions that fit this repo)

These additions strengthen scientific framing without breaking structure:

1. Add measurable pipeline metrics

- Drift rate: violated claims / total claims per pmatch run
- Gate failure rate per phase
- Rework ratio: fixes after vs before pmatch

1. Add “evidence bundles”

- Store sources used in design decisions as structured references (already partially covered by research[].verified_at).

1. Formalize “context budgets”

- Each stage could declare a max token budget and enforce “artifact-only transfer” discipline.

1. Institutionalize “model diversity” without hard dependencies

- Keep API-independence by allowing the runner to provide model outputs, while the runtime tool remains the deterministic adjudicator.

---

## 9. Appendix: minimal artifact examples

### 9.1 Brief (arm) — must close open questions

```json
{
  "requirements": [{ "id": "R1", "description": "...", "priority": "must" }],
  "constraints": [{ "type": "hard", "description": "...", "source": "user" }],
  "non_goals": [{ "description": "...", "reason": "..." }],
  "style": { "tone": "concise" },
  "key_concepts": [{ "term": "drift", "definition": "..." }],
  "decisions": [{ "decision": "...", "rationale": "..." }],
  "open_questions": []
}
```

### 9.2 Drift report (pmatch) — adjudication required

```json
{
  "source_document": { "type": "design", "ref": ".pipeline/.../design.json" },
  "target_document": { "type": "plan", "ref": ".pipeline/.../plan.json" },
  "claims": [
    {
      "id": "C1",
      "claim": "Plan defines verification commands for lint+tests",
      "verification_status": "verified",
      "evidence": "plan.json: verification_commands[...]",
      "extractor": "extractor-A",
      "confidence": 0.86
    }
  ],
  "findings": [
    { "description": "...", "severity": "high", "claim_ids": ["C7"] }
  ],
  "adjudication": {
    "mode": "dual-extractor",
    "extractors": ["extractor-A", "extractor-B"],
    "conflicts_resolved": 1,
    "resolution_policy": "prefer-evidence"
  }
}
```

## 10. TL;DR

This repository is a scientific answer to two failure modes:

1. Context dilution in large windows (signal-to-noise collapse)
2. Coordination tax in multi-agent / multi-pattern collaboration (too many cooks)

It solves them using:

- strict phase separation
- typed artifacts
- mechanized gates
- independent review/audit contexts
- drift detection with dual-extractor adjudication
- verification scripts that keep the orchestration internally consistent
