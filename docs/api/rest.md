# REST API Reference

Полный справочник по REST API **можно.** v1. Для каждого endpoint приведены метод, путь, параметры и примеры `curl`.

> **Совет:** Интерактивная документация доступна через Swagger UI по адресу [`/swagger-ui.html`](http://localhost:8080/swagger-ui.html). OpenAPI 3.1 спецификация — [`/v3/api-docs`](http://localhost:8080/v3/api-docs).

## Аутентификация

### Вход

```http
POST /api/v1/auth/login
```

**Тело запроса:**

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Ответ:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 900000,
  "tokenType": "Bearer"
}
```

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

### Обновление токена

```http
POST /api/v1/auth/refresh
```

```bash
curl -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."}'
```

### Выход

```http
POST /api/v1/auth/logout
```

```bash
curl -X POST "http://localhost:8080/api/v1/auth/logout" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Флаги

### Создать флаг

```http
POST /api/v1/flags
```

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `key` | `string` | Да | Уникальный ключ флага |
| `name` | `string` | Да | Название флага |
| `description` | `string` | Нет | Описание |
| `type` | `string` | Да | `BOOLEAN` или `MULTI_VARIATE` |
| `tags` | `string[]` | Нет | Список тегов |
| `environment` | `string` | Нет | Окружение (по умолчанию — первое активное) |

```bash
curl -X POST "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new-checkout",
    "name": "Новый чекаут",
    "description": "Переработка процесса оформления заказа",
    "type": "BOOLEAN",
    "tags": ["checkout", "ui-redesign"]
  }'
```

### Получить все флаги

```http
GET /api/v1/flags
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `environment` | `string` | — | Фильтр по окружению |
| `tag` | `string` | — | Фильтр по тегу |
| `status` | `string` | — | `active`, `archived`, `all` |
| `page` | `int` | `0` | Страница |
| `size` | `int` | `20` | Размер страницы |
| `sort` | `string` | `createdAt,desc` | Сортировка |

```bash
curl "http://localhost:8080/api/v1/flags?environment=production&status=active" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Получить флаг по ключу

```http
GET /api/v1/flags/{flagKey}
```

```bash
curl "http://localhost:8080/api/v1/flags/new-checkout" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить флаг

```http
PUT /api/v1/flags/{flagKey}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/flags/new-checkout" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Новый чекаут v2",
    "description": "Обновлённое описание",
    "tags": ["checkout", "ui-redesign", "v2"]
  }'
```

### Обновить стратегии флага

```http
PATCH /api/v1/flags/{flagKey}/strategies
```

```bash
# Gradual rollout
curl -X PATCH "http://localhost:8080/api/v1/flags/new-checkout/strategies" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production",
    "strategies": [
      {
        "type": "gradual",
        "percentage": 25,
        "hashProperty": "userId"
      }
    ]
  }'
```

```bash
# Default (kill switch)
curl -X PATCH "http://localhost:8080/api/v1/flags/new-checkout/strategies" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production",
    "strategies": [
      {
        "type": "default",
        "value": false
      }
    ]
  }'
```

```bash
# Scheduled
curl -X PATCH "http://localhost:8080/api/v1/flags/holiday-banner/strategies" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production",
    "strategies": [
      {
        "type": "scheduled",
        "startAt": "2026-06-25T12:00:00Z",
        "endAt": "2026-07-01T12:00:00Z"
      }
    ]
  }'
```

### Обновить таргетинг флага

```http
PATCH /api/v1/flags/{flagKey}/targeting
```

```bash
curl -X PATCH "http://localhost:8080/api/v1/flags/new-checkout/targeting" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production",
    "rules": [
      {
        "name": "Premium RU",
        "rules": [
          { "attribute": "plan", "operator": "in", "value": ["premium", "business"] },
          { "attribute": "country", "operator": "equals", "value": "RU" }
        ],
        "serve": true
      },
      {
        "name": "Бета-тестеры",
        "segment": "beta-testers",
        "serve": true
      }
    ]
  }'
```

### Архивировать флаг

```http
POST /api/v1/flags/{flagKey}/archive
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/new-checkout/archive" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Восстановить флаг

