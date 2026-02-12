---
name: llm
description: "LLM playbook. Use when designing prompts, building eval harnesses, RAG, local LLM ops, prompt-injection defense, or production evals. Choose configuration from user prompt."
---

# llm (Playbook)

Prompts, evals, RAG, and LLM operations. **Choose one configuration** from the user prompt.

## When to use (triggers)
- System prompt, structured output → **prompt-workflow**
- Eval harness, fixtures, regression → **eval-harness**
- RAG, retrieval, chunking → **rag**
- Local/self-hosted LLM ops → **local-ops**
- Prompt injection, untrusted input → **prompt-injection-defense**
- Production evals, drift, canary → **local-evals-prod**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| prompt design, structured output, test cases | prompt-workflow |
| eval harness, fixtures, scoring | eval-harness |
| RAG, retrieval, chunking, grounding | rag |
| local LLM, resource, latency, caching | local-ops |
| prompt injection, guardrails | prompt-injection-defense |
| production evals, drift, canary | local-evals-prod |

## Configurations

### prompt-workflow
Specify (success criteria, output schema) → Draft (role, task, constraints, format, examples) → Test (suite, adversarial inputs) → Iterate → Version. Guardrails: no secret reveal; user content untrusted.

### eval-harness
Fixtures; scoring; regression checks; reproducible.

### rag
Ingestion/chunking/metadata; indexing; retrieval evaluation; answer grounding; regression tests.

### local-ops
Resource sizing; concurrency; latency/cost; caching; privacy; upgrades; fallbacks; deployment checklist.

### prompt-injection-defense
Trust boundaries; tool-call gating; allowlists; structured outputs; adversarial eval; no data exfil.

### local-evals-prod
Sampling; drift detection; safety regression; canary rollouts; model-degraded incident workflow; privacy-aware telemetry.
