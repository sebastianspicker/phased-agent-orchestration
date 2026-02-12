# Kubernetes networking command snippets

## DNS inside cluster
- `kubectl -n <ns> run -it --rm dns --image=busybox:1.36 -- nslookup <svc>`

## Service/endpoints
- `kubectl -n <ns> get svc <svc> -o wide`
- `kubectl -n <ns> get endpoints <svc> -o yaml`
- `kubectl -n <ns> get endpointSlice -l kubernetes.io/service-name=<svc>`

## Ingress
- `kubectl -n <ns> get ingress -o wide`
- `kubectl -n <ns> describe ingress <name>`

## NetworkPolicies
- `kubectl -n <ns> get netpol`
- `kubectl -n <ns> describe netpol <name>`

