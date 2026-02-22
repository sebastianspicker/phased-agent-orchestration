---
name: orchestration
description: "Multi-phase AI workflow pipeline with quality gates, cognitive tiering, context scoping, and mandatory security remediation loops. Use when orchestrating idea-to-ship workflows: arm (brief), design, adversarial review, plan, drift detection, build, post-build quality. Choose configuration from user prompt."
---

# orchestration (Playbook)

Quality-gated pipeline from idea to shipped code. Each phase produces a validated artifact that feeds the next. Context is scoped per phase; no phase inherits prior conversation history. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Fuzzy idea, requirements, brief → **arm**
- First-principles design, constraints, research → **design**
- Multi-perspective critique, adversarial review → **adversarial-review**
- Execution plan, task groups, atomic planning → **plan**
- Drift detection, plan-vs-design, claim verification → **pmatch**
- Parallel build, agent coordination, implementation → **build**
- Dead code, noise, cleanup → **denoise**
- Frontend style audit → **quality-frontend**
- Backend style audit → **quality-backend**
- Documentation freshness → **quality-docs**
- OWASP, vulnerability scan, security → **security-review**
- Full pipeline, end-to-end orchestration → **pipeline**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| idea, requirements, brief, arm, crystallize | arm |
| design, first-principles, constraints, approach, research | design |
| adversarial review, multi-perspective, critique, ar | adversarial-review |
| execution plan, task groups, atomic planning, deterministic | plan |
| drift, pmatch, plan-vs-design, claim verification | pmatch |
| build, parallel, coordinate, implement, agent teams | build |
| denoise, dead code, unused, cleanup | denoise |
| frontend quality, frontend style, qf | quality-frontend |
| backend quality, backend style, qb | quality-backend |
| docs freshness, documentation quality, qd | quality-docs |
| security review, OWASP, vulnerabilities | security-review |
| full pipeline, end-to-end, orchestrate all phases | pipeline |

## Cognitive tiering

| Tier | Role | Phases |
|------|------|--------|
| Lead (high-reasoning) | Strategy, design, coordination | arm, design, adversarial-review (lead), plan, build (lead) |
| Worker (fast) | Implementation, audit, review | build (workers), adversarial-review (reviewers), denoise, quality-*, security-review, pmatch |

## Artifact contracts

All artifacts validate against schemas in `contracts/artifacts/`. Quality gates validate against `contracts/quality-gate.schema.json`. Pipeline state lives in `.pipeline/` (gitignored).

## Cursor adapter mapping

When running on Cursor, map stages to adapters explicitly:
- `arm` -> `.cursor/skills/orchestration-arm/SKILL.md`
- `design` -> `.cursor/skills/orchestration-design/SKILL.md`
- `adversarial-review` -> `.cursor/skills/orchestration-ar/SKILL.md`
- `plan` -> `.cursor/skills/orchestration-plan/SKILL.md`
- `pmatch` -> `.cursor/skills/orchestration-pmatch/SKILL.md`
- `build` -> `.cursor/skills/orchestration-build/SKILL.md`
- `post-build` -> `.cursor/skills/orchestration-postbuild/SKILL.md`

## Semantic anchors

Use these terms consistently. Each term carries specific operational meaning:
- **Context minimization**: excessive context degrades signal quality; scope context tightly per phase.
- **Capability allocation**: reserve deep reasoning for strategy and use fast models for execution/audit throughput.
- **Separation of duties**: producers do not self-certify; validation must run from independent context.
- **Parallel challenge**: independent reviewers pressure-test assumptions to surface blind spots.
- **Evidence-first guidance**: recommendations must trace to verifiable sources and repository facts.
- **Predeclared verification**: tests and acceptance checks are defined before implementation begins.
- **Human control points**: automation assists execution, but critical gate progression requires explicit approval.
- **Fix-first security closure**: critical/high security findings are fixed and re-verified before progression; risk acceptance is explicit and owned.

## Configurations

