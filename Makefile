.PHONY: help dev db-up db-down server-run server-test web-dev web-test web-lint js-sdk-test js-sdk-build java-sdk-test docker-build docker-up docker-down lint tokens tokens-check clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*##' Makefile | sort | awk 'BEGIN {FS = ":.*##"}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

dev: db-up ## Start full dev environment
	@echo "Start server in another terminal: make server-run"
	@echo "Start web UI in another terminal: make web-dev"

db-up: ## Start PostgreSQL
	docker compose up -d postgres

db-down: ## Stop PostgreSQL
	docker compose down

server-run: ## Run Spring Boot server
	cd web && npm run build:static
	cd server && SPRING_PROFILES_ACTIVE=dev ./gradlew :mozhno-app:bootRun

server-test: ## Run server tests
	cd server && ./gradlew check jacocoTestReport

web-dev: ## Run web UI in dev mode (HMR)
	cd web && npm ci && npm run dev

web-test: ## Run web UI tests
	cd web && npm ci && npm test

web-lint: ## Lint web UI
	cd web && npm run lint

js-sdk-test: ## Run JS SDK tests
	cd sdks/js && npm ci && npm test

js-sdk-build: ## Build JS SDK
	cd sdks/js && npm ci && npm run build

java-sdk-test: ## Run Java SDK tests
	cd server && ./gradlew :mozhno-client-java:check

docker-build: ## Build Docker image locally
	docker build -t mozhno:local .

docker-up: ## Start full stack via docker-compose
	docker compose up -d

docker-down: ## Stop full stack
	docker compose down

tokens: ## Regenerate design-token CSS (web + docs) from packages/design-tokens
	node packages/design-tokens/generate.mjs

tokens-check: ## Fail if generated design-token CSS is stale (CI guard)
	node packages/design-tokens/generate.mjs --check

lint: web-lint ## Run all linters

docs-dev: ## Start docs dev server
	@echo "Docs dev server is served from the main vitepress config"

docs-build: ## Build docs site
	@echo "Docs build is handled by the main vitepress config"

docs-preview: ## Preview built docs site
	@echo "Docs preview is handled by the main vitepress config"

clean: ## Clean build artifacts
	cd server && ./gradlew clean
	rm -rf web/dist sdks/js/dist
