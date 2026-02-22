# Quality Gate Skill

Validate JSON artifacts against a JSON Schema and run acceptance criteria checks. Emits a structured pass/fail gate result for pipeline orchestration.

## Usage

The skill reads JSON from stdin and writes a structured result to stdout.

```bash
echo '{ ... }' | node dist/index.js
```

### Input format

```json
{
  "artifact": { "title": "My Design", "sections": ["a", "b"] },
  "artifact_ref": ".pipeline/runs/<run-id>/design.json",
  "schema_ref": "schemas/design.schema.json",
  "phase": "design",
  "criteria": [
    { "name": "has-title", "type": "field-exists", "path": "title" },
    { "name": "min-sections", "type": "count-min", "path": "sections", "value": 2 },
    { "name": "no-open-questions", "type": "field-empty", "path": "open_questions" },
    { "name": "semver-version", "type": "regex-match", "path": "version", "value": "^\\d+\\.\\d+\\.\\d+$" }
  ]
}
```

- **artifact** — the JSON object to validate
- **artifact_ref** — optional path/reference of the artifact being validated
- **schema_ref** — path to a JSON Schema file (resolved relative to `/workspace`)
- **phase** — pipeline phase (`arm`, `design`, `adversarial-review`, etc.)
- **criteria** — acceptance checks to run against the artifact

### Criterion types

| Type | Description | `value` |
|------|-------------|---------|
| `field-exists` | Field at `path` exists and is non-null | — |
| `field-empty` | Array at `path` has length 0 | — |
| `count-min` | Array at `path` has at least N items | number |
| `regex-match` | String at `path` matches regex | pattern string |

### Output format

```json
{
  "success": true,
  "data": {
    "gate_id": "uuid",
    "phase": "design",
    "status": "pass",
    "criteria": [
      { "name": "has-title", "passed": true, "evidence": "..." }
    ],
    "blocking_failures": [],
    "artifact_ref": ".pipeline/runs/<run-id>/design.json",
    "schema_validation": { "valid": true, "errors": [] },
    "timestamp": "2026-02-22T00:00:00.000Z"
  },
  "metadata": { "tool_version": "0.1.0", "execution_time_ms": 5 },
  "logs": ["..."]
}
```

## Development

```bash
npm install
npm run lint
npm run format:check
npm run build
npm test
```
