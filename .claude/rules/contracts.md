---
paths:
  - "contracts/**"
---

# Contract Schemas

- Artifacts validate against `contracts/artifacts/*.schema.json`.
- Quality gates validate against `contracts/quality-gate.schema.json`.
- After modifying any schema, run `./scripts/verify.sh`.
- Do not remove required fields from schemas — this is backward-incompatible and will break existing pipeline runs.
- Security-review artifacts (`audit_type=security`) must include structured remediation tracking (`security_audit` coverage, fix-loop evidence, accepted-risk owner/expiry).
