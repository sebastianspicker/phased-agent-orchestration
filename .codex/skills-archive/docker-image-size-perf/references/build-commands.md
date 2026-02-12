# Build commands (examples)

## Enable BuildKit
```bash
export DOCKER_BUILDKIT=1
```

## Build (single platform)
```bash
docker build -t myapp:dev .
```

## Buildx (multi-platform)
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:dev --push .
```

## Show image history
```bash
docker history myapp:dev
```
