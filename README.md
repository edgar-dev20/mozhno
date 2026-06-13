<p align="center">
  <img src="logo.svg" width="360" alt="можно.">
</p>

<p align="center"><b>Включай без страха.</b></p>

<p align="center">Платформа управления фиче-флагами с открытым кодом.</p>

<p align="center">
  <a href="https://github.com/edgar-dev20/mozhno/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/edgar-dev20/mozhno/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL_v3-blue?style=flat-square" alt="AGPL v3" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/pkgs/container/mozhno"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat-square&logo=docker" alt="Docker" /></a>
  <a href="https://github.com/edgar-dev20/mozhno/stargazers"><img src="https://img.shields.io/github/stars/edgar-dev20/mozhno?style=flat-square&logo=github&color=fedc32" alt="Stars" /></a>
</p>

<p align="right"><a href="README.en.md">English</a></p>

---

**можно.** — сервер фиче-флагов для команд любого размера. Включай фичи на продакшене без деплоя, раскатывай изменения постепенно, сегментируй аудиторию — всё из одной панели.

---

### Возможности

| Категория | Описание |
|-----------|----------|
| **Флаги** | Булевы, мультивариативные, процентный роллаут, правила на основе атрибутов |
| **Контексты** | Оценка флагов по произвольным атрибутам пользователя или запроса |
| **Сегменты** | Переиспользуемые группы пользователей с общими правилами таргетинга |
| **Стратегии** | Подключаемая логика раскатки: дефолтная, плавная, по расписанию, кастомная |
| **API-ключи** | Ключи на каждое окружение с гранулярными правами |
| **Аудит** | Полная история изменений каждого флага и конфигурации |
| **SDK** | Нативные клиенты для Java и JavaScript — оценка флагов локально, без сетевого вызова |

---

### Быстрый старт

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

Открой [`http://localhost:8080`](http://localhost:8080) — веб-панель уже встроена в сервер.

---

### Архитектура

| Модуль | Назначение |
|--------|------------|
| `mozhno-spi` | Интерфейсы сервис-провайдеров |
| `mozhno-core` | Бизнес-логика, движок оценки флагов, хранение |
| `mozhno-web-api` | REST-контроллеры, Spring Security 6, JWT, OpenAPI |
| `mozhno-app` | Точка входа, статические ресурсы, миграции БД (Flyway) |

Сервер — Spring Boot 4.0 / JDK 25. Веб-интерфейс — React 19 SPA (Vite, Tailwind CSS 4, Radix UI). SDK загружают правила флагов один раз и принимают решение локально.

---

### SDK

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

### Конфигурация

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL базы данных |
| `SPRING_DATASOURCE_USERNAME` | `flags_user` | Пользователь БД |
| `SPRING_DATASOURCE_PASSWORD` | `flags_password` | Пароль БД |
| `JWT_SECRET` | *(обязательно сменить)* | HMAC-SHA256 ключ (минимум 256 бит) |
| `APP_BASE_URL` | `http://localhost:8080` | Публичный URL сервера |
| `SERVER_PORT` | `8080` | HTTP-порт |

---

### API

Swagger UI — [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html). Спецификация OpenAPI 3.1 — `/v3/api-docs`.

---

### Разработка

**Требования:** JDK 25, Node.js 24, PostgreSQL 15+.

```bash
docker compose up -d postgres
cd server && ./gradlew :mozhno-app:bootRun
cd web && npm ci && npm run dev
```

```bash
cd server && ./gradlew check   # Тесты сервера
cd web && npm test             # Тесты веб-интерфейса
cd sdks/js && npm test         # Тесты JS SDK
```

---

### Лицензия

[GNU AGPL v3.0](LICENSE) · © 2025 [Edgar](https://github.com/edgar-dev20)
