<div align="center">

<svg width="320" height="52" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="можно.">
  <defs>
    <linearGradient id="mozhno-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <text x="160" y="42" text-anchor="middle"
        font-family="monospace" font-size="38" font-weight="bold"
        letter-spacing="0.2em" fill="url(#mozhno-grad)">можно.</text>
</svg>

### Включай без страха.

Платформа управления фиче-флагами с открытым кодом.

</div>

<p align="center">
  <a href="https://github.com/edgar-dev20/mozhno/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/edgar-dev20/mozhno/ci.yml?branch=develop&label=CI&logo=github&style=flat-square" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL_v3-blue?style=flat-square" alt="AGPL v3" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/pkgs/container/mozhno"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat-square&logo=docker" alt="Docker" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/stargazers"><img src="https://img.shields.io/github/stars/edgar-dev20/mozhno?style=flat-square&logo=github&color=fedc32" alt="Stars" /></a>
</p>

<p align="center">
  <a href="https://codecov.io/gh/edgar-dev20/mozhno"><img src="https://codecov.io/gh/edgar-dev20/mozhno/graph/badge.svg?flag=server" alt="Server coverage" /></a>
  <a href="https://codecov.io/gh/edgar-dev20/mozhno"><img src="https://codecov.io/gh/edgar-dev20/mozhno/graph/badge.svg?flag=web" alt="Web UI coverage" /></a>
  <a href="https://codecov.io/gh/edgar-dev20/mozhno"><img src="https://codecov.io/gh/edgar-dev20/mozhno/graph/badge.svg?flag=js-sdk" alt="JS SDK coverage" /></a>
</p>

<p align="center">
  <a href="https://scorecard.dev/viewer/?uri=github.com/edgar-dev20/mozhno"><img src="https://img.shields.io/ossf-scorecard/github.com/edgar-dev20/mozhno?style=flat-square&label=OpenSSF" alt="OpenSSF Scorecard" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/security/code-scanning"><img src="https://img.shields.io/badge/SAST-CodeQL-2563eb?style=flat-square&logo=github" alt="CodeQL" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/security/dependabot"><img src="https://img.shields.io/badge/SCA-npm_audit-cb3837?style=flat-square&logo=npm" alt="npm audit" /></a>
</p>

<div align="center">
  <a href="https://starchart.cc/edgar-dev20/mozhno">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://starchart.cc/edgar-dev20/mozhno.svg?background=0d1117&axis=8b949e&line=7c3aed&circle=d2a8ff">
      <img src="https://starchart.cc/edgar-dev20/mozhno.svg?background=ffffff&axis=57606a&line=7c3aed&circle=5b21b6" width="660" alt="Star History" />
    </picture>
  </a>
</div>

<p align="center">
  <b>можно.</b> — это сервер фиче-флагов для команд любого размера. Включай фичи на продакшене без деплоя,<br />
  раскатывай изменения постепенно, сегментируй аудиторию — всё из одной панели.
</p>

---

### ● Возможности

| Категория | Что умеет |
|-----------|-----------|
| **Флаги** | Булевы, мультивариативные, процентный роллаут, правила на основе атрибутов |
| **Контексты** | Оценка флагов по произвольным атрибутам пользователя или запроса |
| **Сегменты** | Переиспользуемые группы пользователей с общими правилами таргетинга |
| **Стратегии** | Подключаемая логика раскатки: дефолтная, плавная, по расписанию, кастомная |
| **API-ключи** | Ключи на каждое окружение с гранулярными правами |
| **Аудит** | Полная история изменений каждого флага и конфигурации |
| **Веб-панель** | React-интерфейс управления флагами, сегментами, окружениями и ключами |
| **REST API** | Документированные эндпоинты (Swagger UI / OpenAPI 3.1) |
| **SDK** | Нативные SDK для Java и JavaScript — оценка флагов без сетевого вызова |

---

### ● Быстрый старт

#### Docker

```bash
docker pull ghcr.io/edgar-dev20/mozhno:latest

docker network create mozhno-net

docker run -d --name mozhno-db \
  --network mozhno-net \
  -e POSTGRES_DB=feature_flags \
  -e POSTGRES_USER=flags_user \
  -e POSTGRES_PASSWORD=flags_password \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d --name mozhno \
  --network mozhno-net \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://mozhno-db:5432/feature_flags \
  -e SPRING_DATASOURCE_USERNAME=flags_user \
  -e SPRING_DATASOURCE_PASSWORD=flags_password \
  -e JWT_SECRET=your-256-bit-secret-key-here-change-in-production \
  ghcr.io/edgar-dev20/mozhno:latest
```

