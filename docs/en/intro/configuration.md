# Configuration

**можно**<span class=brand-dot>.</span> is configured entirely through `MOZHNO_*` environment variables. All settings have sensible defaults so you only need to set what differs from the standard setup.

> **Config model:** the application reads configuration **only** from `MOZHNO_*` environment variables. All have safe defaults — the server starts without any configuration. A full template is in [`.env.example`](https://github.com/mozhno-dev/mozhno/blob/main/.env.example). The `dev` profile (`SPRING_PROFILES_ACTIVE=dev`) is for local development from source only.

## How to set variables

**Docker Compose** — under the service `environment` section:

```yaml
services:
  mozhno:
    image: mozhnodev/mozhno:latest
    environment:
      MOZHNO_JWT_SECRET: ${MOZHNO_JWT_SECRET}   # from .env or host environment
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_PASSWORD: secret
      MOZHNO_BASE_URL: https://flags.example.com
```

**`docker run`** — via `-e` flags:

```bash
docker run -p 8080:8080 \
  -e MOZHNO_JWT_SECRET=$(openssl rand -base64 32) \
  -e MOZHNO_DB_URL=jdbc:postgresql://db:5432/feature_flags \
  -e MOZHNO_DB_PASSWORD=secret \
  mozhnodev/mozhno:latest
```

**`.env` file** (picked up by Docker Compose automatically):

```bash
MOZHNO_JWT_SECRET=your-256-bit-secret
MOZHNO_DB_PASSWORD=secret
MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES=30
```

**Running the JAR directly** — via process environment variables:

```bash
export MOZHNO_JWT_SECRET=$(openssl rand -base64 32)
export MOZHNO_DB_PASSWORD=secret
java -jar mozhno.jar
```

## Core Variables

These are the most commonly configured environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_JWT_SECRET` | — (optional for dev) | Secret key for signing JWTs. Minimum 256 bits (32 bytes), Base64-encoded. If not set, a random key is generated at startup — tokens will be invalidated on restart. Set explicitly for production. |
| `MOZHNO_SERVER_PORT` | `8080` | HTTP listen port |
| `MOZHNO_BASE_URL` | `http://localhost:8080` | Publicly reachable URL of the server. Used for generating links in emails, webhook payloads, and OAuth redirects. Must include protocol (http/https) and no trailing slash. |

## Database Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_DB_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC connection URL |
| `MOZHNO_DB_USERNAME` | `flags_user` | Database username |
| `MOZHNO_DB_PASSWORD` | `flags_password` | Database password |
| `MOZHNO_DB_POOL_MAX_SIZE` | `20` | Maximum connections in the HikariCP connection pool. Increase for high-traffic deployments. |
| `MOZHNO_DB_POOL_MIN_IDLE` | `5` | Minimum idle connections kept in the pool |
| `MOZHNO_DB_POOL_CONNECTION_TIMEOUT` | `10000` | Maximum wait time (ms) for a connection from the pool |

## JWT & Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_JWT_SECRET` | — (optional for dev) | HMAC-SHA256 secret for signing access and refresh tokens. Auto-generated on startup if not set — set explicitly in production so tokens survive restarts |
| `MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Access token lifetime in minutes |
| `MOZHNO_JWT_REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime in days |

**можно**<span class=brand-dot>.</span> uses JWT authentication with refresh token family rotation. When a refresh token is used, both the old access and refresh tokens are invalidated and new ones are issued. If a stolen (already-revoked) token is presented, the entire token family is revoked — locking out the attacker.

## Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOGGING_LEVEL_ROOT` | `INFO` | Root log level. Set to `DEBUG` for troubleshooting. |
| `LOGGING_LEVEL_DEV_MOZHNO` | `INFO` | Log level for **можно**<span class=brand-dot>.</span> application code |

## CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_SECURITY_CORS_ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed origins for CORS. Set to your frontend origin in production. |

## Cache & Metrics

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_CACHE_TYPE` | `caffeine` | Spring cache type. `caffeine` — in-memory (default). For Redis add `spring-boot-starter-data-redis` and set to `redis` |
| `MOZHNO_CACHE_TTL_MINUTES` | `5` | Cache TTL in minutes |
| `MOZHNO_CLIENT_MAX_METRICS_PER_KEY` | `1000` | Maximum stored metrics entries per client API key |

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
    image: mozhnodev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_USERNAME: flags_user
      MOZHNO_DB_PASSWORD: ${DB_PASSWORD}
      MOZHNO_JWT_SECRET: ${MOZHNO_JWT_SECRET}
      MOZHNO_BASE_URL: https://flags.example.com
      MOZHNO_SERVER_PORT: '8080'
      MOZHNO_JWT_ACCESS_TOKEN_TTL_MINUTES: '15'
      MOZHNO_JWT_REFRESH_TOKEN_TTL_DAYS: '30'
      MOZHNO_DB_POOL_MAX_SIZE: '20'
      MOZHNO_DB_POOL_MIN_IDLE: '5'
      MOZHNO_CACHE_TTL_MINUTES: '5'
```

## Production Checklist

1. **Generate a strong `MOZHNO_JWT_SECRET`** — use `openssl rand -base64 32`, never use the default or a predictable value.
2. **Set `MOZHNO_BASE_URL`** to your real public URL — incorrect values break OAuth callbacks and webhook delivery.
3. **Restrict `MOZHNO_SECURITY_CORS_ALLOWED_ORIGINS`** to your actual frontend domain.
4. **Use environment-specific secrets** — never reuse `MOZHNO_JWT_SECRET` across staging and production.
5. **Enable PostgreSQL SSL** — append `?ssl=true&sslmode=require` to the JDBC URL in production.
6. **Set `MOZHNO_SERVER_PORT`** if running behind a reverse proxy on a non-standard port.

## SMTP (Email)

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_SMTP_HOST` | `localhost` | SMTP server host |
| `MOZHNO_SMTP_PORT` | `587` | SMTP server port |
| `MOZHNO_SMTP_USERNAME` | — | SMTP username |
| `MOZHNO_SMTP_PASSWORD` | — | SMTP password |
| `MOZHNO_MAIL_FROM` | `noreply@mozhno.dev` | Sender email address |

## More Settings

Additional groups with sensible defaults (no need to change unless tuning):

| Variable | Default | Description |
|----------|---------|-------------|
| `MOZHNO_SECURITY_BCRYPT_STRENGTH` | `12` | BCrypt hashing cost factor |
| `MOZHNO_SECURITY_MAX_FAILED_LOGIN_ATTEMPTS` | `5` | Failed logins before account lockout |
| `MOZHNO_SECURITY_LOCKOUT_DURATION_MINUTES` | `15` | Account lockout duration (minutes) |
| `MOZHNO_AUTH_PASSWORD_RESET_TOKEN_TTL_HOURS` | `1` | Password reset token lifetime (hours) |
| `MOZHNO_AUTH_PASSWORD_RESET_COOLDOWN_MINUTES` | `5` | Minimum delay between reset emails (minutes) |
| `MOZHNO_AUTH_INVITE_TOKEN_TTL_DAYS` | `7` | Invite token lifetime (days) |
| `MOZHNO_WEBHOOK_CONNECT_TIMEOUT_SECONDS` | `10` | Webhook connect timeout (seconds) |
| `MOZHNO_WEBHOOK_REQUEST_TIMEOUT_SECONDS` | `30` | Webhook request timeout (seconds) |
| `MOZHNO_WEBHOOK_ASYNC_CORE_POOL_SIZE` | `4` | Webhook thread pool core size |
| `MOZHNO_WEBHOOK_ASYNC_MAX_POOL_SIZE` | `16` | Webhook thread pool max size |
| `MOZHNO_WEBHOOK_ASYNC_QUEUE_CAPACITY` | `100` | Webhook task queue capacity |
| `MOZHNO_FLAGS_MAX_TAGS_PER_FLAG` | `10` | Max tags per flag |
| `MOZHNO_FLAGS_DEFAULT_PAGE_SIZE` | `50` | Default page size |
| `MOZHNO_FLAGS_MAX_PAGE_SIZE` | `200` | Max page size (flag listing) |
| `MOZHNO_FLAGS_ENRICHED_MAX_PAGE_SIZE` | `500` | Max page size (enriched listing) |
| `MOZHNO_CACHE_MAX_SIZE` | `5000` | Max entries per cache |
| `MOZHNO_MANAGEMENT_PORT` | `9090` | Actuator/metrics port |
| `MOZHNO_SWAGGER_ENABLED` | `true` | Enable Swagger UI |
| `MOZHNO_LOG_LEVEL_ROOT` | `INFO` | Root log level |
| `MOZHNO_LOG_LEVEL_APP` | `INFO` | `dev.mozhno` log level |

The full list with defaults is in [`.env.example`](https://github.com/mozhno-dev/mozhno/blob/main/.env.example).

## Next Steps

- [Installation](/en/intro/installation) — Docker and manual setup
- [Flags](/en/concepts/flags) — understanding flag types and rules
- [Environments](/en/concepts/environments) — configuring dev, staging, production
