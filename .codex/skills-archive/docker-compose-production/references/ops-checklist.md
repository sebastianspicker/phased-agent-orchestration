# Compose ops checklist

- [ ] healthchecks exist for critical services
- [ ] migrations are explicit and repeatable
- [ ] stateful volumes are identified and backed up
- [ ] secrets are not committed; env var strategy documented
- [ ] restart policy is intentional
- [ ] logs are accessible and won’t grow without bound