```http
POST /api/v1/flags/{flagKey}/restore
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/new-checkout/restore" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Удалить флаг

```http
DELETE /api/v1/flags/{flagKey}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/flags/new-checkout" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

> **Предупреждение:** Удаление необратимо. Все аудит-записи, связанные с флагом, также удаляются.

### Проверить таргетинг (dry-run)

```http
POST /api/v1/flags/{flagKey}/evaluate
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/new-checkout/evaluate" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "userId": "user-123",
      "plan": "premium",
      "country": "RU"
    }
  }'
```

Ответ:

```json
{
  "enabled": true,
  "matchedRule": "Premium RU",
  "reason": "TARGETING_MATCH",
  "value": null
}
```

## Сегменты

### Создать сегмент

```http
POST /api/v1/segments
```

```bash
curl -X POST "http://localhost:8080/api/v1/segments" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "beta-testers",
    "name": "Бета-тестеры",
    "description": "Пользователи с ID, начинающимся на beta-",
    "rules": [
      { "attribute": "userId", "operator": "starts_with", "value": "beta-" },
      { "attribute": "email", "operator": "not_contains", "value": "@test.com" }
    ]
  }'
```

### Получить все сегменты

```http
GET /api/v1/segments
```

```bash
curl "http://localhost:8080/api/v1/segments" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Получить сегмент по ключу

```http
GET /api/v1/segments/{segmentKey}
```

```bash
curl "http://localhost:8080/api/v1/segments/beta-testers" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить сегмент

```http
PUT /api/v1/segments/{segmentKey}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/segments/beta-testers" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Бета-тестеры (расширенный)",
    "rules": [
      { "attribute": "userId", "operator": "starts_with", "value": "beta-" },
      { "attribute": "plan", "operator": "not_in", "value": ["free"] }
    ]
  }'
```

### Удалить сегмент

```http
DELETE /api/v1/segments/{segmentKey}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/segments/beta-testers" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Окружения

### Создать окружение

```http
POST /api/v1/environments
```

```bash
curl -X POST "http://localhost:8080/api/v1/environments" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "staging",
    "name": "Staging",
    "description": "Предпродакшен-окружение"
  }'
```

### Получить все окружения

```http
GET /api/v1/environments
```

```bash
curl "http://localhost:8080/api/v1/environments" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить окружение

```http
PUT /api/v1/environments/{envKey}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/environments/staging" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staging (Test)",
    "description": "Обновлённое описание"
  }'
```

### Удалить окружение

```http
DELETE /api/v1/environments/{envKey}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/environments/staging" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

> **Предупреждение:** Нельзя удалить окружение, если к нему привязаны активные API-ключи. Сначала отзовите все ключи окружения.

## API-ключи

### Создать API-ключ

```http
POST /api/v1/api-keys
```

```bash
curl -X POST "http://localhost:8080/api/v1/api-keys" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production SDK Key",
    "environment": "production"
  }'
```

Ответ:

```json
{
  "id": "ak_abc123",
  "name": "Production SDK Key",
  "key": "mz_env_x7k2p9v4m1q8w3r6",
  "environment": "production",
  "createdAt": "2026-06-21T13:41:05Z"
}
```

> **Предупреждение:** Значение ключа (`mz_env_...`) показывается **только один раз** при создании. Сохраните его немедленно.

### Получить все API-ключи

```http
GET /api/v1/api-keys
```

```bash
curl "http://localhost:8080/api/v1/api-keys?environment=production" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Отозвать API-ключ

```http
POST /api/v1/api-keys/{keyId}/revoke
```

```bash
curl -X POST "http://localhost:8080/api/v1/api-keys/ak_abc123/revoke" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

После отзыва ключ немедленно перестаёт работать. Все SDK, использующие этот ключ, перестанут получать обновления.

### Удалить API-ключ

```http
DELETE /api/v1/api-keys/{keyId}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/api-keys/ak_abc123" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Аудит

### Получить записи аудита

