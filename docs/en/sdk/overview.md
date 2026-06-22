# SDK Overview

можно SDKs use **local evaluation** to deliver flag values with minimal latency. Rule sets are fetched once from the server and evaluated locally in your application process — no network round-trip per flag check.

## Architecture

```mermaid
flowchart TD
    subgraph Your Application
        SDK[Mozhno SDK Client]
        Cache[In-Memory Rule Cache]
        Eval[Local Evaluator]
    end

    subgraph Mozhno Server
        API[REST API]
        DB[(PostgreSQL)]
    end

    SDK -->|1. Fetch rules on init| API
    API -->|2. Return flags + rules| SDK
    SDK -->|3. Store in memory| Cache

    App[Application Code] -->|isEnabled| Eval
    Eval -->|Read rules| Cache
    Eval -->|Evaluate against context| Eval
    Eval -->|Return value| App

    SDK -->|Background polling| API
    API -->|Updated flags (ETag)| SDK
    SDK -->|Refresh| Cache
```

### How Local Evaluation Works

1. **Initialisation:** The SDK connects to the можно server and downloads all flag rules and targeting configurations for the environment associated with your API key.
2. **Caching:** Rules are stored in an in-memory cache within your application process.
3. **Evaluation:** When your code calls `isEnabled()`, the SDK evaluates the rules locally against the provided context. No network call is made.
4. **Background Sync:** The SDK periodically polls the server for rule updates. Uses `If-None-Match` / `ETag` for efficient delta detection.

> **Tip:** Local evaluation means flag checks are **sub-millisecond** and work even during temporary network disruptions. The SDK always falls back to the last known rule set.

## Evaluation Logic

The SDK evaluates flags in this order:

1. **Flag disabled?** → `false`
2. **No activation/strategy?** → `true`
3. **Constraints** (AND): all attribute rules must match the context
4. **Segments** (OR): at least one segment must match
5. **Both present:** either constraints or segments passing grants access (OR)
6. **Percentage rollout:** MurmurHash32 over `flagKey + (userId || sessionId)`, compared against configured percentage
7. **Nothing matched** → `false`

### Supported Operators

| Operator | Description |
|----------|-------------|
| `in` | Value is in a list |
| `not_in` | Value is not in a list |
| `eq` | Equal (numeric for `contextType: number`) |
| `ne` | Not equal |
| `gt` | Greater than |
| `gte` | Greater than or equal |
| `lt` | Less than |
| `lte` | Less than or equal |
| `contains` | Substring match |

### Context Types

| Type | Behavior |
|------|----------|
| `string` (default) | Plain string comparison |
| `number` | Numeric comparison (`Double.parseDouble`) |
| `time` | ISO8601 date comparison |
| `semver` | Semantic version comparison |

## Polling

The SDK uses HTTP polling to stay in sync. Default polling interval is **15 seconds** (configurable via `fetchTogglesInterval` / `refreshInterval`).

The server supports `ETag` / `If-None-Match` conditional requests — if nothing changed, the server returns `304 Not Modified`, saving bandwidth.

## Caching Strategy

The SDK maintains an in-memory map of all flag rules. On each poll:

- **Full refresh** on initial fetch
- **Conditional refresh** via ETag on subsequent polls
- Cache is replaced atomically — no partial updates
- Cache is not persisted to disk — fresh rules on restart