### arm
Requirements crystallization. Input: fuzzy idea (user prompt). Model: lead (high-reasoning). Steps: Extract requirements, constraints, non-goals, style, key concepts via conversational Q&A → Force remaining decisions in single structured checkpoint → Validate against `contracts/artifacts/brief.schema.json` → Write to `.pipeline/runs/<run-id>/brief.json`. Gate: `open_questions` array is empty; all constraints have explicit type and source. Output: Brief artifact. Hard rules: never guess a requirement; if ambiguous, ask; checkpoint is one round, not iterative.

### design
First-principles design. Input: Brief artifact. Model: lead (high-reasoning). Steps: Classify every constraint (hard/soft, flag misclassifications) → Reconstruct approach from validated truths only (no assumptions from training data) → Research via MCP-backed live docs (e.g. Context7) + web search → Align with codebase patterns (grep for conventions) → Iterate with user until alignment → Validate against `contracts/artifacts/design-document.schema.json` → Write to `.pipeline/runs/<run-id>/design.json`. Gate: user approves alignment; all research citations have verified_at timestamps; no unclassified constraints remain. Tools: filesystem, MCP docs, web search. Semantic intent: evidence-first guidance.

### adversarial-review
Multi-perspective critique. Input: Design Document artifact. Model: 3 independent reviewer subagents with different expert perspectives — architect-reviewer (architecture, scalability, coupling), security-engineer (OWASP, auth, trust boundaries), performance-engineer (bottlenecks, resource usage, caching). Lead (high-reasoning) orchestrates. Steps: Fan out design to 3 reviewer subagents in parallel (each gets filesystem + MCP docs access, each returns findings in Finding[] format) → Collect findings and pipe through `multi-model-review` skill for deduplication and cost/benefit analysis → Lead fact-checks each finding against actual codebase → Structured report for human review → Loop until no findings warrant mitigation per cost/benefit → Validate against `contracts/artifacts/review-report.schema.json` → Write to `.pipeline/runs/<run-id>/review.json`. Gate: all critical/high findings mitigated or accepted with justification; `remaining_unmitigated` contains only low/info items. Hard rules: the lead never dismisses a finding without evidence; each reviewer works independently (no shared context between reviewers). Semantic intent: parallel challenge + separation of duties.

### plan
Atomic execution planning. Input: Design Document + Review Report artifacts. Model: lead (high-reasoning). Steps: Transform design into task groups (target 3-6 tasks per builder, hard max 8) → Assign file ownership (no file appears in more than one group) → Include exact file paths, complete code patterns showing the approach, named test cases with setup and assertions → Define non-negotiable acceptance criteria per task → If a group intentionally falls outside the 3-6 target, include `scope_override.reason` in that group → Validate against `contracts/artifacts/execution-plan.schema.json` → Write to `.pipeline/runs/<run-id>/plan.json`. Gate: every task has at least one test case; `file_ownership` has no conflicts; all code patterns are complete (no TODOs or placeholders); verification commands are executable; groups outside 3-6 have explicit `scope_override.reason`. Hard rules: if the builder would have to guess, the plan failed. Semantic intent: predeclared verification.

### pmatch
Drift detection. Input: source artifact (design or plan) + target artifact (plan or implementation). Model: two independent Task subagents (e.g. refactoring-specialist + architect-reviewer) working in parallel. Steps: Each agent independently extracts claims from source document → Verifies each claim against target → Feed both claim sets to `multi-model-review` with `action.type="drift-detect"` and `drift_config.mode="dual-extractor"` for adjudication (heuristic mode remains fallback-only) → Lead validates conflicts and mitigations → Validate against `contracts/artifacts/drift-report.schema.json` → Write to `.pipeline/runs/<run-id>/drift-reports/pmatch.json`. Gate: no unmitigated structural drift (severity critical or high); all violated claims have mitigation or justification; adjudication metadata present (`mode`, `extractors`, `conflicts_resolved`, `resolution_policy`). Hard rules: extractors work independently (no shared context); lead must verify before accepting a finding.

### build
Coordinated parallel build. Input: Execution Plan artifact. Model: lead (high-reasoning) + workers (fast). Steps: Lead distributes task groups to builder agents (each gets own terminal/context scoped to its task group only) → Builders implement independently → Lead coordinates, unblocks, monitors progress → After all builders finish, lead runs pmatch (plan vs implementation) → Gate: all acceptance criteria pass; pmatch clean; verification commands succeed. Hard rules: lead never writes code; builders see only their task group and file paths; no builder context leaks to another builder. Semantic intent: context minimization + separation of duties.

