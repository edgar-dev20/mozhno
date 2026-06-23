# Troubleshooting

Common issues when working with **можно**<span class=brand-dot>.</span> and how to solve them.

## SDK

### SDK Cannot Connect to the Server

**Symptom:** client fails to start, `start()` throws an exception or the Promise is rejected.

**Causes and solutions:**

| Cause | Solution |
|-------|----------|
| Wrong server URL | Check `mozhnoUrl` / `url`. Must be a full URL with protocol. |
| Invalid API key | Check `apiKey`. The key is shown only once on creation — create a new one if lost. |
| Server is unreachable | `curl http://localhost:8080/actuator/health`. No response means the server is not running. |
| Environment mismatch | API key is bound to an environment. A key from `dev` cannot access `production`. |
| Network restrictions | Check firewall, VPN, proxy. |

### Flag Always Returns `false`

**Causes:**

| Cause | Solution |
|-------|----------|
| Flag is archived | Restore the flag: `POST /api/v1/flags/{id}/unarchive` |
| Strategy is disabled | Check in the dashboard: `enabled: true` |
| Context does not match | Check context attributes and targeting rules |
| Flag does not exist | Check for typos in the key. `isEnabled` returns `false` for unknown flags. |
| Cache is stale | Wait for the polling interval (15 sec) or restart the SDK |

### Flags Not Updating After Dashboard Changes

**Cause:** polling interval.

**Solution:**
- By default, the SDK polls the server every 15 seconds
- Wait for the next polling cycle
- Reduce `fetchTogglesInterval` / `refreshInterval` (but not below 5 seconds)
- For instant effect, use Kill Switch

### SDK Throws an Exception on Start

In Java SDK with `synchronousFetchOnInitialisation(true)`:

```java
// If the server is unreachable, this throws an exception
MozhnoConfig config = MozhnoConfig.builder()
    .synchronousFetchOnInitialisation(true)  // <-- this is the cause
    .build();
```

**Solution:** wrap in try/catch or disable synchronous fetch (SDK will continue background retries).

## Authentication

### "401 UNAUTHORIZED" on All Requests

| Cause | Solution |
|-------|----------|
| JWT expired (15 min) | Refresh via `POST /api/v1/auth/refresh` |
| Refresh token expired (30 days) | Log in again |
| TOKEN_REUSE | Your refresh token was reused (possible compromise). Log in again. |
| Wrong header format | Must be `Authorization: Bearer <token>` |

### "403 FORBIDDEN"

| Role | Access |
|------|--------|
| VIEWER | Read-only. Cannot create/modify flags. |
| DEVELOPER | Cannot manage users and API keys. |

Request a role upgrade from an ADMIN.

## Database

### Server Won't Start: "Connection Refused"

**Cause:** PostgreSQL is unreachable.

**Solution:**
1. Check `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
2. Ensure PostgreSQL is running: `pg_isready -U flags_user -d feature_flags`
3. In Docker: check `depends_on: postgres: service_healthy`

### Flyway Migrations Not Applied

**Symptom:** `liquibase` errors or tables not created.

**Solution:**
1. Check `SPRING_FLYWAY_ENABLED=true`
2. Check `SPRING_FLYWAY_LOCATIONS=classpath:db/migration`
3. Review the `flyway_schema_history` table in the database — see if entries exist

## Metrics

### Metrics Not Showing in Dashboard

| Cause | Solution |
|-------|----------|
| `disableMetrics: true` in SDK | Remove or set to `false` |
| Interval has not passed yet | Metrics are sent every 60 seconds |
| `CLIENT_MAX_METRICS_PER_KEY` exceeded | Increase the limit or delete old metrics |

### Sparkline Chart Is Empty

Metrics accumulate over time. Let the SDK run for at least 5–10 minutes for data to appear.

## Rate Limiting

### "429 RATE_LIMIT_EXCEEDED"

You have exceeded the request limit. Limits:

| Operation | Limit |
|-----------|-------|
| Login | 5 attempts per minute |
| Password reset / invite | 3 attempts per hour |
| Token refresh | 10 attempts per minute |
| SDK requests | 1000 per minute |
| Admin write operations | 100 per minute |

**Solution:** wait for the next refill interval or increase limits via environment variables.

## Deployment

### Docker Container Keeps Restarting

**Causes:**
1. Database is not ready — increase `start_period` in healthcheck
2. `JWT_SECRET` is not set in production
3. Insufficient memory — check `docker stats`, increase `deploy.resources.limits.memory`

### 502 / 504 Behind a Reverse Proxy

Increase proxy timeouts:

```nginx
proxy_read_timeout 60s;
proxy_connect_timeout 10s;
```

## Related Pages

- [Monitoring](/en/self-hosting/monitoring) — health checks, metrics, logs
- [Configuration](/en/intro/configuration) — all environment variables
- [SDK Overview](/en/sdk/overview) — client library architecture