| Scenario | Behaviour |
|----------|-----------|
| **Rule update from server** | Entire flag set replaced atomically |
| **Network failure** | Last known rules continue to serve |
| **Flag not found** | `isEnabled()` returns `false` |
| **Missing context attribute** | Constraint evaluates to `false` (rule doesn't match) |

## Client Initialisation

### Java SDK

```java
MozhnoConfig config = MozhnoConfig.builder()
    .appName("my-app")
    .instanceId("instance-1")
    .mozhnoUrl("http://localhost:8080")
    .apiKey("<api-key>")
    .fetchTogglesInterval(15)
    .sendMetricsInterval(60)
    .environment("production")
    .build();

MozhnoClient client = new DefaultMozhnoClient(config);
client.start();
boolean enabled = client.isEnabled("checkout_v2", context);
```

### JavaScript / TypeScript SDK

```typescript
import { MozhnoClient } from "@mozhno/client-js";

const client = new MozhnoClient({
  url: "https://mozhno.example.com",
  apiKey: "<api-key>",
  appName: "my-app",
  refreshInterval: 15,
  metricsInterval: 60,
  environment: "production",
});

await client.start();
const enabled = client.isEnabled("checkout_v2", { userId: "42" });
```

### Configuration Options

| Option | JS Key | Java Key | Default | Description |
|--------|--------|----------|---------|-------------|
| Server URL | `url` | `mozhnoUrl` | **Required** | Base URL of your можно instance |
| API Key | `apiKey` | `apiKey` | **Required** | API key for the environment |
| Application name | `appName` | `appName` | **Required** | Your application identifier |
| Instance ID | `instanceId` | `instanceId` | **Required** (Java) | Unique instance identifier |
| Poll interval (s) | `refreshInterval` | `fetchTogglesInterval` | `15` | Polling interval in seconds |
| Metrics interval (s) | `metricsInterval` | `sendMetricsInterval` | `60` | Metrics reporting interval |
| Environment | `environment` | `environment` | `"default"` | Environment name |
| Disable metrics | `disableMetrics` | `disableMetrics` | `false` | Disable metrics reporting |

## Evaluation Context

The context carries user/request attributes used for targeting:

**Java:**
```java
MozhnoContext context = MozhnoContext.builder()
    .userId("12345")
    .sessionId("session-abc")
    .addProperty("country", "DE")
    .addProperty("plan", "enterprise")
    .build();
```

**JavaScript:**
```typescript
const context = {
  userId: "12345",
  sessionId: "session-abc",
  country: "DE",
  plan: "enterprise",
};
```

## Error Handling & Resilience

### SDK Startup

| Scenario | Java SDK | JS SDK |
|----------|----------|--------|
| **Server reachable at startup** | Fetches rules, client ready | Fetches rules, client ready |
| **Server unreachable at startup** | Throws exception with `synchronousFetchOnInitialisation(true)`. Otherwise starts and retries in background | Promise is rejected |
| **Server goes down during runtime** | Uses cached state. Background retries | Uses cached state. Background retries |

> **Tip:** In production, use `synchronousFetchOnInitialisation(false)` (default) — the SDK starts even if the server is temporarily down, and catches up when connectivity is restored.

### Flag Evaluation

| Scenario | Behavior |
|----------|----------|
| **Flag not found** | Returns `false` (fail-closed) |
| **Flag exists, cache empty** | Returns `false` — safe default |
| **Context attribute missing** | Rule referencing that attribute returns `false` |
| **Network unavailable** | Cached rules continue to work |

### Propagation Delay

Flag changes in the dashboard reach the SDK within one **polling interval** (default 15 seconds).

## SDK Comparison

| Feature | Java SDK | JavaScript SDK |
|---------|----------|----------------|
| **Platform** | JVM 25+ | Node.js, Browser |
| **Package** | `dev.mozhno:mozhno-client-java` (Gradle) | `@mozhno/client-js` (npm) |
| **Evaluation** | Synchronous | Synchronous (in-memory cache) |
| **Thread safety** | Fully thread-safe (ConcurrentHashMap) | Single-threaded event loop |
| **Circuit breaker** | Yes (5 failures → 60s cooldown) | No |
| **Spring Boot** | Auto-configuration (`mozhno.*` properties) | N/A |

## Performance Characteristics

| Metric | Typical Value |
|--------|---------------|
| **Initial fetch latency** | 50-200 ms |
| **Local evaluation time** | < 1 ms |
| **Memory overhead** | ~1 KB per flag |
| **Polling payload (no changes)** | 0 bytes (304 Not Modified) |

## Next Steps

- [Java SDK](./java.md) — Gradle setup, builder API, full reference.
- [JavaScript SDK](./javascript.md) — npm setup, async patterns.
- [REST API](../api/rest.md) — Programmatic access to flags, segments, and environments.
