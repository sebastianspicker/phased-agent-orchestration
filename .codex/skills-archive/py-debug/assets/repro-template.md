# Minimal repro template (Python)

## Goal
One command that deterministically reproduces the failure.

## Checklist
- [ ] python version and interpreter path
- [ ] dependency manager (pip/poetry/uv) and lockfile presence
- [ ] exact command + expected vs actual
- [ ] any required env vars

## Examples
```bash
python -V
python -m pytest -q tests/test_thing.py::test_case
```

```bash
PYTHONHASHSEED=0 python -m pytest -q -k flaky_test
```
