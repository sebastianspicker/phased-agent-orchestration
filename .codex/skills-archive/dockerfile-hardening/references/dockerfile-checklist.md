# Dockerfile checklist

## Security
- [ ] runs as non-root (or exception documented)
- [ ] no secrets in image layers
- [ ] minimal base image chosen intentionally
- [ ] no unnecessary package managers in runtime stage

## Reproducibility
- [ ] base image pinned (tag policy or digest policy documented)
- [ ] dependency installs use lockfiles
- [ ] deterministic build steps

## Performance
- [ ] cache-friendly COPY ordering (lockfiles first)
- [ ] multi-stage build for compiled assets

## Operability
- [ ] health/readiness strategy exists (app-level)
- [ ] logs go to stdout/stderr
