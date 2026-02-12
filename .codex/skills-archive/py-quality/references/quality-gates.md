# Python quality gates (pick what exists in repo)

Typical gates (don’t add new ones unless requested):
- Format: `ruff format` or `black .`
- Lint: `ruff check .` or `flake8`
- Types: `mypy .` or `pyright`
- Tests: `pytest`

Recommended order:
1) format
2) lint
3) types
4) tests
