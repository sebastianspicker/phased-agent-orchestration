# In-cluster smoke checks (starter)

Pick a small set of checks that validate *user-facing behavior*.

## Examples
- HTTP health endpoint via Service:
  - `kubectl -n <ns> run -it --rm curl --image=curlimages/curl -- curl -fsS http://<svc>:<port>/health`
- DNS resolution inside cluster:
  - `kubectl -n <ns> run -it --rm dns --image=busybox:1.36 -- nslookup <svc>.<ns>.svc.cluster.local`
- Job-based smoke test:
  - run a short Job that calls the critical endpoint and exits 0/1

## Recording
- Always capture: command, output, timestamp, context/namespace.

