---
name: repo
description: "Repo and tooling playbook. Use when working on tool definitions, contracts, CI, bisect, dev-tools run/patches/maintenance, API/OpenAPI contracts, patch review, or release pipelines. Choose configuration from user prompt."
---

# repo (Playbook)

Repository, contracts, CI, dev-tools, and release workflows. **Choose one configuration** based on the user prompt.

## When to use (triggers)
- Tool definitions, schema refs, runner wiring → **tool-definitions**
- Contracts, compatibility, schema change → **contracts**
- Docs/examples vs schemas, link hygiene → **docs-examples**
- New runtime skill, scaffold, template → **new-runtime-skill**
- PR, branch, commit, reviewable diffs → **git-pr**
- CI red, flaky tests, env mismatch → **ci-triage**
- Code review, safety pass, risk assessment → **code-review**
- npm audit, dependency updates, lockfile → **security-deps**
- Which test/build/lint commands, workspaces → **run-commands**
- Release, version bump, SemVer → **release-versioning**
- Bisect, regression, first bad commit → **bisect-regressions**
- ts-optimize/ps1-optimize patches, applyFixes → **dev-tools-patches**
- Run ts-optimize/ps1-optimize, input JSON, output → **dev-tools-run-skill**
- Change runtime skill src/schemas/sandbox/tests → **dev-tools-skill-maintenance**
- HTTP/JSON API, OpenAPI, contract tests → **api-contracts**
- OpenAPI codegen, SDK/client generation → **openapi-codegen**
- Review AI/tool patches, risk triage, apply → **patch-review**
- CI/CD pipelines, release, approvals, rollback → **cicd-release**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| tool definitions, schema refs, runner, agent-config | tool-definitions |
| contracts, schema.json, compatibility, additive/breaking | contracts |
| docs, examples, fixtures, links | docs-examples |
| new skill, scaffold, template, manifest, sandbox | new-runtime-skill |
| PR, branch, commit, reviewable | git-pr |
| CI red, flaky, environment | ci-triage |
| code review, safety, risk | code-review |
| npm audit, vulnerabilities, lockfile | security-deps |
| test build lint commands, workspaces | run-commands |
| release, version, SemVer, changelog | release-versioning |
| bisect, regression, first bad commit | bisect-regressions |
| patches, applyFixes, ts-optimize/ps1-optimize output | dev-tools-patches |
| run ts-optimize, ps1-optimize, input JSON | dev-tools-run-skill |
| change runtime skill, schemas, sandbox, maintenance | dev-tools-skill-maintenance |
| API, OpenAPI, contract tests, compatibility | api-contracts |
| OpenAPI codegen, SDK, client generation | openapi-codegen |
| patch review, AI patches, apply patches | patch-review |
| CI/CD, pipeline, release, rollback | cicd-release |

## Configurations

### tool-definitions
Define or update tool definitions for the agent runner (names, input schemas). Identify consumer (e.g. `agent-config/tool-definitions/tools.generated.json`). Validate schema refs resolve; tool name matches runner expectations. Update tool-def JSON with correct `$ref` paths. Verify refs resolve; optional E2E load test. Conventions: domain prefix in tool name; repo-root-relative refs if supported.

### contracts
Change shared contracts under `contracts/*.schema.json`. Identify consumers; gather example payloads. Decide additive vs breaking. Prefer additive (new optional fields). Verify payloads validate; re-run runtime skill tests. Compatibility: additive = new optional, loosening; breaking = rename/remove, tighten, change meaning. Update contracts, runtime skill schemas, agent-config if needed.

### docs-examples
Keep docs/examples consistent with schemas and behavior. Identify authoritative sources; find mismatches (docs vs schemas, examples vs output shape, broken links). Update docs and examples with code; minimal examples. Verify: runtime skill tests, link check on README/AGENTS.md/skills README.

### new-runtime-skill
Add new runtime skill under `skills/<domain>/<skill>/`. Define input/output schema and sandbox needs first. Scaffold: manifest.yaml, schemas/input.schema.json, output, sandbox/Dockerfile, permissions, README, tests, package.json. Verify build + tests + one sandbox run. Wire: tool definitions if exposed; docs. Template: `docs/skill-template.md`.

### git-pr
Branch/commit/PR workflow. Smallest reviewable slices: (1) mechanical (format/docs), (2) behavior, (3) cleanup. One behavior change per commit. Run verification before push; document commands in PR. Done: reviewable commit-by-commit, verification documented and passing.

