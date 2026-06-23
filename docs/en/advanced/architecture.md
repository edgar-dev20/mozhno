# Architecture

Technical architecture of **можно**<span class=brand-dot>.</span> — module structure, tech stack, evaluation flow, and authentication.

## Module Diagram

```mermaid
graph TD
    subgraph "mozhno Application"
        APP[mozhno-app<br/>Entry point, static resources, Flyway]
        API[mozhno-web-api<br/>REST controllers, Spring Security 6, JWT, OpenAPI]
        CORE[mozhno-core<br/>Business logic, flag engine, storage, caching]
        SPI[mozhno-spi<br/>Extension interfaces]
    end

    APP --> API
    APP --> CORE
    API --> CORE
    CORE --> SPI
    SPI -.-> ENT[Enterprise JAR<br/>PremiumPlugin implementations]

    DB[(PostgreSQL)]
    REACT[React 19 SPA<br/>Embedded static/]

    APP --> DB
    APP --> REACT
    CORE --> DB
```

### Module Responsibilities

| Module | Role | Key Classes |
|--------|------|-------------|
| **mozhno-spi** | Interface definitions for the plugin system. No dependencies on other modules. | `AuthenticationProviderSpi`, `FeatureGateSpi`, `QuotaSpi`, `BillingSpi`, `AuditSpi`, `MetricsSinkSpi` |
| **mozhno-core** | Business logic: flag evaluation engine, user/segment storage, audit trail. Depends on `mozhno-spi`. | `FlagService`, `SegmentService`, `AuditService`, `FeatureFlagEvaluator` |
| **mozhno-web-api** | REST API layer: controllers, Spring Security 6 filter chain, JWT processing, OpenAPI/Swagger docs. Depends on `mozhno-core`. | `FlagController`, `AuthController`, `JwtService`, `SecurityConfig` |
| **mozhno-app** | Spring Boot entry point, embedded static React SPA, Flyway migration runner. Depends on all modules above. | `Server`, `application.yml`, `db/migration/*.sql` |

## Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | JDK | 25 | ZGC, latest features |
| **Framework** | Spring Boot | 4.0 | DI, auto-configuration, Actuator, production-ready defaults |
| **Database Access** | JdbcTemplate + RowMapper | — | Direct SQL, no ORM overhead, predictable query plans |
| **Migrations** | Flyway | 10.x | Schema versioning, repeatable migrations, CI/CD integration |
| **Connection Pool** | HikariCP | 6.x | Fastest JDBC pool, metrics, leak detection |
| **Caching** | Caffeine | 3.x | In-process cache, Window TinyLFU, near-optimal hit rate |
| **Auth** | Spring Security 6 | — | Filter chain, JWT stateless auth, method security |
| **JWT** | HMAC-SHA256 | — | Symmetric signing, no external auth server needed |
| **Frontend** | React | 19 | SPA, declarative UI, ecosystem |
| **CSS** | Tailwind CSS | 4 | Utility-first, JIT compilation, design system tokens |
| **UI Primitives** | Radix UI | — | Headless accessible components, unstyled by default |
| **Docs / API** | SpringDoc OpenAPI | 2.x | Swagger UI, request validation, schema generation |
| **Metrics** | Micrometer | — | Actuator integration, Prometheus support |
| **Build** | Gradle | — | Multi-module, reproducible builds |

## Flag Evaluation Flow

```mermaid
sequenceDiagram
    participant App as Your Application
    participant SDK as Java/JS SDK
    participant Server as Mozhno Server
    participant DB as PostgreSQL
    participant Cache as Caffeine Cache

    Note over SDK: Initialization
    SDK->>Server: GET /api/client/features<br/>Authorization: Bearer <api-key>
    Server->>DB: SELECT flags for environment
    DB-->>Server: Flag list with rules
    Server-->>SDK: JSON payload
    SDK->>SDK: Parse and cache locally

    Note over App,SDK: Runtime Flag Evaluation
    App->>SDK: isEnabled("feature-x", context)
    SDK->>SDK: Find flag in local cache
    SDK->>SDK: Evaluate strategies against context
    SDK-->>App: true / false

    Note over SDK,Server: Background Sync (every 30s)
    SDK->>Server: GET /api/client/features?since=<timestamp>
    Server->>Cache: Check flag cache
    alt Cache Hit
        Cache-->>Server: Cached flags
    else Cache Miss
        Server->>DB: SELECT flags WHERE updated > timestamp
        DB-->>Server: Updated flags
        Server->>Cache: Update cache
    end
    Server-->>SDK: Delta (only changed flags)
    SDK->>SDK: Merge delta into local cache
```

### Key Design Decisions

1. **Local evaluation** — the SDK holds a complete snapshot of flag rules. Evaluations happen in-process with zero network calls and zero latency. This is critical for high-throughput applications where a remote evaluation call on every `if (flag)` would add unacceptable overhead.

