<p align="center">
  <img src="logo.svg" width="380" alt="можно.">
</p>

<p align="center">Self-hosted-платформа управления фиче-флагами (open-core).</p>

<p align="center">
  <a href="https://github.com/mozhno-dev/mozhno/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mozhno-dev/mozhno/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-BSL_1.1-lightgrey?style=flat-square" alt="BSL 1.1" /></a>
  <a href="https://hub.docker.com/r/mozhnodev/mozhno"><img src="https://img.shields.io/badge/Docker-mozhnodev/mozhno-blue?style=flat-square&logo=docker" alt="Docker" /></a>
  <a href="https://github.com/mozhno-dev/mozhno/stargazers"><img src="https://img.shields.io/github/stars/mozhno-dev/mozhno?style=flat-square&logo=github&color=fedc32" alt="Stars" /></a>
</p>

<p align="right"><a href="README.en.md">English</a></p>

---

**можно.** — сервер фиче-флагов для команд любого размера. Включай фичи на продакшене без деплоя, раскатывай изменения постепенно, сегментируй аудиторию — всё из одной панели.

---

### Возможности

| Категория | Описание |
|-----------|----------|
| **Флаги** | RELEASE и KILLSWITCH, процентный роллаут, правила на основе атрибутов |
| **Контексты** | Оценка флагов по произвольным атрибутам пользователя или запроса |
| **Сегменты** | Переиспользуемые группы пользователей с общими правилами таргетинга |
| **Стратегии** | Конфигурация на окружение: правила, сегменты, процентный роллаут |
| **API-ключи** | Ключи на каждое окружение с гранулярными правами |
| **Аудит** | Полная история изменений каждого флага и конфигурации |
| **SDK** | Нативные клиенты для Java и JavaScript — оценка флагов локально, без сетевого вызова |

---
### Дизайн-бук (Storybook)

```bash
cd web && npm run storybook   # http://localhost:6006
```

Storybook показывает все UI-компоненты в изолированном каталоге с документацией.

### Скриншоты

<table align="center" width="85%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden"><tr>
<td bgcolor="#2c2c2e" style="padding:8px 16px;border-radius:10px 10px 0 0">
  <font color="#ff5f57" size="4">●</font>
  <font color="#fdbc40" size="4">●</font>
  <font color="#32c840" size="4">●</font>
</td></tr><tr>
<td><img src="web/storybook-static/screenshots/flags.png" width="100%" alt="Дашборд флагов" /></td>
</tr></table>

<p align="center"><b>Дашборд флагов</b></p>
<p align="center">Все флаги на одном экране. Переключайте фичи в продакшене и разработке одной кнопкой — без деплоя, без ожидания, без риска для пользователей.</p>
<br />

<table align="center" width="50%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden"><tr>
<td bgcolor="#2c2c2e" height="22" style="padding:4px 16px;border-radius:10px 10px 0 0">&nbsp;</td>
</tr><tr>
<td><img src="web/storybook-static/screenshots/activation.png" width="100%" alt="Панель активации" /></td>
</tr></table>

<p align="center"><b>Панель активации</b></p>
<p align="center">Настройте процент раскатки — 30% пользователей, VIP-сегмент, только РФ. Всё в одном окне: слайдер, выбор сегментов, условия. Никаких конфигов.</p>
<br />

<table align="center" width="85%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden"><tr>
<td bgcolor="#2c2c2e" style="padding:8px 16px;border-radius:10px 10px 0 0">
  <font color="#ff5f57" size="4">●</font>
  <font color="#fdbc40" size="4">●</font>
  <font color="#32c840" size="4">●</font>
</td></tr><tr>
<td><img src="web/storybook-static/screenshots/overview.png" width="100%" alt="Обзорный дашборд" /></td>
</tr></table>

<p align="center"><b>Обзорный дашборд</b></p>
<p align="center">Главный экран после входа. Ключевые метрики проекта в одном месте: статус флагов по окружениям, дрифт между средами, лента активности и чеклист онбординга для новых проектов.</p>

> Запустите проект локально (`make dev`) чтобы увидеть интерфейс.

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
    image: mozhnodev/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_USERNAME: flags_user
      MOZHNO_DB_PASSWORD: flags_password
      MOZHNO_JWT_SECRET: ${MOZHNO_JWT_SECRET}
    depends_on:
      - postgres

volumes:
  pgdata:
```

```bash
# Сгенерируйте JWT-секрет для продакшена (≥32 символов или Base64 ≥32 байт).
# Для dev — можно пропустить: сервер сгенерирует случайный ключ.
export MOZHNO_JWT_SECRET=$(openssl rand -base64 32)  # или обычный текст ≥32 символов

