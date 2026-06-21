# Docker

Deploy **можно.** with Docker Compose. One command to get the server, PostgreSQL database, and all dependencies running.

## Prerequisites

- Docker 24+ and Docker Compose v2
- At least 1 GB of available RAM

## Quick Start

Create a `docker-compose.yml` file and run:

```bash
docker compose up -d
```

The web dashboard will be available at `http://localhost:8080`.

## docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: mozhno-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: mozhno
      POSTGRES_USER: mozhno
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mozhno -d mozhno"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          memory: 512M
    networks:
      - mozhno-net

  mozhno:
    image: ghcr.io/mozhno-dev/mozhno:latest
    container_name: mozhno-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    user: "1001:1001"
    read_only: true
    tmpfs:
      - /tmp:size=64M
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/mozhno
      SPRING_DATASOURCE_USERNAME: mozhno
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-changeme}

      JWT_SECRET: ${JWT_SECRET:-}
      JWT_ACCESS_TOKEN_EXPIRATION: 15m
      JWT_REFRESH_TOKEN_EXPIRATION: 7d

      SERVER_PORT: "8080"

      JAVA_OPTS: >
        -XX:+UseZGC
        -XX:MaxRAMPercentage=75
        -XX:+ExitOnOutOfMemoryError
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "2"
        reservations:
          memory: 512M
          cpus: "0.25"
    networks:
      - mozhno-net

volumes:
  pgdata:

networks:
  mozhno-net:
    driver: bridge
```

## Environment Variables

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | Yes | — | JDBC URL for PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Yes | — | Database user |
| `SPRING_DATASOURCE_PASSWORD` | Yes | — | Database password |

### JWT

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | HMAC-SHA256 signing secret. Minimum 32 characters. |
| `JWT_ACCESS_TOKEN_EXPIRATION` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_TOKEN_EXPIRATION` | No | `7d` | Refresh token lifetime |

### Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SERVER_PORT` | No | `8080` | HTTP port |

### JVM

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JAVA_OPTS` | No | See below | JVM arguments |

JVM defaults:
- `-XX:+UseZGC` — Z Garbage Collector for low-latency pause times
- `-XX:MaxRAMPercentage=75` — Max heap at 75% of container memory limit
- `-XX:+ExitOnOutOfMemoryError` — Fail fast on OOM instead of hanging

### Optional

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOGGING_LEVEL_ROOT` | No | `INFO` | Root log level (`DEBUG`, `INFO`, `WARN`, `ERROR`) |
| `SPRING_FLYWAY_ENABLED` | No | `true` | Run Flyway migrations on startup |
| `CORS_ALLOWED_ORIGINS` | No | `*` | CORS allowed origins |

## Health Checks

The server exposes health endpoints via Spring Boot Actuator:

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Overall health status (DB, disk space) |
| `/actuator/health/liveness` | Application liveness — is the JVM running? |
| `/actuator/health/readiness` | Application readiness — can it serve traffic? |

Docker health check uses `/actuator/health` to detect unhealthy containers.

## Volumes

| Volume | Purpose |
|--------|---------|
| `pgdata` | PostgreSQL data directory. Persists across container restarts. |

## Resource Limits

| Service | CPU Limit | Memory Limit | CPU Reservation | Memory Reservation |
|---------|-----------|--------------|-----------------|--------------------|
| `mozhno` | 2 cores | 2 GB | 0.25 cores | 512 MB |
| `postgres` | — | 512 MB | — | — |

Adjust these based on your workload. Memory reservations ensure the scheduler places containers on nodes with sufficient resources. CPU reservations control minimum CPU shares.

## Network Configuration

All services communicate over the `mozhno-net` bridge network. PostgreSQL is not exposed to the host — only the Mozhno server port `8080` is published.

For production:
- Place the stack behind a reverse proxy (nginx, Traefik, Caddy) for TLS termination
- Use an external PostgreSQL if you already run a managed database
- Bind the server port to `127.0.0.1` if using a reverse proxy on the same host:

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

## Security Considerations

### Non-Root User

The container runs as user `1001:1001` (named `mozhno`), not as root. This limits the impact of a container escape.

### Read-Only Filesystem

The container filesystem is mounted read-only (`read_only: true`). A writable `/tmp` is provided as a `tmpfs` volume (64 MB in memory) for temporary files required by the JVM. No persistent data is written inside the container — all state lives in PostgreSQL.

### Secrets Management

Never hardcode secrets in `docker-compose.yml`. Use:

**Environment file (`.env`):**
```bash
DB_PASSWORD=your-secure-database-password
JWT_SECRET=your-64-character-hex-secret
```

**Docker secrets (Swarm mode):**
```yaml
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

**Environment variable reference** in `docker-compose.yml`:
```yaml
environment:
  SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
```

### Production Checklist

- [ ] Generate a strong `JWT_SECRET` (64+ hex characters)
- [ ] Use a unique, random `DB_PASSWORD`
- [ ] Place behind a reverse proxy with TLS (Let's Encrypt)
- [ ] Bind to `127.0.0.1` if proxy is local
- [ ] Set up database backups (see [Database](/en/self-hosting/database))
- [ ] Configure resource limits appropriate for your workload
- [ ] Pin Docker image tag to a specific version (avoid `latest` in production)
- [ ] Enable Docker log rotation to prevent disk exhaustion

## Dockerfile Multi-Stage Build

The official image is built in three stages:

| Stage | Base Image | Purpose |
|-------|-----------|---------|
| `web-builder` | `node:24-alpine` | Builds React 19 SPA with Vite |
| `java-builder` | `jdk-25-alpine` | Compiles Spring Boot application |
| `runtime` | `jre-noble` | Minimal runtime with JRE only |

The resulting image contains only the JRE and the pre-built static resources embedded in the server JAR — no JDK, no Node.js, no build toolchain.

## Upgrading

```bash
docker compose pull mozhno
docker compose up -d
```

Flyway migrations run automatically on startup. Downtime is typically a few seconds. For zero-downtime upgrades, see [Kubernetes](/en/self-hosting/kubernetes).