Открой `http://localhost:8080` — веб-панель уже встроена в сервер.

#### Docker Compose

```yaml
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

---

### ● Архитектура

```
┌──────────┐    ┌──────────────┐    ┌────────────┐
│  SDK     │───▶│  можно. API  │───▶│ PostgreSQL │
│ Java, JS │    │  SpringBoot  │    │            │
└──────────┘    │  4.0 / JDK25 │    └────────────┘
                │              │
                │  Веб-панель  │
                │  React 19    │
                └──────────────┘
```

| Модуль | Описание |
|--------|----------|
| `mozhno-spi` | Интерфейсы сервис-провайдеров |
| `mozhno-core` | Бизнес-логика, движок оценки флагов, хранение |
| `mozhno-web-api` | REST-контроллеры, Spring Security 6, JWT-аутентификация, OpenAPI |
| `mozhno-app` | Точка входа приложения, статические ресурсы, миграции БД (Flyway) |

Веб-интерфейс — React 19 SPA (Vite, Tailwind CSS 4, Radix UI).

SDK — лёгкие клиентские библиотеки, загружают правила флагов один раз и принимают решение локально, без сетевого вызова на каждую проверку.

---

### ● SDK

#### Java

Добавь репозиторий GitHub Packages в `build.gradle`:

```groovy
repositories {
    maven {
        url = 'https://maven.pkg.github.com/edgar-dev20/mozhno'
        credentials {
            username = System.getenv('GITHUB_ACTOR')
            password = System.getenv('GITHUB_TOKEN')
        }
    }
}
dependencies {
    implementation 'dev.mozhno:mozhno-client-java:1.0.0'
}
```

```java
var client = MozhnoClient.builder()
    .serverUrl("https://flags.example.com")
    .apiKey("env-abc123")
    .build();

boolean on = client.isFlagEnabled("new-checkout", ctx);
```

#### JavaScript / TypeScript

Файл `.npmrc`:

```
@mozhno:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

```bash
npm install @mozhno/client-js
```

```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  serverUrl: 'https://flags.example.com',
  apiKey: 'env-abc123',
});

const on = await client.isEnabled('new-checkout', { userId: '42' });
```

---

### ● Конфигурация

Настройка сервера — через переменные окружения (Spring Boot).

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL базы |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Пользователь БД |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Пароль БД |
| `JWT_SECRET` | *(небезопасно)* | HMAC-SHA256 ключ подписи (минимум 256 бит) |
| `JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Время жизни access-токена |
| `JWT_REFRESH_TOKEN_TTL_DAYS` | `30` | Время жизни refresh-токена |
| `SMTP_HOST` | `localhost` | SMTP-сервер для email-уведомлений |
| `SMTP_PORT` | `587` | Порт SMTP |
| `APP_BASE_URL` | `http://localhost:8080` | Публичный URL сервера |
| `AUDIT_RETENTION_DAYS` | `365` | Срок хранения аудит-логов |
| `SERVER_PORT` | `8080` | HTTP-порт |

---

### ● API

Swagger UI после запуска сервера:

```
http://localhost:8080/swagger-ui.html
```

Спецификация OpenAPI 3.1 доступна по адресу `/v3/api-docs`.

---

### ● Разработка

**Требования:** JDK 25 (Eclipse Temurin), Node.js 24, PostgreSQL 15+, Gradle 9.3 (обёртка включена).

```bash
# База данных
docker compose up -d postgres

# Сервер (dev-профиль с тестовым JWT-секретом)
cd server && SPRING_PROFILES_ACTIVE=dev ./gradlew :mozhno-app:bootRun

# Веб-интерфейс (dev-режим с HMR)
cd web && npm ci && npm run dev
```

Dev-сервер веб-интерфейса проксирует API-запросы на `http://localhost:8080`.
Для продакшена обязательно задайте `JWT_SECRET` через переменную окружения.

#### Тесты

```bash
cd server && ./gradlew check        # Сервер
cd web && npm test                  # Веб-интерфейс
cd sdks/js && npm test              # JS SDK
```

---

### ● Публикация