### ci-triage
CI red or flaky. Identify failing job and exact commands; match runtime versions (Node, package manager, OS). Classify: deterministic vs flake vs env mismatch. Reduce to smallest failing command. Prefer deterministic tests over sleeps. Verify: re-run failing command(s) locally; document. Done: reproducible locally or reason documented; minimal fix.

### code-review
Review PR for correctness, safety, maintainability. Order: correctness/regressions → security/sandbox → contract compatibility → tests → maintainability. Request small changes. Require evidence (commands run). High-risk: runtime skills, contracts/, agent-config/. Done: risks addressed or accepted; verification defined.

### security-deps
Dependency vulnerabilities (npm audit). Per finding: reachable in prod? dev-only? safe patch/minor or major? Prefer patch/minor; avoid `audit fix --force` unless accepted. Isolate deps in own PR. Verify build/tests; document residual risk. Done: minimal justified updates; verification passes.

### run-commands
Derive test/build/lint/typecheck commands (workspaces/monorepos). Detect package manager (lockfile); find scripts in root and package package.json; mirror CI if exists. Run narrowest subset first. Verify full gate set; record commands and cwd. Sets: minimal (typecheck + targeted tests), standard (+ lint), release-grade (+ build). Done: commands unambiguous and reproducible.

### release-versioning
Ship: version bump, changelog, tags. Classify: patch (bugfix, no break), minor (additive), major (breaking). Apply bump; release notes: what changed, who impacted, migration. Verify all packages; docs consistent. Contracts under contracts/; runtime skills under skills/dev-tools/*. Done: versioning matches impact; notes accurate; verification passes.

### bisect-regressions
Find first bad commit for a regression. Create deterministic repro command (success/failure, fast). Identify known-good and known-bad; run `git bisect` with repro. Fix (revert/patch); verify on repro and broader gates. Done: regression origin identified with evidence; minimal fix; flake vs deterministic documented.

### dev-tools-patches
Review/apply patches from ts-optimize/ps1-optimize. Re-run with applyFixes=false to confirm deterministic patches. Review each patch (intent, scope, safety). Prefer re-run with applyFixes=true over manual apply (patches reference /workspace/; git apply may need path rewrite). Verify target project checks + re-run skill. Done: every patch understood; no writes outside scope.

### dev-tools-run-skill
Run ts-optimize or ps1-optimize. Craft input JSON (project.root, actions, targets). Docker: mount target at /workspace; project.root=/workspace; pipe input to container. Local: build skill, run with node dist/index.js. Interpret output: findings, patches, metrics. Patch-first: inspect then applyFixes=true if agreed. Verify target checks after run.

### dev-tools-skill-maintenance
Change runtime skill src/, schemas/, manifest, sandbox/, tests/. Reproduce with minimal fixture; add test first if possible. Identify impact: input/output schema, patch format, sandbox, perf. Prefer additive schema changes; keep patch-first semantics; no writes outside /workspace. Update schemas, examples, tests, README; if shared format: contracts/ and tool-definitions. Verify: ts-optimize and ps1-optimize build+test.

### api-contracts
HTTP/JSON APIs: OpenAPI/JSON Schema as source of truth. Inventory consumers and example payloads. Specify schema (OpenAPI or JSON Schema). Additive safest; breaking needs versioned rollout. Contract tests at boundary; validate fixtures. Rollout with backward compat; remove deprecated only after migration. Compatibility: optional new fields; no meaning change; remove/rename = breaking; tighten constraints = breaking unless proven.

### openapi-codegen
Generate SDK/client from OpenAPI. Pin generator and spec. Generate into fixed directory; review diff; avoid hand-edits (use templates). Run contract/serialization tests. Release with version and changelog. Determinism: no timestamp in output; config in repo; stable formatting step. Done: pinned inputs; diff reviewed; tests pass.

### patch-review
Review AI/tool/codegen patches. Triage: formatting, refactor, behavior, security, deps. Review: intent clear, minimal diff, no hidden behavior. Apply in small batches. Verify tests/build/lint; record changes and rollback. Checklist: intended files only; no accidental API change; no secret leak; tests for behavior changes. Done: applied with evidence; rollback path; follow-ups tracked.

### cicd-release
Design/audit pipelines. Design: env stages (dev/staging/prod), promotion. Build: versioned artifacts. Test: unit/integration/E2E; isolate flaky. Deploy: approvals for prod. Verify: smoke + metrics. Rollback: define and practice. Secrets managed and audited. Done: versioned artifacts; controlled promotion; verification and rollback readiness.
