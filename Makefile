.PHONY: help verify verify-fast lint build test init-pipeline regen-adapters install-hooks

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

verify: ## Full repo verification (lint + build + test + integrity checks)
	./scripts/verify.sh

verify-fast: ## Changed-only verification (faster for local iteration)
	./scripts/verify.sh --changed-only

lint: ## Lint all runtime skill packages
	cd skills/dev-tools/quality-gate && npm run lint
	cd skills/dev-tools/multi-model-review && npm run lint
	cd skills/dev-tools/trace-collector && npm run lint

build: ## Build all runtime skill packages
	cd skills/dev-tools/quality-gate && npm run build
	cd skills/dev-tools/multi-model-review && npm run build
	cd skills/dev-tools/trace-collector && npm run build

test: ## Run all tests (skill packages + pipeline runner)
	cd skills/dev-tools/quality-gate && npm test
	cd skills/dev-tools/multi-model-review && npm test
	cd skills/dev-tools/trace-collector && npm test
	cd scripts/pipeline && npx vitest run

init-pipeline: ## Initialize a new pipeline run
	./scripts/pipeline-init.sh

regen-adapters: ## Regenerate runner adapter files from templates
	python3 scripts/adapters/generate_adapters.py

install-hooks: ## Install pre-commit git hooks (run once after cloning)
	bash scripts/install-hooks.sh