docker compose up -d
```

Открой [`http://localhost:8080`](http://localhost:8080) — веб-панель уже встроена в сервер.

> Полный compose с healthcheck и pgAdmin — [`docker-compose.yml`](docker-compose.yml).

---

### Архитектура

| Модуль | Назначение |
|--------|------------|
| `mozhno-spi` | Интерфейсы сервис-провайдеров |
| `mozhno-core` | Бизнес-логика, движок оценки флагов, хранение |
| `mozhno-web-api` | REST-контроллеры, Spring Security 6, JWT, OpenAPI |
| `mozhno-app` | Точка входа, статические ресурсы, миграции БД (Flyway) |

Сервер — Spring Boot 4.0 / JDK 25. Веб-интерфейс — React 19 SPA (Vite, Tailwind CSS 4, Radix UI). SDK загружают правила флагов один раз и принимают решение локально.

**Модель доступа:** активный проект хранится в JWT (claim `project_id`) и выбирается при входе или через `/auth/select-project`. Все ресурсы (флаги, сегменты, контексты, API-ключи, аудит и т.д.) ограничены этим проектом; права на изменение зависят от роли (ADMIN/DEVELOPER/VIEWER).

---

---

### SDK

SDK живут в отдельных репозиториях:

- **[Java SDK](https://github.com/mozhno-dev/mozhno-java-sdk)** — `dev.mozhno:mozhno-client-java`, JDK 17+
- **[JavaScript/TypeScript SDK](https://github.com/mozhno-dev/mozhno-js-sdk)** — `@mozhno/client-js`, browser + Node.js

Установка и документация — в соответствующих репозиториях.

---

### Конфигурация

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `MOZHNO_DB_URL` | `jdbc:postgresql://localhost:5432/feature_flags` | JDBC URL базы данных |
| `MOZHNO_DB_USERNAME` | `flags_user` | Пользователь БД |
| `MOZHNO_DB_PASSWORD` | `flags_password` | Пароль БД |
| `MOZHNO_JWT_SECRET` | *(рекомендуется для прода)* | Ключ (≥32 символов) или Base64 (≥32 байт). Для dev опционален — генерируется случайный ключ. Сгенерировать: `openssl rand -base64 32` |
| `MOZHNO_BASE_URL` | `http://localhost:8080` | Публичный URL сервера |
| `MOZHNO_CLIENT_MAX_METRICS_BATCH_SIZE` | `1000` | Максимальный размер батча метрик от SDK |
| `MOZHNO_CLIENT_INSTANCE_RETENTION_DAYS` | `30` | Срок хранения данных о клиентских инстансах |
| `MOZHNO_MANAGEMENT_PORT` | `9090` | Порт для actuator-эндпоинтов (health, metrics, prometheus) |
| `MOZHNO_SERVER_PORT` | `8080` | HTTP-порт |

<details>
<summary>Все переменные окружения</summary>

Полный список переменных (rate-limit, webhooks, cache, SMTP и т.д.) — см. [`.env.example`](.env.example).

</details>

---

### API

Swagger UI — [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html). Спецификация OpenAPI 3.1 — `/v3/api-docs`.

---

### Разработка

**Требования:** JDK 25 (сервер), JDK 17+ (SDK), Node.js 24, PostgreSQL 15+.

Быстрее всего — через `make` (корневой `Makefile`):

```bash
make dev           # Postgres + подсказки по запуску server/web
make server-run    # сборка web-статики + запуск сервера (dev-профиль)
make web-dev       # web UI с HMR
make server-test   # тесты сервера
make web-test      # тесты web
```

<details>
<summary>Запуск вручную</summary>

```bash
docker compose up -d postgres
cd server && ./gradlew :mozhno-app:bootRun
cd web && npm ci && npm run dev
```

```bash
cd server && ./gradlew check   # Тесты сервера
cd web && npm test             # Тесты веб-интерфейса
```

</details>

---

### Участие

Вклад приветствуется — начните с [`CONTRIBUTING.md`](CONTRIBUTING.md). Пожалуйста,
соблюдайте [Кодекс поведения](CODE_OF_CONDUCT.md). Об уязвимостях сообщайте по
[политике безопасности](SECURITY.md). История изменений — в [`CHANGELOG.md`](CHANGELOG.md).

---

### Лицензия

[Business Source License 1.1](LICENSE) · © 2026 Edgar Gilmanov

[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Changelog](CHANGELOG.md)
