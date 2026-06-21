# Installation

This guide covers all installation methods for **можно.** — from a quick Docker setup to a full manual deployment.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| JDK | 25+ | Required for building from source. Temurin or GraalVM recommended. |
| Node.js | 24+ | Required for the React 19 SPA frontend build. |
| PostgreSQL | 15+ | Required for all deployment methods. |
| Docker | 24+ | Optional. Required for containerized deployment. |

## Docker (Recommended)

The fastest way to get running is with the official Docker image.

```bash
docker pull ghcr.io/mozhno-dev/mozhno:latest
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
    image: ghcr.io/mozhno-dev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/feature_flags
      SPRING_DATASOURCE_USERNAME: flags_user
      SPRING_DATASOURCE_PASSWORD: flags_password
      JWT_SECRET: change-me-to-a-real-256-bit-secret
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
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/feature_flags
export SPRING_DATASOURCE_USERNAME=flags_user
export SPRING_DATASOURCE_PASSWORD=flags_password
export JWT_SECRET=$(openssl rand -base64 32)
```

See [Configuration](/en/guide/configuration) for all available variables.

### Step 4: Build and run

**можно.** uses a modular Maven project with a Makefile for common tasks.

```bash
# Build the entire project (backend + frontend)
make build

# Run database migrations
make migrate

# Start the server
make run
```

Alternatively, use Maven directly:

```bash
./mvnw clean package -DskipTests
java -jar mozhno-app/target/mozhno-app-*.jar
```

### Build from source without Make

If you don't have `make` installed:

```bash
# Build backend
./mvnw clean package -DskipTests

# Build frontend (React 19 SPA)
cd mozhno-web
npm ci
npm run build
cd ..

# Run
java -jar mozhno-app/target/mozhno-app.jar
```

## Make Commands

The project includes a `Makefile` with common operations:

| Command | Description |
|---------|-------------|
| `make build` | Build backend JAR and frontend bundle |
| `make run` | Start the server on port 8080 |
| `make migrate` | Run Flyway database migrations |
| `make clean` | Remove build artifacts |
| `make test` | Run the full test suite |
| `make docker-build` | Build the Docker image locally |
| `make docker-run` | Run with Docker Compose |

## Database Setup

**можно.** uses Flyway for schema migrations. Migrations run automatically on server startup via Spring Boot auto-configuration.

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

## Kubernetes

Kubernetes manifests are provided in the `k8s/` directory:

```bash
kubectl apply -f k8s/
```

This deploys PostgreSQL (StatefulSet), the **можно.** server (Deployment with HPA), ConfigMaps, Secrets, and a PDB. See [Kubernetes](/en/self-hosting/kubernetes) for detailed instructions.

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

- [Configuration](/en/guide/configuration) — all environment variables and their defaults
- [Quick Start](/en/guide/quick-start) — create your first flag in 5 minutes
- [Docker Deployment](/en/self-hosting/docker) — production Docker configuration
