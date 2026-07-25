# Installation

This guide covers all installation methods for **можно**<span class=brand-dot>.</span> — from a quick Docker setup to a full manual deployment.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| JDK | 25+ | Required for building from source. Eclipse Temurin recommended. |
| Node.js | 24+ | Required for the React 19 SPA frontend build. |
| PostgreSQL | 15+ | Required for all deployment methods. |
| Docker | 24+ | Optional. Required for containerized deployment. |

## Docker (Recommended)

The fastest way to get running is with the official Docker image.

```bash
docker pull mozhnodev/mozhno:latest
```

### With Docker Compose

Create a `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feature_flags
      POSTGRES_USER: flags_user
      POSTGRES_PASSWORD: flags_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flags_user -d feature_flags"]
      interval: 5s
      timeout: 5s
      retries: 5

  mozhno:
    image: mozhnodev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_USERNAME: flags_user
      MOZHNO_DB_PASSWORD: flags_password
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

```bash
docker compose up -d
```

The dashboard will be available at `http://localhost:8080`.

## Manual Installation

### Step 1: Clone the repository

```bash
git clone https://github.com/mozhno-dev/mozhno.git
cd mozhno
```

### Step 2: Start PostgreSQL

Ensure PostgreSQL 15+ is running with a database and user:

```sql
CREATE USER flags_user WITH PASSWORD 'flags_password';
CREATE DATABASE feature_flags OWNER flags_user;
```

### Step 3: Configure environment

Create a `.env` file or set environment variables:

```bash
export MOZHNO_DB_URL=jdbc:postgresql://localhost:5432/feature_flags
export MOZHNO_DB_USERNAME=flags_user
export MOZHNO_DB_PASSWORD=flags_password
export MOZHNO_JWT_SECRET=$(openssl rand -base64 32)
```

See [Configuration](/en/intro/configuration) for all available variables.

### Step 4: Build and run

**можно**<span class=brand-dot>.</span> uses a multi-module Gradle project with a Makefile for common tasks.

```bash
# Start PostgreSQL
make db-up

# Build frontend and start server
make server-run
```

Or run manually:

```bash
cd web && npm ci && npm run build:static
cd server && ./gradlew :mozhno-app:bootRun
```

## Make Commands

The project includes a `Makefile` with common operations:

| Command | Description |
|---------|-------------|
| `make dev` | Start PostgreSQL for development |
| `make db-up` | Start PostgreSQL container |
| `make db-down` | Stop PostgreSQL container |
| `make server-run` | Build frontend + run Spring Boot server |
| `make server-test` | Run server tests |
| `make web-dev` | Run web UI in dev mode (HMR) |
| `make web-test` | Run web UI tests |
| `make web-lint` | Lint web UI |
| `make docker-build` | Build Docker image locally |
| `make docker-up` | Start full stack via docker-compose |
| `make docker-down` | Stop full stack |
| `make clean` | Remove build artifacts |

## Database Setup

**можно**<span class=brand-dot>.</span> uses Flyway for schema migrations. Migrations run automatically on server startup via Spring Boot auto-configuration.

The server connects using Spring's `JdbcTemplate` — no JPA or ORM layer. This keeps database access explicit and lightweight.

### Connection URL formats

```
# Local PostgreSQL
jdbc:postgresql://localhost:5432/feature_flags

# Docker PostgreSQL (from another container)
jdbc:postgresql://postgres:5432/feature_flags

# With SSL
jdbc:postgresql://host:5432/feature_flags?ssl=true&sslmode=require
```

## Verifying the Installation

Once the server starts, open the web dashboard at `http://localhost:8080`. You'll be prompted to create an initial project and admin user.

To verify the API is healthy:

```bash
curl http://localhost:8080/actuator/health
```

Swagger UI is available at:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI spec at:

```
http://localhost:8080/v3/api-docs
```

## Next Steps

- [Configuration](/en/intro/configuration) — all environment variables and their defaults
- [Quick Start](/en/intro/quick-start) — create your first flag in 5 minutes
- [Docker Deployment](/en/self-hosting/docker) — production Docker configuration
