# REST API Reference

Полный справочник по REST API **можно**<span class=brand-dot>.</span> v1. Для каждого endpoint приведены метод, путь, параметры и примеры `curl`.

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
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin",
    "role": "ADMIN",
    "status": "ACTIVE",
    "locale": "ru",
    "createdAt": "2026-01-01T00:00:00Z",
    "lastActiveAt": "2026-06-21T10:00:00Z"
  }
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

### Текущий пользователь

```http
GET /api/v1/auth/me
```

```bash
curl "http://localhost:8080/api/v1/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Выбор проекта

```http
POST /api/v1/auth/select-project
```

### Восстановление пароля

```http
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Принятие приглашения

```http
POST /api/v1/auth/accept-invite
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
| `flagType` | `string` | Да | `RELEASE` или `KILLSWITCH` |
| `tags` | `object[]` | Нет | Объекты `{tagId, value}` |
| `projectId` | `long` | Да | ID проекта |

```bash
curl -X POST "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new-checkout",
    "name": "Новый чекаут",
    "description": "Переработка процесса оформления заказа",
    "flagType": "RELEASE",
    "projectId": 1,
    "tags": [{"tagId": 1, "value": "checkout"}, {"tagId": 2, "value": "ui-redesign"}]
  }'
```

### Получить все флаги

```http
GET /api/v1/flags
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `includeArchived` | `boolean` | `false` | Включить архивные флаги |
| `page` | `int` | `0` | Страница |
| `size` | `int` | `50` | Размер страницы (макс. 200) |

```bash
curl "http://localhost:8080/api/v1/flags?includeArchived=true" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Получить флаг по ID

```http
GET /api/v1/flags/{id}
```

```bash
curl "http://localhost:8080/api/v1/flags/42" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Флаги по окружению

```http
GET /api/v1/flags/by-environment
```

### Обогащённые флаги (dashboard)

```http
GET /api/v1/flags/enriched
```

Возвращает флаги со связанными сегментами, тегами, контекстами и окружениями.

### Обновить флаг

```http
PUT /api/v1/flags/{id}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/flags/42" \
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
PUT /api/v1/flags/{flagId}/strategies
```

Настройка стратегии для окружения:

```bash
curl -X PUT "http://localhost:8080/api/v1/flags/42/strategies" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environmentId": 3,
    "enabled": true,
    "percentage": 25
  }'
```

### Архивировать флаг

```http
POST /api/v1/flags/{id}/archive
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/42/archive" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Восстановить флаг

```http
POST /api/v1/flags/{id}/unarchive
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/42/unarchive" \
  -H "Authorization: Bearer $JWT_TOKEN"
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
    "name": "Бета-тестеры",
    "description": "Пользователи с ID, начинающимся на beta-",
    "projectId": 1
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

### Получить сегмент по ID

```http
GET /api/v1/segments/{id}
```

```bash
curl "http://localhost:8080/api/v1/segments/5" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить сегмент

```http
PUT /api/v1/segments/{id}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/segments/5" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Бета-тестеры (расширенный)",
    "description": "Обновлённое описание"
  }'
```

### Удалить сегмент

```http
DELETE /api/v1/segments/{id}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/segments/5" \
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
    "name": "Staging"
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

### Получить окружение по ID

```http
GET /api/v1/environments/{id}
```

### Обновить окружение

```http
PUT /api/v1/environments/{id}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/environments/2" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staging (Test)"
  }'
```

### Удалить окружение

```http
DELETE /api/v1/environments/{id}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/environments/2" \
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
    "keyType": "SERVER",
    "environmentId": 3
  }'
```

Ответ:

```json
{
  "id": 12,
  "name": "Production SDK Key",
  "apiKey": "dGhpcyBpcyBhIDY0LWNoYXJhY3RlciBiYXNlNjR1cmwgZW5jb2RlZCBrZXk",
  "keyType": "SERVER",
  "environmentId": 3,
  "createdAt": "2026-06-21T13:41:05Z"
}
```

> **Предупреждение:** Значение ключа (`apiKey`) показывается **только один раз** при создании. Сохраните его немедленно.

### Получить все API-ключи

```http
GET /api/v1/api-keys
```

```bash
curl "http://localhost:8080/api/v1/api-keys" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить API-ключ

```http
PUT /api/v1/api-keys/{id}
```

### Удалить API-ключ

```http
DELETE /api/v1/api-keys/{id}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/api-keys/12" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