### denoise
Dead code and noise removal. Input: implementation (changed files). Model: worker (fast). Steps: Identify dead imports, unused variables, debug artifacts (console.log, TODO comments from build), orphaned code → Remove with evidence for each removal → Run tests to confirm no regressions → Validate against `contracts/artifacts/quality-report.schema.json` (audit_type: denoise). Gate: tests still pass after cleanup; no functional changes.

### quality-frontend
Frontend style audit. Input: implementation (frontend files). Model: worker (fast). Steps: Audit against project-specific frontend style guide (component patterns, naming, accessibility, performance) → Report violations with file, line, evidence, remediation → Validate against `contracts/artifacts/quality-report.schema.json` (audit_type: frontend). Gate: no critical/high violations.

### quality-backend
Backend style audit. Input: implementation (backend files). Model: worker (fast). Steps: Audit against project-specific backend style guide (API patterns, error handling, security, logging) → Report violations with file, line, evidence, remediation → Validate against `contracts/artifacts/quality-report.schema.json` (audit_type: backend). Gate: no critical/high violations.

### quality-docs
Documentation freshness audit. Input: implementation. Model: worker (fast). Steps: Cross-reference docs (README, API docs, inline docs) with changed code → Flag stale documentation (functions renamed, parameters changed, behavior altered without doc update) → Validate against `contracts/artifacts/quality-report.schema.json` (audit_type: docs). Gate: all changed public APIs have matching documentation.

### security-review
Comprehensive security audit and remediation loop. Input: implementation + runtime/deploy config. Model: worker (fast) for scanning, lead verification for closure.

Mandatory coverage checklist:
1. Access control and tenancy isolation (IDOR, horizontal/vertical privilege escalation, mass assignment).
2. Client-side injection defenses (XSS sources/sinks, output encoding, CSP effectiveness).
3. CSRF defenses on every state-changing endpoint (token enforcement + SameSite strategy).
4. Secret exposure and sensitive-data leakage (hardcoded keys, tokens, credentials, signing secrets, client bundle leaks).
5. HTTP security hardening (CSP, HSTS, X-Frame-Options/frame-ancestors, X-Content-Type-Options, Referrer-Policy, cache policy for sensitive pages).
6. Session and cookie hardening (`Secure`, `HttpOnly`, `SameSite`, auth token storage policy).
7. Production information exposure (server banners/versions, debug mode, stack traces, verbose errors).
8. Dependency vulnerabilities and patching (lockfile-aware updates + rescan).
9. Server-side injection and input abuse (SQL/NoSQL injection, command injection, SSRF).
10. File and path handling (insecure upload validation, path traversal, archive extraction safety).
11. Redirect and token issues (open redirects, JWT algorithm/expiry/storage validation).

Execution steps:
1. Run all checklist categories and capture evidence per finding.
2. Fix every critical/high finding.
3. Rerun the same checks and confirm closures.
4. Repeat until `critical/high open = 0`.
5. For any accepted risk, record owner, justification, expiry, and follow-up ticket.

Validate against `contracts/artifacts/quality-report.schema.json` (audit_type: security). Gate: no open critical/high findings; mandatory checklist fully executed; accepted risks explicitly signed off.

### pipeline
Full pipeline orchestrator. Meta-configuration that runs phases in sequence: arm → design → adversarial-review → plan → pmatch → build → post-build. Steps: Initialize `.pipeline/runs/<run-id>/` → Run each phase, write artifacts, validate gates between phases → Block on gate failure (human must resolve before proceeding) → Post-build: run denoise, then quality-frontend + quality-backend + quality-docs + security-review (parallel or sequential depending on file independence) → For security-review specifically, run mandatory remediation loop (fix + rescan) with coverage of all required categories before final post-build gate close → Write pipeline-state.json after each phase transition. Hard rules: never auto-advance past a failed gate; human approval required at arm checkpoint, design alignment, adversarial review report, and any accepted security risk exception. Semantic intent: human control points + capability allocation.
