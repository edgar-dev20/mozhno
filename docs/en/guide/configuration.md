# Configuration

**можно.** is configured entirely through environment variables. All settings have sensible defaults so you only need to set what differs from the standard setup.

## Required Variables

These must be set for the server to start:

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | Secret key for signing JWTs. Must be at least 256 bits (32 bytes). Generate with `openssl rand -base64 32`. Changing this invalidates all existing tokens. |

## Server Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | Port the embedded Tomcat server listens on |
| `APP_BASE_URL` | `http://localhost:8080` | Publicly reachable URL of the server. Used for generating links in emails, webhook payloads, and OAuth redirects. Must include protocol (http/https) and no trailing slash. |

## Database Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Database password |
| `HIKARI_MAX_POOL_SIZE` | `20` | Maximum connections in the HikariCP connection pool. Increase for high-traffic deployments. |
| `HIKARI_MIN_IDLE` | `5` | Minimum idle connections kept in the pool |
| `HIKARI_CONNECTION_TIMEOUT` | `10000` | Maximum wait time (ms) for a connection from the pool |

## JWT & Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | HMAC-SHA256 secret for signing access and refresh tokens |
| `JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Access token lifetime in minutes |
| `JWT_REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime in days |

**можно.** uses JWT authentication with refresh token family rotation. When a refresh token is used, both the old access and refresh tokens are invalidated and new ones are issued. If a stolen (already-revoked) token is presented, the entire token family is revoked — locking out the attacker.

## Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOGGING_LEVEL_ROOT` | `INFO` | Root log level. Set to `DEBUG` for troubleshooting. |
| `LOGGING_LEVEL_DEV_MOZHNO` | `INFO` | Log level for **можно.** application code |

## CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_CORS_ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed origins for CORS. Set to your frontend origin in production. |

## Cache & Metrics

| Variable | Default | Description |
|----------|---------|-------------|
| `CACHE_TYPE` | `caffeine` | Spring cache type. `caffeine` — in-memory (default). For Redis add `spring-boot-starter-data-redis` and set to `redis` |
| `CACHE_TTL_MINUTES` | `5` | Cache TTL in minutes |
| `CLIENT_MAX_METRICS_PER_KEY` | `1000` | Maximum stored metrics entries per client API key |

## Docker Compose Example

A minimal Docker Compose configuration with all essential variables:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feature_flags
      POSTGRES_USER: flags_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  mozhno:
    image: ghcr.io/mozhno-dev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/feature_flags
      SPRING_DATASOURCE_USERNAME: flags_user
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      APP_BASE_URL: https://flags.example.com
      SERVER_PORT: '8080'
      JWT_ACCESS_TOKEN_TTL_MINUTES: '15'
      JWT_REFRESH_TOKEN_TTL_DAYS: '30'
      HIKARI_MAX_POOL_SIZE: '20'
      HIKARI_MIN_IDLE: '5'
      CACHE_TTL_MINUTES: '5'
```

## Production Checklist

1. **Generate a strong `JWT_SECRET`** — use `openssl rand -base64 32`, never use the default or a predictable value.
2. **Set `APP_BASE_URL`** to your real public URL — incorrect values break OAuth callbacks and webhook delivery.
3. **Restrict `APP_CORS_ALLOWED_ORIGINS`** to your actual frontend domain.
4. **Use environment-specific secrets** — never reuse `JWT_SECRET` across staging and production.
5. **Enable PostgreSQL SSL** — append `?ssl=true&sslmode=require` to the JDBC URL in production.
6. **Set `SERVER_PORT`** if running behind a reverse proxy on a non-standard port.

## SMTP (Email)

| Variable | Default | Description |
|----------|---------|-------------|
| `SMTP_HOST` | `localhost` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_USERNAME` | — | SMTP username |
| `SMTP_PASSWORD` | — | SMTP password |
| `EMAIL_FROM` | `noreply@mozhno.dev` | Sender email address |

## Next Steps

- [Installation](/en/guide/installation) — Docker and manual setup
- [Flags](/en/concepts/flags) — understanding flag types and rules
- [Environments](/en/concepts/environments) — configuring dev, staging, production