После удаления ключ немедленно перестаёт работать. Все SDK, использующие этот ключ, перестанут получать обновления.

## Аудит

### Получить записи аудита

```http
GET /api/v1/audit
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `page` | `int` | `0` | Страница |
| `size` | `int` | `50` | Размер страницы (макс. 200) |
| `dateFrom` | `datetime` | — | Начало периода (ISO 8601) |
| `dateTo` | `datetime` | — | Конец периода (ISO 8601) |

```bash
# Все изменения за последнюю неделю
curl "http://localhost:8080/api/v1/audit?dateFrom=2026-06-14T00:00:00Z&dateTo=2026-06-21T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## SDK

### Получить правила флагов

```http
GET /api/client/features
```

Используется SDK при инициализации. Возвращает массив флагов для окружения, привязанного к API-ключу SERVER.

```bash
curl "http://localhost:8080/api/client/features" \
  -H "Authorization: Bearer <api-key>"
```

Ответ — массив объектов:

```json
[
  {
    "name": "Новый чекаут",
    "key": "new-checkout",
    "enabled": true,
    "activation": {
      "rollOut": 50,
      "constraints": [
        { "field": "country", "operator": "in", "values": ["RU", "BY"], "contextType": "string" }
      ],
      "segments": [
        { "name": "Premium Users", "constraints": [...] }
      ]
    }
  }
]
```

### Оценка флагов (client-side)

```http
POST /api/client/evaluate
```

Оценивает флаги на сервере для переданного контекста (режим `mode: 'client'`).

```bash
curl -X POST "http://localhost:8080/api/client/evaluate" \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"context": {"userId": "user-123", "country": "RU"}, "toggles": ["new-checkout"]}'
```

### Отправка метрик

```http
POST /api/client/metrics
```

Отправка накопленных SDK метрик использования флагов.

```bash
curl -X POST "http://localhost:8080/api/client/metrics" \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"evaluations": {"new-checkout": {"t": 150, "f": 50}}}'
```

## Интеграции

### Создать интеграцию

```http
POST /api/v1/integrations
```

```bash
curl -X POST "http://localhost:8080/api/v1/integrations" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Webhook",
    "enabled": true,
    "type": "custom_webhook",
    "configJson": "{\"url\":\"https://your-server.example.com/hooks/mozhno\"}",
    "eventSubscriptionsJson": "[\"flag.updated\",\"flag.archived\",\"flag.deleted\"]",
    "projectId": 1
  }'
```

### Получить все интеграции

```http
GET /api/v1/integrations
```

```bash
curl "http://localhost:8080/api/v1/integrations" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Обновить интеграцию

```http
PUT /api/v1/integrations/{id}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/integrations/1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Webhook",
    "enabled": false,
    "type": "custom_webhook",
    "configJson": "{\"url\":\"https://new-endpoint.example.com/hooks\"}",
    "eventSubscriptionsJson": "[\"flag.updated\",\"flag.archived\",\"flag.deleted\",\"flag.created\"]"
  }'
```

### Удалить интеграцию

```http
DELETE /api/v1/integrations/{id}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/integrations/1" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Проверить квоту вебхуков

```http
GET /api/v1/integrations/webhook-limit
```

Возвращает оставшееся количество доступных отправок вебхуков.

```bash
curl "http://localhost:8080/api/v1/integrations/webhook-limit" \
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
| `DEVELOPER` | Управление флагами, сегментами, стратегиями |
| `VIEWER` | Только просмотр |

### Получить всех пользователей

```http
GET /api/v1/users
```

```bash
curl "http://localhost:8080/api/v1/users" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Получить пользователя

```http
GET /api/v1/users/{id}
```

### Обновить пользователя

```http
PUT /api/v1/users/{id}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/users/5" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Новое имя", "role": "ADMIN"}'
```

### Удалить пользователя

```http
DELETE /api/v1/users/{id}
```

```bash
curl -X DELETE "http://localhost:8080/api/v1/users/5" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Теги

### Создать тег

```http
POST /api/v1/tags
```

```bash
curl -X POST "http://localhost:8080/api/v1/tags" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "checkout",
    "color": "#3b82f6",
    "projectId": 1
  }'
```

### Получить все теги

```http
GET /api/v1/tags
```

```bash
curl "http://localhost:8080/api/v1/tags" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Получить тег по ID

```http
GET /api/v1/tags/{id}
```

