# Healthcheck patterns (minimal)

## HTTP health endpoint
```yaml
healthcheck:
  test: ["CMD", "curl", "-fsS", "http://localhost:3000/health"]
  interval: 10s
  timeout: 3s
  retries: 10
```

## TCP port check (fallback)
```yaml
healthcheck:
  test: ["CMD", "sh", "-c", "nc -z localhost 5432"]
  interval: 10s
  timeout: 3s
  retries: 10
```