```http
GET /api/v1/audit
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `from` | `datetime` | — | Начало периода (ISO 8601) |
| `to` | `datetime` | — | Конец периода (ISO 8601) |
| `actor` | `string` | — | Email пользователя |
| `entityType` | `string` | — | `FLAG`, `SEGMENT`, `API_KEY`, `ENVIRONMENT` |
| `entityKey` | `string` | — | Ключ объекта |
| `action` | `string` | — | Тип действия |
| `page` | `int` | `0` | Страница |
| `size` | `int` | `20` | Размер страницы |

```bash
# Все изменения за последнюю неделю
curl "http://localhost:8080/api/v1/audit?from=2026-06-14T00:00:00Z&to=2026-06-21T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Все изменения флага new-checkout
curl "http://localhost:8080/api/v1/audit?entityType=FLAG&entityKey=new-checkout" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Все действия конкретного пользователя
curl "http://localhost:8080/api/v1/audit?actor=admin@example.com" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Экспорт аудита

```http
GET /api/v1/audit/export
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `format` | `string` | `json` | `csv`, `json`, `pdf` |
| `from` | `datetime` | — | Начало периода |
| `to` | `datetime` | — | Конец периода |

```bash
curl "http://localhost:8080/api/v1/audit/export?format=csv&from=2026-06-01T00:00:00Z&to=2026-06-30T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -o audit-report.csv
```

## SDK

### Получить правила (полная загрузка)

```http
GET /api/v1/sdk/rules
```

Используется SDK при инициализации. Возвращает все правила флагов для окружения, привязанного к API-ключу.

```bash
curl "http://localhost:8080/api/v1/sdk/rules" \
  -H "X-Api-Key: mz_env_abc123def456"
```

Ответ:

```json
{
  "version": 42,
  "environment": "production",
  "flags": [
    {
      "key": "new-checkout",
      "type": "BOOLEAN",
      "strategies": [
        {
          "type": "gradual",
          "percentage": 50
        }
      ],
      "targeting": [
        {
          "name": "Premium RU",
          "rules": [
            { "attribute": "plan", "operator": "in", "value": ["premium", "business"] },
            { "attribute": "country", "operator": "equals", "value": "RU" }
          ],
          "serve": true
        }
      ]
    }
  ]
}
```

### Получить дельта-обновления

```http
GET /api/v1/sdk/rules?since={version}
```

Возвращает только правила, изменившиеся с указанной версии.

```bash
curl "http://localhost:8080/api/v1/sdk/rules?since=41" \
  -H "X-Api-Key: mz_env_abc123def456"
```

Ответ:

```json
{
  "version": 42,
  "environment": "production",
  "updated": [
    {
      "key": "new-checkout",
      "type": "BOOLEAN",
      "strategies": [
        {
          "type": "gradual",
          "percentage": 50
        }
      ]
    }
  ],
  "deleted": ["old-feature"]
}
```

## Вебхуки

### Создать вебхук

```http
POST /api/v1/webhooks
```

```bash
curl -X POST "http://localhost:8080/api/v1/webhooks" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.example.com/hooks/mozhno",
    "events": ["flag.updated", "flag.archived", "flag.deleted"],
    "active": true
  }'
```

Ответ:

```json
{
  "id": "wh_abc123",
  "url": "https://your-server.example.com/hooks/mozhno",
  "secret": "whsec_x7k2p9v4m1q8w3r6",
  "events": ["flag.updated", "flag.archived", "flag.deleted"],
  "active": true,
  "createdAt": "2026-06-21T13:41:05Z"
}
```

### Получить все вебхуки

```http
GET /api/v1/webhooks
```

```bash
curl "http://localhost:8080/api/v1/webhooks" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить вебхук

```http
PUT /api/v1/webhooks/{webhookId}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/webhooks/wh_abc123" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://new-endpoint.example.com/hooks/mozhno",
    "events": ["flag.updated", "flag.archived", "flag.deleted", "flag.created"],
    "active": true
  }'
```

### Удалить вебхук

```http
DELETE /api/v1/webhooks/{webhookId}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/webhooks/wh_abc123" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Отправить тестовый вебхук

```http
POST /api/v1/webhooks/{webhookId}/test
```

```bash
curl -X POST "http://localhost:8080/api/v1/webhooks/wh_abc123/test" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Пользователи

### Пригласить пользователя

```http
POST /api/v1/users/invite
```

```bash
curl -X POST "http://localhost:8080/api/v1/users/invite" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "role": "DEVELOPER"
  }'
```

