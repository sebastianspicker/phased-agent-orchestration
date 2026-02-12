---
name: containers
description: "Containers playbook. Use when debugging Docker/Compose, hardening Dockerfiles, image size/perf, production compose, networking, or security scans. Choose configuration from user prompt."
---

# containers (Playbook)

Docker and container workflows. **Choose one configuration** from the user prompt.

## When to use (triggers)
- Docker build/container/compose issues → **debug**
- Dockerfile security, reproducibility → **dockerfile-hardening**
- Image size, build perf → **image-size-perf**
- Production docker compose → **compose-production**
- Container networking, DNS, ports → **networking-debug**
- CVE/SBOM scans → **security-scans**

## Choosing configuration from user prompt

| Prompt / theme | Configuration |
|----------------|----------------|
| docker build fail, container crash, compose, health, volumes | debug |
| Dockerfile, non-root, pinned versions, minimal image | dockerfile-hardening |
| image size, layer cache, BuildKit | image-size-perf |
| production compose, profiles, healthchecks, migrations | compose-production |
| container networking, DNS, ports, localhost | networking-debug |
| CVE, SBOM, Trivy, Grype | security-scans |

## Configurations

### debug
Repro (docker version, compose version; smallest failing target) → Inspect (docker ps, logs, inspect; compose ps, logs) → Narrow (build stage, env/mounts, networking) → Fix (pin versions, explicit paths, healthchecks) → Verify (re-run same commands; mirror CI). Checklist: build context/COPY, platform/arch, volume permissions, env mismatch.

### dockerfile-hardening
Non-root user; pinned base and versions; minimal image; no secrets in layers; multi-stage; .dockerignore. Verify: build, run as non-root, no secrets in history.

### image-size-perf
Layer order; cache reuse; BuildKit/buildx; trim deps; CI parity. Verify: image size, build time.

### compose-production
Profiles/overrides; healthchecks; migrations before app; restart policies; log hygiene; backups. Verify: compose up, health, rollback test.

### networking-debug
DNS resolution; port mapping; bridge/host; localhost pitfalls; Mac/Windows differences. Evidence: docker exec into container, dig/nslookup, curl.

### security-scans
Trivy/Grype; SBOM; CVE remediation policy; actionable output. Verify: scan clean or exceptions documented.
