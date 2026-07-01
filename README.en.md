<p align="center">
  <img src="logo-en.svg" width="380" alt="можно.">
</p>

<p align="center">Open-source feature flag management platform.</p>

<p align="center">
  <a href="https://github.com/mozhno-dev/mozhno/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mozhno-dev/mozhno/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-BSL_1.1-lightgrey?style=flat-square" alt="BSL 1.1" /></a>
  <a href="https://github.com/mozhno-dev/mozhno/pkgs/container/mozhno"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat-square&logo=docker" alt="Docker" /></a>
  <a href="https://github.com/mozhno-dev/mozhno/stargazers"><img src="https://img.shields.io/github/stars/mozhno-dev/mozhno?style=flat-square&logo=github&color=fedc32" alt="Stars" /></a>
</p>

<p align="right"><a href="README.md">Русский</a></p>

---

**Mozhno** is a feature flag server for teams of any size. Toggle features in production without deployment, roll out gradually, segment your audience — all from a single dashboard.

---

### Features

| Category | Description |
|----------|-------------|
| **Flags** | RELEASE & KILLSWITCH, percentage rollouts, attribute-based rules |
| **Contexts** | Evaluate flags against arbitrary user or request attributes |
| **Segments** | Reusable user groups with shared targeting rules |
| **Strategies** | Per-environment configuration: constraints, segments, percentage rollout |
| **API Keys** | Per-environment keys with granular permissions |
| **Audit Log** | Full change history for every flag and configuration |
| **SDKs** | Native Java & JavaScript clients — evaluate flags locally, zero network calls |

---

### Quick Start

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feature_flags
      POSTGRES_USER: flags_user
      POSTGRES_PASSWORD: flags_password
    volumes:
      - pgdata:/var/lib/postgresql/data

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
      - postgres

volumes:
  pgdata:
```

```bash
docker compose up -d
```

Open [`http://localhost:8080`](http://localhost:8080) — the web dashboard is served from the same application.

---

### Architecture

| Module | Purpose |
|--------|---------|
| `mozhno-spi` | Service provider interfaces |
| `mozhno-core` | Business logic, flag evaluation engine, storage |
| `mozhno-web-api` | REST controllers, Spring Security 6, JWT, OpenAPI |
| `mozhno-app` | Entry point, static resources, DB migrations (Flyway) |

Server — Spring Boot 4.0 / JDK 25. Web UI — React 19 SPA (Vite, Tailwind CSS 4, Radix UI). Java SDK compiles against JDK 17+ for broad compatibility. SDKs fetch flag rules once and evaluate locally.

---

### SDKs

**Java**
```java
var config = MozhnoConfig.builder()
    .appName("my-app")
    .instanceId("instance-1")
    .mozhnoUrl("https://flags.example.com")
    .apiKey("env-abc123")
    .build();

var client = new DefaultMozhnoClient(config);
client.start();

var ctx = MozhnoContext.builder().userId("42").build();
boolean on = client.isEnabled("new-checkout", ctx);
```

**JavaScript / TypeScript**
```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  url: 'https://flags.example.com',
  apiKey: 'env-abc123',
  appName: 'my-app',
});
await client.start();

const on = client.isEnabled('new-checkout', { userId: '42' });
```

---

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Database password |
| `JWT_SECRET` | *(must change)* | HMAC-SHA256 signing key (≥256 bits) |
| `APP_BASE_URL` | `http://localhost:8080` | Public base URL |
| `SERVER_PORT` | `8080` | HTTP listen port |

---

### API

Swagger UI — [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html). OpenAPI 3.1 spec at `/v3/api-docs`.

---

### Development

**Requirements:** JDK 25 (server), JDK 17+ (SDK), Node.js 24, PostgreSQL 15+.

```bash
docker compose up -d postgres
cd server && ./gradlew :mozhno-app:bootRun
cd web && npm ci && npm run dev
```

```bash
cd server && ./gradlew check   # Server tests
cd web && npm test             # Web UI tests
cd sdks/js && npm test         # JS SDK tests
cd server && ./gradlew :mozhno-client-java:check   # Java SDK tests
```

---

### License

[Business Source License 1.1](LICENSE) · © 2026 Edgar Gilmanov