### Обновить тег

```http
PUT /api/v1/tags/{id}
```

### Удалить тег

```http
DELETE /api/v1/tags/{id}
```

## Контексты

### Создать определение контекста

```http
POST /api/v1/contexts
```

```bash
curl -X POST "http://localhost:8080/api/v1/contexts" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Страна",
    "contextKey": "country",
    "contextType": "string",
    "projectId": 1
  }'
```

### Получить все контексты

```http
GET /api/v1/contexts
```

### Получить контекст по ID

```http
GET /api/v1/contexts/{definitionId}
```

### Обновить контекст

```http
PUT /api/v1/contexts/{definitionId}
```

### Удалить контекст

```http
DELETE /api/v1/contexts/{definitionId}
```

### Управление значениями контекста

```http
GET    /api/v1/contexts/{definitionId}/values
POST   /api/v1/contexts/{definitionId}/values
PUT    /api/v1/contexts/{definitionId}/values
GET    /api/v1/contexts/values/{valueId}
PUT    /api/v1/contexts/values/{valueId}
DELETE /api/v1/contexts/values/{valueId}
```

## Метрики

### Метрики флага

```http
GET /api/v1/flags/{flagId}/metrics
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `environmentId` | `long` | ID окружения |
| `instanceId` | `string` | ID экземпляра SDK |
| `appName` | `string` | Имя приложения |

```bash
curl "http://localhost:8080/api/v1/flags/42/metrics?environmentId=3" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Метрики проекта

```http
GET /api/v1/metrics
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `environmentId` | `long` | ID окружения |

## Настройки проекта

### Получить настройки

```http
GET /api/v1/settings
```

### Обновить настройки

```http
PUT /api/v1/settings
```

```bash
curl -X PUT "http://localhost:8080/api/v1/settings" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requireMfa": false,
    "sessionTimeoutHours": 8
  }'
```

## Проекты

### Получить все проекты

```http
GET /api/v1/projects
```

### Получить проект по ID

```http
GET /api/v1/projects/{id}
```

### Создать проект

```http
POST /api/v1/projects
```

### Обновить проект

```http
PUT /api/v1/projects/{id}
```

### Удалить проект

```http
DELETE /api/v1/projects/{id}
```

### Экземпляры SDK

```http
GET /api/v1/projects/{id}/client-instances
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `environmentId` | `long` | ID окружения |

## Коды ошибок API

| HTTP-код | Код ошибки | Описание |
|----------|-----------|----------|
| `400` | `BAD_REQUEST` | Неверные параметры запроса |
| `400` | `VALIDATION_ERROR` | Ошибка валидации тела запроса |
| `401` | `UNAUTHORIZED` | Отсутствует или недействителен токен/ключ |
| `401` | `INVALID_CREDENTIALS` | Неверный email или пароль |
| `401` | `TOKEN_REUSE` | Обнаружен повторно использованный refresh-токен |
| `402` | `QUOTA_EXCEEDED` | Превышена квота ресурсов |
| `403` | `FORBIDDEN` | Недостаточно прав |
| `404` | `NOT_FOUND` | Ресурс не найден |
| `409` | `CONFLICT` | Конфликт: ресурс уже существует |
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
  -d '{"key": "my-feature", "name": "Моя фича", "flagType": "RELEASE", "projectId": 1}'

# 2. Настроить стратегию: 1% роллаут
curl -s -X PUT "$BASE/flags/42/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": 3, "enabled": true, "percentage": 1}'

# 3. Увеличить до 50% (через день)
curl -s -X PUT "$BASE/flags/42/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": 3, "enabled": true, "percentage": 50}'

# 4. Включить для всех (100%)
curl -s -X PUT "$BASE/flags/42/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": 3, "enabled": true, "percentage": 100}'

# 5. Архивировать
curl -s -X POST "$BASE/flags/42/archive" \
  -H "Authorization: Bearer $TOKEN"

# 6. Проверить аудит
curl -s "$BASE/audit?dateFrom=2026-01-01T00:00:00Z" \
  -H "Authorization: Bearer $TOKEN"
```

## Что дальше?

- [Обзор API](/api/overview) — аутентификация, формат, лимиты
- [Интеграции](/guide/integrations) — интеграции, CI/CD
- [SDK: Обзор](/sdk/overview) — как SDK использует API
- [Swagger UI](http://localhost:8080/swagger-ui.html) — интерактивная документация
