---
paths:
  - ".pipeline/**"
  - "scripts/pipeline/**"
  - "adapters/claude/**"
  - ".claude/skills/**"
---

# Claude Model Tier Selection

When the pipeline references cognitive tiers, use this mapping for Claude Code:

| Tier | Claude Model | Use for |
|------|-------------|---------|
| `high_reasoning` | Opus (`claude-opus-4-6`) | arm, design, plan, adversarial-review lead, pmatch adjudication, build lead, release-readiness |
| `fast` | Haiku (`claude-haiku-4-5-20251001`) | adversarial-review reviewers, pmatch extractors, build workers, quality-static, quality-tests, post-build audits |

## When to use Opus (high_reasoning)
- Requirement extraction and constraint analysis (arm)
- Architecture design with evidence grounding (design)
- Synthesis, adjudication, and risk assessment (ar lead, pmatch lead, release-readiness)
- Task decomposition with traceability (plan)
- Build coordination and deviation analysis (build lead)

## When to use Haiku (fast)
- Independent review passes with narrow scope (ar reviewers)
- Claim extraction from structured documents (pmatch extractors)
- Scoped implementation within clear boundaries (build workers)
- Deterministic command execution and report assembly (quality gates, post-build)

## Subagent model selection
When launching Task subagents, set the model based on the tier:
- Lead/coordinator agents: use Opus (default for Claude Code main conversation)
- Worker/reviewer subagents: use `--model claude-haiku-4-5-20251001` when supported, or keep scopes narrow enough for fast execution
