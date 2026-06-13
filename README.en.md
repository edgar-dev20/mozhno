<p align="center">
  <img src="logo.svg" width="360" alt="mozhno.">
</p>

<p align="center"><b>Enable without fear.</b></p>

<p align="center">Open-source feature flag management platform.</p>

<p align="center">
  <a href="https://github.com/edgar-dev20/mozhno/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/edgar-dev20/mozhno/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL_v3-blue?style=flat-square" alt="AGPL v3" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/pkgs/container/mozhno"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat-square&logo=docker" alt="Docker" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/stargazers"><img src="https://img.shields.io/github/stars/edgar-dev20/mozhno?style=flat-square&logo=github&color=fedc32" alt="Stars" /></a>
</p>

<p align="right"><a href="README.md">Русский</a></p>

---

**Mozhno** is a feature flag server for teams of any size. Toggle features in production without deployment, roll out gradually, segment your audience — all from a single dashboard.

---

### Features

| Category | Description |
|----------|-------------|
| **Flags** | Boolean, multivariate, percentage rollouts, attribute-based rules |
| **Contexts** | Evaluate flags against arbitrary user or request attributes |
| **Segments** | Reusable user groups with shared targeting rules |
| **Strategies** | Pluggable rollout logic: default, gradual, scheduled, custom |
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
    image: ghcr.io/edgar-dev20/mozhno:latest
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

Server — Spring Boot 4.0 / JDK 25. Web UI — React 19 SPA (Vite, Tailwind CSS 4, Radix UI). SDKs fetch flag rules once and evaluate locally.

---

### SDKs

**Java**
```java
var client = MozhnoClient.builder()
    .serverUrl("https://flags.example.com")
    .apiKey("env-abc123")
    .build();

boolean on = client.isFlagEnabled("new-checkout", ctx);
```

**JavaScript / TypeScript**
```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  serverUrl: 'https://flags.example.com',
  apiKey: 'env-abc123',
});

const on = await client.isEnabled('new-checkout', { userId: '42' });
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

**Requirements:** JDK 25, Node.js 24, PostgreSQL 15+.

```bash
docker compose up -d postgres
cd server && ./gradlew :mozhno-app:bootRun
cd web && npm ci && npm run dev
```

```bash
cd server && ./gradlew check   # Server tests
cd web && npm test             # Web UI tests
cd sdks/js && npm test         # JS SDK tests
```

---

### License

[GNU AGPL v3.0](LICENSE) · © 2025 [Edgar](https://github.com/edgar-dev20)
