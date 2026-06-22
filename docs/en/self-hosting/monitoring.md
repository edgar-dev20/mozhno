# Monitoring & Health Checks

**можно.** provides endpoints for health checks, Prometheus metrics, and distributed tracing via Spring Boot Actuator and Micrometer.

## Health Check

### Endpoint

```
GET /actuator/health
```

Response:

```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

Status codes:
- `UP` — component is healthy
- `DOWN` — component is unavailable

### Docker Usage

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health | grep -q UP"]
  interval: 15s
  timeout: 5s
  retries: 3
  start_period: 60s
```

### Kubernetes Usage

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Prometheus Metrics

### Endpoint

```
GET /actuator/prometheus
```

Metrics are available in Prometheus format and include:

| Category | Example Metrics |
|----------|----------------|
| **HTTP Requests** | `http_server_requests_seconds_count`, `http_server_requests_seconds_sum` |
| **JVM** | `jvm_memory_used_bytes`, `jvm_gc_pause_seconds`, `jvm_threads_live` |
| **HikariCP** | `hikaricp_connections_active`, `hikaricp_connections_pending` |
| **Cache** | `cache_gets_total`, `cache_puts_total`, `cache_evictions_total` |

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'mozhno'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['mozhno:8080']
```

### Key Metrics to Monitor

| Metric | What to Watch |
|--------|------|
| `http_server_requests_seconds_count` | Total request count |
| `http_server_requests_seconds_sum{status="5.."}` | Server errors |
| `jvm_memory_used_bytes{area="heap"}` | Heap memory usage |
| `hikaricp_connections_active` | Active DB connections (should be < `maxSize`) |
| `hikaricp_connections_pending` | Connection queue (should be ~0) |

## Distributed Tracing

**можно.** uses Micrometer Tracing with Brave. Each request receives a `traceId` and `spanId`, passed in headers:

| Header | Description |
|--------|-------------|
| `X-B3-TraceId` | Trace identifier |
| `X-B3-SpanId` | Span identifier |

The `traceId` also appears in logs via MDC (key `traceId`).

Sampling probability setting:

| Variable | Default | Description |
|----------|---------|-------------|
| `MANAGEMENT_TRACING_SAMPLING_PROBABILITY` | `1.0` | Fraction of traced requests (0.0–1.0) |

## Logging

Log format: JSON (via Logstash Logback Encoder). Record structure:

```json
{
  "@timestamp": "2026-06-21T13:41:05.123Z",
  "level": "INFO",
  "logger": "dev.mozhno.flags.FlagService",
  "message": "Flag updated: new-checkout",
  "traceId": "abc123",
  "service": "feature-flags"
}
```

Sensitive data (JWT, API keys, passwords) is automatically masked via `SensitiveDataMasker`.

## Important Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOGGING_LEVEL_DEV_MOZHNO` | `INFO` | Application log level |
| `LOGGING_LEVEL_ROOT` | `INFO` | Root log level |
| `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE` | `health,info,metrics,prometheus` | List of exposed actuator endpoints |
| `MANAGEMENT_TRACING_SAMPLING_PROBABILITY` | `1.0` | Fraction of traced requests |

## Related Pages

- [Docker](/en/self-hosting/docker) — healthcheck and environment variables
- [Kubernetes](/en/self-hosting/kubernetes) — liveness/readiness probes
- [Scaling](/en/self-hosting/scaling) — horizontal scaling
- [Metrics](/en/guide/metrics) — flag usage metrics
