# Configuration

**можно.** is configured entirely through environment variables. All settings have sensible defaults so you only need to set what differs from the standard setup.

## Required Variables

These must be set for the server to start:

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | — | JDBC URL for the PostgreSQL database. Format: `jdbc:postgresql://host:port/database` |
| `SPRING_DATASOURCE_USERNAME` | — | Database user with full access to the schema |
| `SPRING_DATASOURCE_PASSWORD` | — | Password for the database user |
| `JWT_SECRET` | — | Secret key for signing JWTs. Must be at least 256 bits (32 bytes). Generate with `openssl rand -base64 32`. Changing this invalidates all existing tokens. |

## Server Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | Port the embedded Tomcat server listens on |
| `APP_BASE_URL` | `http://localhost:8080` | Publicly reachable URL of the server. Used for generating links in emails, webhook payloads, and OAuth redirects. Must include protocol (http/https) and no trailing slash. |

## Database Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | — | JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | — | Database username |
| `SPRING_DATASOURCE_PASSWORD` | — | Database password |
| `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE` | `10` | Maximum connections in the HikariCP connection pool. Increase for high-traffic deployments. |
| `SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE` | `5` | Minimum idle connections kept in the pool |
| `SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT` | `30000` | Maximum wait time (ms) for a connection from the pool |
| `SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT` | `600000` | Maximum idle time (ms) before a connection is closed |
| `SPRING_DATASOURCE_HIKARI_MAX_LIFETIME` | `1800000` | Maximum lifetime (ms) of a connection in the pool |

## JWT & Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | HMAC-SHA256 secret for signing access and refresh tokens |
| `JWT_ACCESS_TOKEN_EXPIRATION` | `900000` | Access token lifetime in milliseconds (default: 15 minutes) |
| `JWT_REFRESH_TOKEN_EXPIRATION` | `604800000` | Refresh token lifetime in milliseconds (default: 7 days) |

**можно.** uses JWT authentication with refresh token rotation. When a refresh token is used, both the old access and refresh tokens are invalidated and new ones are issued. This limits the damage window of a leaked refresh token.

## Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOGGING_LEVEL_ROOT` | `INFO` | Root log level. Set to `DEBUG` for troubleshooting. |
| `LOGGING_LEVEL_DEV_MOZHNO` | `INFO` | Log level for **можно.** application code |
| `LOGGING_PATTERN_CONSOLE` | — | Custom log pattern for console output |

## CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_CORS_ALLOWED_ORIGINS` | `*` | Comma-separated list of allowed origins for CORS. Set to your frontend origin in production. Example: `https://dashboard.example.com` |

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
      JWT_ACCESS_TOKEN_EXPIRATION: '900000'
      JWT_REFRESH_TOKEN_EXPIRATION: '604800000'
```

## Production Checklist

1. **Generate a strong `JWT_SECRET`** — use `openssl rand -base64 32`, never use the default or a predictable value.
2. **Set `APP_BASE_URL`** to your real public URL — incorrect values break OAuth callbacks and webhook delivery.
3. **Restrict `APP_CORS_ALLOWED_ORIGINS`** to your actual frontend domain.
4. **Use environment-specific secrets** — never reuse `JWT_SECRET` across staging and production.
5. **Enable PostgreSQL SSL** — append `?ssl=true&sslmode=require` to the JDBC URL in production.
6. **Set `SERVER_PORT`** if running behind a reverse proxy on a non-standard port.

## Next Steps

- [Installation](/en/guide/installation) — Docker and manual setup
- [Flags](/en/concepts/flags) — understanding flag types and rules
- [Environments](/en/concepts/environments) — configuring dev, staging, production