| Тег | Публикуется | Реестр |
|-----|-------------|--------|
| `v1.0.0` | Docker-образ сервера | `ghcr.io/edgar-dev20/mozhno` |
| `sdk-java-v1.0.0` | Java SDK | GitHub Packages (Maven) |
| `sdk-js-v1.0.0` | JS SDK | GitHub Packages (npm) |

---

### ● Лицензия

[GNU AGPL v3.0](LICENSE) · Авторские права &copy; 2025 [Edgar](https://github.com/edgar-dev20).

---

<p align="center">
  <span style="color:#8b949e;font-size:12px;">— English below —</span>
</p>

---

<div align="center">

### Mozhno — Feature Flag Platform

Enable without fear. Open-source feature management.

</div>

<p align="center">A self-hosted feature flag server for teams of any size. Toggle features in production without deployment, roll out gradually, segment your audience — all from a single dashboard.</p>

---

### ● Features

| Category | Capabilities |
|----------|-------------|
| **Flags** | Boolean, multivariate, percentage rollouts, attribute-based rules |
| **Contexts** | Evaluate flags against arbitrary user or request attributes |
| **Segments** | Reusable user groups with shared targeting rules |
| **Strategies** | Pluggable rollout logic: default, gradual, scheduled, custom |
| **API Keys** | Per-environment keys with granular permissions |
| **Audit Log** | Full change history for every flag and configuration |
| **Web UI** | React dashboard for managing flags, segments, environments, and keys |
| **REST API** | OpenAPI 3.1 documented endpoints (Swagger UI included) |
| **SDKs** | Native Java & JavaScript clients — evaluate flags locally, zero network calls |

---

### ● Quick Start

```bash
docker pull ghcr.io/edgar-dev20/mozhno:latest
# Start PostgreSQL, then:
docker run -d --name mozhno -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/feature_flags \
  -e SPRING_DATASOURCE_USERNAME=flags_user \
  -e SPRING_DATASOURCE_PASSWORD=flags_password \
  -e JWT_SECRET=your-secret-at-least-256-bits \
  ghcr.io/edgar-dev20/mozhno:latest
```

Open `http://localhost:8080` — the web dashboard is served from the same application.

---

### ● Architecture

```
┌──────────┐    ┌──────────────┐    ┌────────────┐
│  SDK     │───▶│  Mozhno API  │───▶│ PostgreSQL │
│ Java, JS │    │  SpringBoot  │    │            │
└──────────┘    │  4.0 / JDK25 │    └────────────┘
                │              │
                │  Web UI      │
                │  React 19    │
                └──────────────┘
```

- **Server** — Spring Boot 4.0 / Java 25: `mozhno-spi`, `mozhno-core`, `mozhno-web-api`, `mozhno-app`
- **Web UI** — React 19 SPA (Vite, Tailwind CSS 4, Radix UI)
- **SDKs** — Lightweight clients that fetch flag rules once and evaluate locally

---

### ● SDKs

**Java** — `dev.mozhno:mozhno-client-java` from GitHub Packages Maven.

```java
var client = MozhnoClient.builder()
    .serverUrl("https://flags.example.com").apiKey("env-abc123").build();
boolean on = client.isFlagEnabled("new-checkout", ctx);
```

**JavaScript** — `@mozhno/client-js` from GitHub Packages npm.

```typescript
const client = new MozhnoClient({ serverUrl: 'https://flags.example.com', apiKey: 'env-abc123' });
const on = await client.isEnabled('new-checkout', { userId: '42' });
```

---

### ● Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Database password |
| `JWT_SECRET` | *(insecure)* | HMAC-SHA256 signing key (≥256 bits) |
| `APP_BASE_URL` | `http://localhost:8080` | Public base URL |
| `SERVER_PORT` | `8080` | HTTP listen port |

Full config reference above in the Russian section.

---

### ● API

Swagger UI at `http://localhost:8080/swagger-ui.html`. OpenAPI 3.1 spec at `/v3/api-docs`.

---

### ● Development

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

### ● Release Tags

| Tag | Publishes | Registry |
|-----|-----------|----------|
| `v1.0.0` | Docker server image | `ghcr.io/edgar-dev20/mozhno` |
| `sdk-java-v1.0.0` | Java SDK | GitHub Packages (Maven) |
| `sdk-js-v1.0.0` | JS SDK | GitHub Packages (npm) |

---

### ● License

[GNU AGPL v3.0](LICENSE) · Copyright &copy; 2025 [Edgar](https://github.com/edgar-dev20).
