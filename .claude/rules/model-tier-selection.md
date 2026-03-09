---
paths:
  - ".pipeline/**"
  - "scripts/pipeline/**"
  - "adapters/claude/**"
  - ".claude/skills/**"
---

# Claude Model Tier Selection

When the pipeline references cognitive tiers, use this three-tier mapping for Claude Code:

| Tier | Claude Model | Use for |
|------|-------------|---------|
| `high_reasoning` | Opus (`claude-opus-4-6`) | arm, adversarial-review lead, release-readiness |
| `balanced` | Sonnet (`claude-sonnet-4-6`) | design, plan, build lead, pmatch adjudication |
| `fast` | Haiku (`claude-haiku-4-5-20251001`) | ar reviewers, pmatch extractors, build workers, quality-static, quality-tests, post-build |

## When to use Opus (high_reasoning)
- Requirement extraction from ambiguous, unstructured input (arm)
- Synthesis and adjudication across multiple independent reviewer findings (ar lead)
- Risk assessment and go/no-go decisions with incomplete information (release-readiness)
- Any task where the input is novel, contradictory, or requires creative problem-solving

## When to use Sonnet (balanced)
- Architecture design with evidence grounding following structured templates (design)
- Task decomposition with traceability — systematic but bounded scope (plan)
- Build coordination, deviation analysis, and process management (build lead)
- Drift adjudication comparing two structured claim sets (pmatch lead)
- Any task requiring solid reasoning on well-defined, structured inputs

## When to use Haiku (fast)
- Independent review passes with narrow scope (ar reviewers)
- Claim extraction from structured documents (pmatch extractors)
- Scoped implementation within clear boundaries (build workers)
- Deterministic command execution and report assembly (quality gates, post-build)
- Any task that follows a clear template with minimal ambiguity

## Claude Code integration

### Main conversation model
The main Claude Code conversation runs on whichever model the user has active. When executing pipeline stages:
- For `high_reasoning` stages: ensure Opus is active (default). If in `/fast` mode, switch back first.
- For `balanced` stages: Sonnet via `/fast` mode is appropriate. Toggle `/fast` on before starting these stages.
- For `fast` stages: Sonnet via `/fast` mode works; Haiku subagents are preferred when launching workers.

### Subagent model selection
When launching Agent/Task subagents:
- Lead/coordinator agents inherit the main conversation model
- Worker/reviewer subagents: use Haiku for `fast` tier tasks — keep scopes narrow enough for fast execution
- `balanced` tier subagents: Sonnet is the right fit when launching independent structured-reasoning subagents

### builder_tier in plan.json
The execution plan assigns `builder_tier` per task group. During `/build`:
- `high_reasoning` groups: use Opus subagent (complex refactoring, architectural judgment)
- `balanced` groups: use Sonnet subagent (structured implementation with reasoning)
- `fast` groups: use Haiku subagent (straightforward, well-specified implementation)
