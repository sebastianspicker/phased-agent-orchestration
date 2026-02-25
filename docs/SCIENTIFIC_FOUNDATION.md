<!-- markdownlint-disable MD013 -->

# Scientific Foundations of Phased Agent Orchestration

> **Contract-driven, quality-gated multi-agent delivery pipeline from idea to validated implementation.**  
> This document provides a scientific and mathematical rationale for _why phased orchestration_ is a principled response to the failure modes of large-context and multi-agent AI software workflows.

---

## Table of Contents

- [Abstract](#abstract)
- [1. The Core Problem](#1-the-core-problem)
  - [1.1 Context Dilution as an Information-Theoretic Failure Mode](#11-context-dilution-as-an-information-theoretic-failure-mode)
  - [1.2 Long Context is Not Free](#12-long-context-is-not-free)
  - [1.3 The Coordination Tax](#13-the-coordination-tax)
  - [1.4 Drift and Self-Certification](#14-drift-and-self-certification)
- [2. Principles](#2-principles)
  - [2.1 Judgment-Centric Engineering](#21-judgment-centric-engineering)
  - [2.2 Contracts and Gates](#22-contracts-and-gates)
  - [2.3 Phase-Scoped Context](#23-phase-scoped-context)
  - [2.4 Cognitive Tiering](#24-cognitive-tiering)
  - [2.5 Independent Adversarial Review](#25-independent-adversarial-review)
  - [2.6 Mechanized Drift Detection](#26-mechanized-drift-detection)
- [3. A Formal Model of the Pipeline](#3-a-formal-model-of-the-pipeline)
  - [3.1 Pipeline as a Finite-State Machine](#31-pipeline-as-a-finite-state-machine)
  - [3.2 Reliability Gains from Gates](#32-reliability-gains-from-gates)
  - [3.3 Optimal Team Size Under Coordination Cost](#33-optimal-team-size-under-coordination-cost)
- [4. How This Repository Implements These Principles](#4-how-this-repository-implements-these-principles)
  - [4.1 Canonical Phases and Typed Artifacts](#41-canonical-phases-and-typed-artifacts)
  - [4.2 Runtime Skills](#42-runtime-skills)
  - [4.3 Why the Old “Orchestration Playground” Degraded](#43-why-the-old-orchestration-playground-degraded)
- [5. Further Integrations](#5-further-integrations)
- [Glossary](#glossary)
- [References](#references)

---

## Abstract

LLM-based software workflows fail in predictable ways when they scale:

1. **Large contexts** cause **signal-to-noise collapse**: adding more tokens does _not_ guarantee adding more usable information.
2. **Many concurrent agents** cause **coordination overhead** and error amplification: more contributors can reduce throughput and quality (“too many cooks”).
3. **Planning → coding → auditing** often blurs into a single loop, enabling **self-certification** and **drift** (implementation diverges from intent/design).

**Phased Agent Orchestration** addresses these failure modes by applying:

- **phase separation** (one job per phase),
- **typed artifacts** (machine-checkable outputs),
- **hard quality gates** (no phase advances without validation),
- **scoped context** (no “accumulated chat soup”),
- **independent critique** (adversarial review and drift detection).

This is not just “process hygiene” — it is a rational architecture under information constraints.

---

## 1. The Core Problem

### 1.1 Context Dilution as an Information-Theoretic Failure Mode

Let:

- $I$ be the (latent) **human intent** (requirements, constraints, goals).
- $C$ be the **context** provided to an agent (prompt + repo info + docs + intermediate artifacts).
- $Y$ be the produced output (plan/design/code).

We want high alignment between intent and output. One lens is the **mutual information** between intent and what the agent _effectively_ uses:

$$
I(I;C) \quad \text{(how much information about intent is contained in context)}
$$

Now split context into **signal** and **noise**:

- $S$: intent-relevant information (constraints, spec, ground truth)
- $N$: irrelevant or weakly relevant information (stale prompts, parallel patterns, old discussions)

So:

$$
C = (S, N)
$$

If $N$ is approximately independent of intent given $S$ (typical for “extra fluff”), then:

$$
I(I;C) = I(I;S,N) = I(I;S) + I(I;N \mid S) \approx I(I;S)
$$

Meaning: **adding noise increases tokens but not intent information**.

A useful normalized measure is:

$$
\mathrm{SNR}_{\text{info}}(I \rightarrow C) \;=\; \frac{I(I;C)}{H(C)}
$$

Since $H(C)$ (entropy / description length) increases with noise, while $I(I;C)$ barely increases, the normalized signal-to-noise ratio drops:

$$
\mathrm{SNR}_{\text{info}} \downarrow \quad \text{as noise tokens grow}
$$

**Interpretation:** Larger context windows can create _worse reasoning_ because they can **dilute** relevant information with irrelevant material.

#### Attention Dilution (Mechanistic Intuition)

Transformer attention assigns weights:

$$
a_i = \frac{\exp(q \cdot k_i)}{\sum_{j=1}^{L}\exp(q \cdot k_j)}
$$

Adding $K$ additional irrelevant tokens increases the denominator. Under mild assumptions (irrelevant keys are not always trivially separable), the expected total mass allocated to true signal tokens decreases roughly with:

$$
\mathbb{E}\left[\sum_{i \in S} a_i\right] \approx \frac{|S|}{|S|+K}
$$

So even if the model _could_ pay attention to everything, real attention is **competitive**. More tokens means more competition.

---

### 1.2 Long Context is Not Free

Even ignoring reasoning degradation, long context has computational implications.

For standard self-attention, compute/memory scales ~quadratically with sequence length $L$:

$$
\text{Cost} \in \Theta(L^2)
$$

So increasing context length by factor $r$ can increase attention cost by ~ $r^2$.

**Implication:** Practical systems must optimize not just “what’s true” but “what’s worth loading.”

---

### 1.3 The Coordination Tax

Multi-agent systems introduce an overhead: every additional agent increases the **communication surface** and **state synchronization burden**.

A classic model (Brooks-style) is the number of pairwise communication channels in a fully connected team:

$$
E_{\text{complete}}(n) = \frac{n(n-1)}{2}
$$

If coordination cost per channel is $\alpha$, then:

$$
C_{\text{coord}}(n) \approx \alpha \cdot \frac{n(n-1)}{2} \in \Theta(n^2)
$$

**That is the “too many cooks” problem in math form.**

#### Star Topology Reduces Overhead

If you shift from group chat to a **hub-and-spoke** structure (one orchestrator + workers), edges become:

$$
E_{\text{star}}(n) = n-1 \in \Theta(n)
$$

So the architecture (communication topology) changes the scaling law.

**Phased orchestration** tends to enforce star-like coordination:

- the lead orchestrator assigns tasks,
- workers do scoped work,
- results are merged through gates and reviews — not free-form group chat.

---

### 1.4 Drift and Self-Certification

Let:

- $D$ be the **design artifact** (source of truth for architecture/constraints),
- $P$ be the **plan** (execution blueprint),
- $X$ be the **implementation** (code).

A common failure is:

$$
D \not\Rightarrow P \quad \text{and/or} \quad P \not\Rightarrow X
$$

Because humans and agents are fallible, and because each transformation is lossy.

Drift can be formalized as a divergence between required constraints and realized constraints. If we define a set of constraints $\mathcal{C}(D)$ extracted from design, then a drift score can be:

$$
\mathrm{Drift}(D, X) \;=\; \frac{\sum_{c \in \mathcal{C}(D)} w_c \cdot \mathbf{1}[\neg c(X)]}{\sum_{c \in \mathcal{C}(D)} w_c}
$$

Where:

- $c(X)$ is a predicate “implementation satisfies constraint $c$”
- $w_c$ weights severity/importance.

**Self-certification** is the anti-pattern where the same agent that created $X$ also declares $X$ correct without independent validation, causing correlated blind spots.

---

## 2. Principles

### 2.1 Judgment-Centric Engineering

A useful philosophical inversion:

- **Code** is a liability surface (bugs, security risk, maintenance).
- **Judgment** (clear intent, correct constraints, verified decisions) is the scarce asset.

Phased orchestration is designed to preserve judgment:

- capture intent explicitly before implementation,
- force evidence-backed design,
- require independent pressure-testing,
- mechanize drift checks and quality audits.

---

### 2.2 Contracts and Gates

Each phase emits an artifact $A_k$. A gate $G_k$ decides whether it is valid.

$$
A_k = f_k(A_{k-1}, \text{scoped context})
$$

$$
G_k(A_k) \in \{\text{pass}, \text{fail}\}
$$

Pipeline progression:

$$
\text{advance} \iff G_k(A_k) = \text{pass}
$$

This is a **design-by-contract** view:

- JSON schema validation ≈ structural contract
- acceptance criteria ≈ semantic contract
- “no advance on fail” ≈ enforced postcondition

---

### 2.3 Phase-Scoped Context

A core claim of the repo is:

> “Context is scoped per phase; no phase inherits prior conversation history.”

This implements **context min-maxing**:

- maximize relevance $S$,
- minimize noise $N$,
- avoid accumulating irrelevant prior discussion.

In information terms: aim to maximize $I(I;C)$ subject to a budget on $H(C)$.

---

### 2.4 Cognitive Tiering

Not all models/agents should do the same job. A rational allocation is:

- **High-reasoning lead**: strategy, synthesis, arbitration
- **Fast workers**: implementation, audits, mechanized checks

This matches the idea of minimizing **expensive reasoning cycles** while maximizing **checkable throughput**.

---

### 2.5 Independent Adversarial Review

Instead of “one agent tries to be correct,” you want **independent perspectives**.

If a failure is detected with probability $r$ by one reviewer, then with $m$ independent reviewers:

$$
P(\text{caught}) = 1 - (1-r)^m
$$

Even with moderate $r$, parallel review improves recall.

But independence matters: if reviewers share the same context soup, their errors correlate.

So the repo’s emphasis on **isolated reviewer contexts** is mathematically coherent: it increases the likelihood that blind spots differ.

---

### 2.6 Mechanized Drift Detection

Drift match is implemented as a claim-verification problem:

1. Extract claims $\mathcal{C}$ from source artifact (design/plan).
2. Verify each claim against target artifact (plan/implementation).
3. Produce a structured drift report.

#### Dual-Extractor Coverage Gain

If each extractor covers a true claim with probability $r$, using two independent extractors yields:

$$
P(\text{covered}) = 1 - (1-r)^2 = 2r - r^2
$$

Example: $r=0.7 \Rightarrow P(\text{covered}) = 0.91$

This justifies the repo’s default **dual-extractor adjudication** for pmatch.

#### Dedup and Similarity via Jaccard

To reduce repeated findings across reviewers, the repo uses token-overlap similarity:

$$
J(A,B) = \frac{|A \cap B|}{|A \cup B|}
$$

If $J(A,B) \ge \tau$, findings are treated as duplicates (merged), increasing signal-to-noise in review artifacts.

---

## 3. A Formal Model of the Pipeline

### 3.1 Pipeline as a Finite-State Machine

Let phases be states:

$$
\mathcal{S} = \{\text{arm}, \text{design}, \text{adversarial-review}, \text{plan}, \text{pmatch}, \text{build}, \text{quality-static}, \text{quality-tests}, \text{post-build}, \text{release-readiness}\}
$$

Transitions are conditional on gates:

$$
s_{k+1} = T(s_k, A_k) \quad \text{only if} \quad G_k(A_k)=\text{pass}
$$

This is a deterministic control structure around non-deterministic generators (LLMs).

---

### 3.2 Reliability Gains from Gates

Suppose phase $k$ has probability $p_k$ of introducing a defect into its artifact without a gate.

Let the gate detect such a defect with probability $d_k$ (detection power).

Then residual defect probability for that phase becomes:

$$
p_k^{\text{res}} = p_k(1-d_k)
$$

If defects are approximately independent across phases (a simplifying assumption), the probability that the final output contains at least one defect is:

$$
P_{\text{defect}} = 1 - \prod_{k=1}^{K} (1 - p_k^{\text{res}})
$$

Adding gates increases $d_k$, reducing $p_k^{\text{res}}$, and reducing total defect risk.

**Key: gating is a reliability multiplier.**

---

### 3.3 Optimal Team Size Under Coordination Cost

Let each agent add benefit $b$, and coordination cost be quadratic:

$$
S(n) = nb - \alpha \cdot \frac{n(n-1)}{2}
$$

Maximize $S(n)$. Approximate in continuous $n$:

$$
\frac{dS}{dn} = b - \alpha\left(n-\frac{1}{2}\right)
$$

Setting to zero:

$$
n^{*} \approx \frac{b}{\alpha} + \frac{1}{2}
$$

So if coordination costs rise, optimal team size shrinks.

The repo reduces $\alpha$ by:

- scoping tasks (file ownership),
- star-like orchestration (lead + workers),
- artifact handoffs instead of open discussion.

---

## 4. How This Repository Implements These Principles

### 4.1 Canonical Phases and Typed Artifacts

This repo defines canonical phase aliases:

`arm -> design -> adversarial-review -> plan -> pmatch -> build -> quality-static -> quality-tests -> post-build -> release-readiness`

Each phase produces a typed artifact (JSON) and a gate result.

Examples:

- `brief.json` (requirements crystallization)
- `design.json` (evidence-backed architecture)
- `review.json` (deduped adversarial findings + fact checks)
- `plan.json` (atomic task groups + verification)
- `drift-reports/pmatch.json` (adjudicated drift claims)
- `quality-reports/*.json` (static/tests/docs/security/denoise audits)
- `release-readiness.json` (final go/no-go evidence)

### 4.2 Runtime Skills

This repository includes three key runtime packages:

1. **quality-gate**

   - validates artifacts against a JSON schema + acceptance criteria
   - criteria types include: `field-exists`, `field-empty`, `count-min`, `count-max`, `number-max`, `coverage-min`, `regex-match`
   - outputs a structured gate result with blocking failures

2. **multi-model-review**
   - merges findings from multiple reviewers
   - deduplicates via token overlap (Jaccard similarity)
   - produces cost/benefit analysis scaffolding
   - performs drift detection, including **dual-extractor adjudication**

3. **trace-collector**
   - validates run-level execution events against `execution-trace.schema.json`
   - reports deterministic aggregate metrics (event counts, gate results, phase durations, retry/failure counters)
   - emits run summaries used by evaluation workflows

These runtime tools make “validation” _machine-checkable_ rather than “vibes-based.”

### 4.3 Why the Old “Orchestration Playground” Degraded

The old pattern (many parallel prompts, patterns, collaboration styles) is effective for exploration, but it fails as:

- context windows grow,
- artifacts accumulate,
- more concurrent contributors join.

Scientifically:

- it increases $H(C)$ (context entropy) faster than it increases $I(I;C)$,
- it increases coordination cost roughly with $\Theta(n^2)$ in unstructured discussion,
- it increases correlated error due to shared context soup,
- it blurs maker/checker roles, enabling self-certification.

Phased orchestration is a structural answer:

- narrow context per phase,
- typed artifact handoffs,
- explicit maker/checker gates,
- controlled parallelism.

---

## 5. Further Integrations

Based on the “judgment-centric” research direction, the repo can be extended further in scientifically meaningful ways without betraying its core principle (minimal noise, maximal verification):

1. **Progressive Disclosure & Explicit Context Budgets**

   - Define a token budget per phase and enforce it (e.g., “design phase max 12k tokens”)
   - Add “context manifest” metadata: exactly what files/docs were loaded and why

2. **Evidence Provenance Strengthening**

   - Expand `research[]` entries to include:
     - `source_url`, `version`, `retrieved_at`, and optionally a hash
   - This turns evidence into an auditable trace

3. **Security Hardening Hooks (Runner-Level)**

   - Pre-tool-use hooks for command filtering
   - Post-download malware scanning hooks
   - These are _guardrails_, not walls, but they reduce risk

4. **Quantitative Metrics for Orchestration Quality**

   - Track:
     - gate pass/fail rates per phase,
     - drift score trends across runs,
     - review dedup ratio (raw findings → deduped findings),
     - time-to-closure for security findings

5. **Formal “Coordination Topology” Documentation**
   - Add a short spec: when to use hub-and-spoke vs bounded group chat
   - Include the explicit scaling law rationale (why $O(n)$ beats $O(n^2)$ )

---

## Glossary

- **Signal-to-noise ratio (context)**: how much intent-relevant information exists relative to total context entropy.
- **Coordination tax**: superlinear overhead as agent count grows, often modeled as $O(n^2)$.
- **Drift**: divergence between source-of-truth artifacts (design/plan) and downstream artifacts (plan/implementation).
- **Gate**: a validation step (schema + criteria) that blocks progression on failure.
- **Design-by-contract**: engineering approach where software components have explicit, enforceable pre/postconditions.

---

## References

(External references are included for scientific framing; the repo itself remains runner-agnostic.)

- Lost in the Middle: How Language Models Use Long Contexts (Liu et al.)  
  <https://arxiv.org/abs/2307.03172>

- On the Computational Complexity of Self-Attention (Duman-Keles et al.)  
  <https://arxiv.org/abs/2209.04881>

- Design by Contract (Bertrand Meyer, chapter PDF)  
  <https://se.inf.ethz.ch/~meyer/publications/old/dbc_chapter.pdf>

- The Mythical Man-Month / Brooks’s Law (communication channels $n(n-1)/2$)  
  <https://en.wikipedia.org/wiki/The_Mythical_Man-Month>

- Towards a Science of Scaling Agent Systems (Kim et al., 2026)  
  <https://arxiv.org/abs/2512.08296>

- Multi-Agent Collaboration via Evolving Orchestration (Dang et al., 2025)  
  <https://arxiv.org/abs/2505.19591>


---

<!-- markdownlint-disable MD013 -->

# Mathematics & Computer-Science Foundations of **Phased Agent Orchestration**

This document provides a rigorous **mathematical and informatics** explanation of the failure modes that motivated this repository (context dilution, coordination overhead, and drift), and why the repo’s **phased, contract-driven, quality-gated** approach is a principled mitigation.

---

## 0. Abstract

As LLM context windows grow and multi-agent workflows become common, two coupled problems dominate real-world reliability:

1. **Information dilution:** adding more context often increases _entropy_ more than it increases _useful information_, reducing “information per token” and amplifying spurious correlations.
2. **Coordination tax:** adding more agents increases communication overhead and error propagation, with costs that can scale superlinearly in team size and topology.
3. **Artifact drift:** when planning, coding, and auditing blur, systems “self-certify” and downstream artifacts diverge from upstream intent.

**Phased Agent Orchestration** is an architecture that mitigates these issues by:

- enforcing **phase-scoped context** (information bottleneck),
- using **typed artifacts** (contracts via JSON Schema),
- requiring **hard gates** (Design-by-Contract style),
- applying **independent review / adjudication** (ensemble reliability),
- running **mechanized drift detection** (claim extraction + verification).

---

## 1. Context Dilution as an Information-Theoretic Phenomenon

### 1.1 Intent-to-Output as a Noisy Channel

Model a task as latent _intent_ $I$ (requirements, constraints, goals) that must be preserved through an agent’s _context_ $C$ into an _output_ $Y$ (design/plan/code).

A minimal information-theoretic lens:

- **Entropy**:

$$
H(X) = -\sum_{x} p(x)\log p(x)
$$

- **Mutual information**:

$$
I(I;C) = H(I) - H(I \mid C)
$$

$$
I(C;Y) = H(Y) - H(Y \mid C)
$$

A central quantity for prompt engineering is not “how much context we have,” but **how much intent-relevant information per token** the context contains.

Define a coarse “information density” metric:

$$
\eta(C) \;=\; \frac{I(I;C)}{|C|}
$$

Where $|C|$ is context length in tokens (or bits). If we append irrelevant material $N$ to the context, $C'=(C,N)$, then typically:

$$
I(I;C') = I(I;C,N) = I(I;C) + I(I;N\mid C)
$$

If the extra text $N$ is largely independent of intent given $C$, then $I(I;N\mid C)\approx 0$. But $|C'| > |C|$. Therefore:

$$
\eta(C') \approx \frac{I(I;C)}{|C|+|N|} < \frac{I(I;C)}{|C|} = \eta(C)
$$

**Conclusion:** adding noise almost always lowers information density, even if it raises the total token budget.

This repo’s design choice (“scoped context per phase”) is equivalent to maximizing $\eta(C)$ by construction: each phase sees only the minimal artifact subset required for its function.

---

### 1.2 Attention Dilution (Mechanistic Interpretation)

For a Transformer, attention weights for a query $q$ and key $k_i$ are:

$$
a_i = \frac{\exp(q^\top k_i)}{\sum_{j=1}^{L}\exp(q^\top k_j)}
$$

When you add $K$ extra tokens, the denominator increases. Even if the model _can_ learn to suppress noise, real systems empirically show sensitivity to where relevant information appears in long contexts (“position effects”).

A widely cited empirical result is that **performance often peaks when relevant information is near the beginning or end** of the context and degrades when it is in the middle of long contexts (“lost in the middle”). See [Liu2024] for controlled evidence.

---

### 1.3 Empirical Long-Context Limits

Benchmarks and analyses for long-context understanding show that:

- retrieval-like tasks and “needle-in-a-haystack” variants are insufficient alone,
- task complexity and multi-hop reasoning degrade as length grows,
- advertised context sizes do not guarantee robust usage.

Representative sources include:

- “Lost in the Middle” [Liu2024]
- LongBench (multi-task benchmark) [Bai2023; BaiACL2024]
- RULER (synthetic benchmark, configurable complexity) [Hsieh2024]

These results motivate an architectural stance: **don’t assume bigger contexts solve the problem**; engineer the system so agents receive a _curated signal_.

---

## 2. Computational Scaling: Why “Just Give It Everything” Gets Expensive

### 2.1 Self-Attention Complexity

Scaled dot-product attention is:

$$
\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

For sequence length $L$, the matrix $QK^\top$ is $L\times L$, so standard attention compute/memory scales approximately as:

$$
\text{Time} \in \Theta(L^2 d), \qquad \text{Memory} \in \Theta(L^2)
$$

This quadratic scaling is a major driver for “efficient transformer” variants and IO-aware implementations.

See:

- Transformer introduction [Vaswani2017]
- survey of efficient approaches [Tay2020]
- IO-aware exact attention (FlashAttention) [Dao2022]

### 2.2 Architectural Consequence

Because attention is expensive and long contexts are behaviorally fragile, an optimal engineering strategy is not “maximize $L$” but to **optimize relevance per token** and to use **external structure** (phases, artifacts, gates) to stabilize behavior.

This is exactly what the repository implements: artifact handoffs and gates replace “throw everything into one prompt” as the scaling mechanism.

---

## 3. Coordination Tax: Multi-Agent Systems as Graphs

### 3.1 Communication Channels Scale as a Graph

Model agent collaboration as a graph $G=(V,E)$ where vertices are agents and edges are communication dependencies.

- In a fully connected team of $n$ agents: $|E_{\text{complete}}| = \binom{n}{2} = \frac{n(n-1)}{2}$
  This is the classic “channels of communication” model often discussed in software engineering coordination arguments (popularly associated with Brooks’ observations) [Brooks1975].

- In a hub-and-spoke topology (one orchestrator + $n-1$ workers): $|E_{\text{star}}| = n-1$

So topology changes coordination complexity from $\Theta(n^2)$ to $\Theta(n)$.

### 3.2 A Simple Throughput Model

Let each agent contribute average benefit $b$, and coordination overhead per channel be $\alpha$. One stylized model:

$$
S(n)=nb-\alpha\cdot \frac{n(n-1)}{2}
$$

Maximizing w.r.t $n$ (continuous approximation):

$$
\frac{dS}{dn}=b-\alpha\left(n-\frac12\right)=0
\Rightarrow n^{*} \approx \frac{b}{\alpha}+\frac12
$$

Interpretation:

- if tasks are highly parallel and cheap to coordinate (small $\alpha$), more agents help.
- if tasks are tightly coupled or tool-heavy (large $\alpha$), more agents can reduce performance.

A recent large controlled study on agent-system scaling explicitly reports **topology-dependent effects**, coordination overhead, and cases where multi-agent variants degrade performance (especially on sequential reasoning tasks) [Kim2025; KimBlog2025].

---

## 4. Reliability Engineering: Gates as Design-by-Contract

### 4.1 Contracts, Preconditions, Postconditions

Design-by-Contract (DbC) formalizes correctness by explicitly stating:

- **preconditions**: what must be true before execution,
- **postconditions**: what must be true after execution,
- **invariants**: what must remain true.

DbC’s rationale in software engineering is canonical (Meyer) [Meyer1992; MeyerDbC].

### 4.2 Phases as a Finite-State Machine With Hard Guards

Let phases be states:

$$
\mathcal{S}=\{\texttt{arm},\texttt{design},\texttt{adversarial-review},\texttt{plan},\texttt{pmatch},\ldots\}
$$

Each phase emits an artifact $A_k$. A gate $G_k$ validates it:

$$
A_k = f_k(A_{k-1}, C_k)
$$

$$
G_k(A_k)\in\{\text{pass},\text{fail},\text{warn}\}
$$

Transition rule:

$$
\text{advance from phase }k \iff G_k(A_k)=\text{pass}
$$

This repo implements this _literally_ using JSON schemas and gate artifacts:

- Universal gate schema: `contracts/quality-gate.schema.json`
- Artifact schemas: `contracts/artifacts/*.schema.json`

This provides a mechanical equivalent of DbC assertions: the artifact is the postcondition, and the gate is the runtime checker.

---

## 5. Probabilistic Error Containment: Why Early Gates Matter

### 5.1 Residual Defect Probability Per Phase

Suppose phase $k$ introduces a defect with probability $p_k$.
Suppose its gate detects defects with probability $d_k$.

Then residual defect probability after gating:

$$
p_k^{\text{res}} = p_k(1-d_k)
$$

If phases are approximately independent, probability of at least one defect surviving across $K$ phases:

$$
P(\text{defect}) = 1-\prod_{k=1}^{K}\left(1-p_k^{\text{res}}\right)
$$

Even modest $d_k$ (detection power) can drastically reduce risk because gating composes multiplicatively across phases.

### 5.2 “Fail Fast” Minimizes Expected Rework Cost

Let the cost to fix a defect discovered after phase $k$ be $c_k$, typically increasing with time (later discovery is more expensive).

Expected rework cost:

$$
\mathbb{E}[C] = \sum_{k=1}^{K} c_k \cdot P(\text{defect discovered at phase }k)
$$

Architectures that move checks earlier reduce $\mathbb{E}[C]$. This is the core economic argument for gates.

---

## 6. Independent Review as an Ensemble: Why Multi-Model Critique Helps (If Structured)

### 6.1 Detection Probability Increases With Independent Reviewers

If each reviewer detects a specific defect with probability $r$ (independent), then probability it is caught by at least one of $m$ reviewers:

$$
P(\text{caught}) = 1-(1-r)^m
$$

### 6.2 Majority Voting and Condorcet’s Jury Theorem

Assume each reviewer (or extractor) makes the correct binary judgment with probability $p$, independently. For odd $n$, the probability majority is correct is:

$$
P_{\text{maj}}(n,p)=\sum_{k=\lceil n/2 \rceil}^{n}\binom{n}{k}p^k(1-p)^{n-k}
$$

Condorcet’s theorem states that if $p>\tfrac12$, then $P_{\text{maj}}(n,p)\to 1$ as $n\to\infty$ [CondorcetNotes].

**But independence is critical.** If all reviewers share the same noisy context and the same blind spots, their errors correlate and ensemble gains collapse. This repo’s design (isolated phases + structured artifacts + dedup/fact-check) is explicitly aimed at preserving reviewer independence.

### 6.3 Self-Consistency as a Related Principle

“Self-consistency” (sampling diverse reasoning paths and selecting the most consistent) improves reasoning accuracy in LLMs [Wang2022]. Conceptually, it’s the same ensemble logic applied to reasoning trajectories rather than distinct agents.

---

## 7. Drift Detection as a Verification Problem (and Why “Dual-Extractor” Matters)

### 7.1 Drift as Constraint Violation Rate

Let upstream artifact $S$ define a constraint set $\mathcal{C}(S)$.
Let downstream target $T$ (plan or code) be checked against these constraints.

Define weighted drift:

$$
\mathrm{Drift}(S,T)=\frac{\sum_{c\in\mathcal{C}(S)} w_c\cdot \mathbf{1}[\neg c(T)]}{\sum_{c\in\mathcal{C}(S)} w_c}
$$

This reduces “drift” to a measurable metric.

### 7.2 Claim Extraction + Verification as Hypothesis Testing

For each claim $c$, verification is a hypothesis test:

- $H_0$: “claim holds in target”
- $H_1$: “claim violated / not supported”

A practical system must balance:

- false positives (calling drift where none exists),
- false negatives (missing true drift).

### 7.3 Dual-Extractor Adjudication

If each extractor makes an incorrect verification with probability $p$, and errors are independent, probability both are wrong:

$$
P(\text{both wrong}) = p^2
$$

So dual extraction reduces “confidently wrong” decisions quadratically in $p$ _when independence holds_.

This repo encodes dual extraction as a first-class artifact requirement:

- `contracts/artifacts/drift-report.schema.json` requires `adjudication.mode` and supports `dual-extractor`.

### 7.4 Robust Estimation Analogy (RANSAC / PROSAC)

RANSAC is a robust “hypothesize-and-verify” paradigm designed to tolerate high outlier rates [Fischler1981]. PROSAC refines sampling using ordered hypotheses for efficiency [Chum2005].

Mechanized drift detection is conceptually similar:

- hypotheses = extracted claims,
- verification = evidence check,
- outliers = hallucinated/unverifiable claims,
- adjudication = outlier rejection & consensus.

This analogy is useful because it emphasizes **structured verification** over “trusting one generator.”

---

## 8. Mapping the Theory to the Repository (Concrete Mechanisms)

This repository operationalizes the above ideas with explicit contracts.

### 8.1 Typed Artifacts (JSON Schema)

- Requirements crystallization artifact:

  - `contracts/artifacts/brief.schema.json`
  - includes `open_questions` which “must be empty to pass the arm quality gate” (schema description).

- Evidence-backed design artifact:

  - `contracts/artifacts/design-document.schema.json`
  - requires `research[]` with `verified_at` timestamps.

- Atomic execution plan artifact:

  - `contracts/artifacts/execution-plan.schema.json`
  - enforces:
    - `tasks.maxItems = 8` (bounded complexity per group),
    - `file_ownership` invariant: _no file may appear in more than one group_.

- Drift report artifact:

  - `contracts/artifacts/drift-report.schema.json`
  - requires `adjudication` with `mode` and extractor metadata.

- Universal gate result:
  - `contracts/quality-gate.schema.json`
  - enumerates phases and provides consistent pass/fail semantics.

### 8.2 Why These Constraints Directly Reduce Coordination Tax

The `file_ownership` constraint is equivalent to enforcing a partition on a conflict hypergraph.

Let each task group $g$ own a set of files $F_g$.
The schema enforces:

$$
F_g \cap F_h = \varnothing \quad \text{for } g\neq h
$$

This removes a major class of multi-agent merge conflicts and reduces coordination edges between builders.

### 8.3 Why Phase-Scoped Context Improves Information Density

By forcing each phase to consume only upstream artifacts (brief/design/plan) rather than the entire conversational backlog, the repo approximates an **information bottleneck** principle:

$$
\max \ I(I;Z) \quad \text{s.t. } |Z|\le B
$$

Where $Z$ is the phase context and $B$ is a tight budget. Here the artifact is a compressed sufficient statistic for the next phase.

---

## 9. Suggested Measurements (Making the Claims Falsifiable)

To evaluate whether phased orchestration helps in your environment, track:

1. **Gate failure rate per phase**

$$
\hat{p}_{\text{fail}}(k)=\frac{\text{number of fails in phase }k}{\text{number of runs in phase }k}
$$

2. **Drift score trend**

$$
\mathrm{Drift}(S,T)\ \text{over time}
$$

3. **Review dedup ratio**

$$
\rho=\frac{\text{number of raw findings}}{\text{number of deduplicated findings}}
$$

   High $\rho$ suggests large redundancy and thus high coordination noise.

4. **Rework cost proxy**

- number of changed files after pmatch vs before
- number of reruns of quality gates

These metrics directly operationalize the theory: information density, coordination overhead, and drift containment.

---

## 10. References

### Information theory

- [Shannon1948] C. E. Shannon. _A Mathematical Theory of Communication_. Bell System Technical Journal, 1948.  
  PDF: `https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf`
- [KullbackLeibler1951] S. Kullback and R. A. Leibler. _On Information and Sufficiency_. Annals of Mathematical Statistics, 1951. DOI: `10.1214/aoms/1177729694`  
  Abstract/record: `https://projecteuclid.org/journals/annals-of-mathematical-statistics/volume-22/issue-1/On-Information-and-Sufficiency/10.1214/aoms/1177729694.full`

### Transformers and long-context behavior

- [Vaswani2017] A. Vaswani et al. _Attention Is All You Need_. NeurIPS 2017. arXiv: `1706.03762`  
  `https://arxiv.org/abs/1706.03762`
- [Tay2020] Y. Tay, M. Dehghani, D. Bahri, D. Metzler. _Efficient Transformers: A Survey_. arXiv: `2009.06732`; ACM Computing Surveys (2022). DOI: `10.1145/3530811`  
  `https://arxiv.org/abs/2009.06732`
- [Dao2022] T. Dao et al. _FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness_. NeurIPS 2022. arXiv: `2205.14135`  
  `https://arxiv.org/abs/2205.14135`
- [Liu2024] N. F. Liu et al. _Lost in the Middle: How Language Models Use Long Contexts_. TACL 2024. DOI: `10.1162/tacl_a_00638`; arXiv: `2307.03172`  
  `https://arxiv.org/abs/2307.03172`
- [Bai2023] Y. Bai et al. _LongBench: A Bilingual, Multitask Benchmark for Long Context Understanding_. arXiv: `2308.14508`  
  `https://arxiv.org/abs/2308.14508`
- [BaiACL2024] LongBench (ACL 2024 long paper PDF)  
  `https://aclanthology.org/2024.acl-long.172.pdf`
- [Hsieh2024] C.-P. Hsieh et al. _RULER: What’s the Real Context Size of Your Long-Context Language Models?_ arXiv: `2404.06654`  
  `https://arxiv.org/abs/2404.06654`

### Ensembles and reliability

- [Wang2022] X. Wang et al. _Self-Consistency Improves Chain of Thought Reasoning in Language Models_. arXiv: `2203.11171` (ICLR 2023)  
  `https://arxiv.org/abs/2203.11171`
- [CondorcetNotes] Background notes on Condorcet’s jury theorem (with derivations)  
  `https://www.stat.berkeley.edu/~mossel/teach/SocialChoiceNetworks10/ScribeAug31.pdf`

### Coordination and agent-system scaling

- [Brooks1975] F. P. Brooks. _The Mythical Man-Month: Essays on Software Engineering_. Addison-Wesley, 1975 (Anniversary Ed. 1995).  
  (Discussion of coordination overhead; commonly expressed channel count $n(n-1)/2$.)
- [Kim2025] Y. Kim et al. _Towards a Science of Scaling Agent Systems_. arXiv: `2512.08296`  
  `https://arxiv.org/abs/2512.08296`
- [KimBlog2025] Google Research blog overview of the same work  
  `https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/`

### Contracts and formalism

- [Meyer1992] B. Meyer. _Applying “Design by Contract”_. IEEE Computer, 1992.  
  `https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf`
- [MeyerDbC] B. Meyer. _Design by Contract_ (chapter PDF)  
  `https://se.inf.ethz.ch/~meyer/publications/old/dbc_chapter.pdf`

### Robust verification analogy

- [Fischler1981] M. A. Fischler, R. C. Bolles. _Random Sample Consensus: A Paradigm for Model Fitting…_ Communications of the ACM, 1981. DOI: `10.1145/358669.358692`
- [Chum2005] O. Chum, J. Matas. _Matching with PROSAC — Progressive Sample Consensus_. CVPR 2005. DOI: `10.1109/CVPR.2005.221`  
  PDF: `https://cmp.felk.cvut.cz/~matas/papers/chum-prosac-cvpr05.pdf`

---

## 11. Key Takeaway

The repo’s phased approach is not arbitrary ceremony. It is a rational response to:

- information dilution in long contexts,
- coordination overhead in multi-agent systems,
- drift and self-certification in “plan → code” loops.

The architecture replaces “hope the model stays aligned” with **measurable invariants** (schemas, gates, drift scores) and **structural reliability** (phase separation + independent verification).