2. **Delta sync** — the SDK sends a `since` timestamp. The server returns only flags changed since that timestamp, not the full set. For 1000 flags where 2 changed, the payload is ~200 bytes instead of ~50 KB.

3. **Server-side cache** — the server caches flag rules in Caffeine (30 s TTL). SDK requests hit the cache, not the database directly. This absorbs the fan-out from many SDK instances polling the same environment.

## JWT Authentication Flow

```mermaid
sequenceDiagram
    participant Browser as Web Dashboard
    participant Server as Mozhno Server
    participant DB as PostgreSQL

    Note over Browser,Server: Login
    Browser->>Server: POST /api/v1/auth/login<br/>{email, password}
    Server->>DB: SELECT user WHERE email = ?
    DB-->>Server: User (with bcrypt hash)
    Server->>Server: Verify bcrypt(password, hash)
    Server->>Server: Generate access token (15 min)
    Server->>Server: Generate refresh token (30 days)
    Server->>DB: INSERT refresh_token<br/>(family_id, token_hash, expiry)
    Server-->>Browser: {accessToken, refreshToken}

    Note over Browser,Server: Authenticated Request
    Browser->>Server: GET /api/v1/flags<br/>Authorization: Bearer <accessToken>
    Server->>Server: Validate HMAC-SHA256 signature
    Server->>Server: Parse claims (sub, roles, exp)
    Server->>Server: Check exp > now
    Server-->>Browser: Flag list

    Note over Browser,Server: Token Refresh
    Browser->>Server: POST /api/v1/auth/refresh<br/>{refreshToken}
    Server->>DB: SELECT * FROM refresh_tokens<br/>WHERE token_hash = ?<br/>FOR UPDATE
    alt Token valid & not revoked
        DB-->>Server: Token row (locked)
        Server->>DB: UPDATE refresh_tokens SET revoked = true<br/>WHERE id = ?
        Server->>DB: INSERT new refresh_token<br/>(same family_id, new hash)
        Server->>Server: Generate new access + refresh tokens
        Server-->>Browser: {accessToken, refreshToken}
    else Token revoked (reuse detected)
        Server->>DB: UPDATE refresh_tokens SET revoked = true<br/>WHERE family_id = ?
        Server-->>Browser: 401 Unauthorized
    end
```

### Refresh Token Family Rotation

Refresh tokens use **family rotation** for theft detection:

1. On refresh, the old refresh token is revoked and a new one issued — both share the same `family_id`.
2. If a revoked token is presented (indicating it was stolen and the attacker is using it before the legitimate user), the **entire family is revoked**.
3. This forces all devices to re-authenticate, effectively locking out the attacker.

The database uses `SELECT ... FOR UPDATE` row-level locking on refresh token lookup to prevent race conditions under concurrent requests.

### JWT Claims

| Claim | Description |
|-------|-------------|
| `sub` | User ID |
| `iat` | Issued at (epoch seconds) |
| `exp` | Expiration (epoch seconds, +15 min from `iat`) |
| `roles` | User roles array (`["ADMIN", "DEVELOPER", "VIEWER"]`) |

## SPI Extension System

```mermaid
graph TD
    REQ[Request] --> CHAIN{SPI Priority Chain}
    CHAIN -->|Priority 1| P1[Enterprise: SSO Auth]
    CHAIN -->|Priority 2| P2[Enterprise: Custom Strategy]
    CHAIN -->|Fall through| DEF[Default: Built-in Auth]
    P1 -->|Not implemented, throws| CHAIN
    P2 -->|Not implemented, throws| CHAIN
    DEF --> RESP[Response]
```

Each SPI interface forms a priority chain. On each request, the system tries providers in order of priority. If a provider does not implement the interface (throws `UnsupportedOperationException`), the chain falls through to the next provider. The built-in default provider is always last.

See [Open Core](/en/advanced/open-core) for the full SPI interface catalog and enterprise deployment model.

## Static Resources

The React 19 SPA is built separately and embedded in the server JAR under `static/`. Spring Boot serves it as classpath static resources:

```
mozhno-app.jar
├── BOOT-INF/classes/static/
│   ├── index.html
│   ├── assets/
│   │   ├── index-abc123.js
│   │   └── index-def456.css
│   └── favicon.ico
└── WEB-INF/classes/db/migration/
    ├── V1__initial_schema.sql
    └── V2__add_audit_log.sql
```

No separate frontend server. No CORS configuration for the dashboard (same origin). All routes that don't match `/api/*` serve `index.html` for client-side routing.

## Virtual Threads

Spring Boot 4.0 on JDK 25 uses virtual threads by default for request handling:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

Virtual threads are lightweight JVM-managed threads that allow the server to handle tens of thousands of concurrent connections without the overhead of platform threads. They are particularly effective for I/O-bound workloads like REST APIs where most time is spent waiting for database queries.

## Related Pages

- [Open Core](/en/advanced/open-core) — SPI interfaces and enterprise features
- [Migration](/en/advanced/migration) — Migrate from other platforms
- [Docker](/en/self-hosting/docker) — Deployment