| Роль | Описание |
|------|----------|
| `ADMIN` | Полный доступ ко всем ресурсам |
| `DEVELOPER` | Создание флагов, изменение стратегий (настраивается) |
| `VIEWER` | Только просмотр |

### Получить всех пользователей

```http
GET /api/v1/users
```

```bash
curl "http://localhost:8080/api/v1/users" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Изменить роль пользователя

```http
PATCH /api/v1/users/{userId}/role
```

```bash
curl -X PATCH "http://localhost:8080/api/v1/users/u_abc123/role" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### Удалить пользователя

```http
DELETE /api/v1/users/{userId}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/users/u_abc123" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Коды ошибок API

| HTTP-код | Код ошибки | Описание |
|----------|-----------|----------|
| `400` | `VALIDATION_ERROR` | Неверные данные запроса |
| `400` | `INVALID_FLAG_TYPE` | Некорректный тип флага |
| `401` | `UNAUTHORIZED` | Отсутствует или недействителен токен |
| `401` | `INVALID_API_KEY` | Недействительный API-ключ |
| `401` | `TOKEN_EXPIRED` | JWT-токен истёк |
| `403` | `FORBIDDEN` | Недостаточно прав |
| `403` | `PRODUCTION_CHANGE_DENIED` | Нет прав на изменение production |
| `404` | `FLAG_NOT_FOUND` | Флаг не найден |
| `404` | `SEGMENT_NOT_FOUND` | Сегмент не найден |
| `404` | `ENVIRONMENT_NOT_FOUND` | Окружение не найдено |
| `404` | `API_KEY_NOT_FOUND` | API-ключ не найден |
| `409` | `FLAG_KEY_EXISTS` | Флаг с таким ключом уже существует |
| `409` | `SEGMENT_KEY_EXISTS` | Сегмент с таким ключом уже существует |
| `409` | `ENVIRONMENT_KEY_EXISTS` | Окружение с таким ключом уже существует |
| `429` | `RATE_LIMIT_EXCEEDED` | Превышен лимит запросов |
| `500` | `INTERNAL_ERROR` | Внутренняя ошибка сервера |

## Swagger UI и OpenAPI

| Ресурс | URL |
|--------|-----|
| **Swagger UI** | [`/swagger-ui.html`](http://localhost:8080/swagger-ui.html) |
| **OpenAPI 3.1 JSON** | [`/v3/api-docs`](http://localhost:8080/v3/api-docs) |
| **OpenAPI 3.1 YAML** | [`/v3/api-docs.yaml`](http://localhost:8080/v3/api-docs.yaml) |

Swagger UI предоставляет интерактивный интерфейс для отправки запросов к API. Все endpoints, описанные на этой странице, доступны через Swagger с возможностью заполнения параметров и выполнения запросов из браузера.

## Примеры рабочих сценариев

### Полный цикл флага через API

```bash
#!/bin/bash
BASE="http://localhost:8080/api/v1"
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 1. Создать флаг
curl -s -X POST "$BASE/flags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "my-feature", "name": "Моя фича", "type": "BOOLEAN"}'

# 2. Настроить gradual rollout на 1%
curl -s -X PATCH "$BASE/flags/my-feature/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environment": "production", "strategies": [{"type": "gradual", "percentage": 1}]}'

# 3. Увеличить до 50% (через день)
curl -s -X PATCH "$BASE/flags/my-feature/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environment": "production", "strategies": [{"type": "gradual", "percentage": 50}]}'

# 4. Включить для всех (100%)
curl -s -X PATCH "$BASE/flags/my-feature/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environment": "production", "strategies": [{"type": "default", "value": true}]}'

# 5. Архивировать
curl -s -X POST "$BASE/flags/my-feature/archive" \
  -H "Authorization: Bearer $TOKEN"

# 6. Проверить аудит
curl -s "$BASE/audit?entityType=FLAG&entityKey=my-feature" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {action: .action, timestamp: .timestamp}'
```

## Что дальше?

- [Обзор API](/api/overview) — аутентификация, формат, лимиты
- [Интеграции](/guide/integrations) — вебхуки, CI/CD
- [SDK: Обзор](/sdk/overview) — как SDK использует API
- [Swagger UI](http://localhost:8080/swagger-ui.html) — интерактивная документация
