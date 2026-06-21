# Обзор API

**можно.** предоставляет REST API для программного управления флагами, сегментами, окружениями и API-ключами. На этой странице — общие принципы: аутентификация, формат запросов, лимиты и версионирование.

## Базовый URL

Все запросы к API выполняются относительно базового URL сервера **можно.**:

```
http://localhost:8080/api/v1
```

В продакшене:

```
https://flags.example.com/api/v1
```

## Аутентификация

**можно.** поддерживает два метода аутентификации:

| Метод | Использование | Заголовок |
|-------|--------------|-----------|
| **JWT Bearer Token** | Веб-панель, администрирование, полный доступ | `Authorization: Bearer <jwt>` |
| **API Key** | SDK, CI/CD, сервер-сервер | `X-Api-Key: <api-key>` |

### JWT Bearer Token

Используется для доступа к веб-панели и полного управления ресурсами.

**Получение токена:**

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

Ответ:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 900000,
  "tokenType": "Bearer"
}
```

**Использование:**

```bash
curl "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Обновление токена:**

```bash
curl -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."}'
```

| Параметр JWT | Значение по умолчанию | Описание |
|-------------|----------------------|----------|
| Access token TTL | 15 минут | Настраивается через `JWT_ACCESS_TOKEN_EXPIRATION` |
| Refresh token TTL | 7 дней | Настраивается через `JWT_REFRESH_TOKEN_EXPIRATION` |
| Refresh token rotation | Включена | Старый refresh-токен инвалидируется при обновлении |

### API Key

Используется SDK и для сервер-сервер взаимодействия. Привязан к конкретному окружению.

**Формат ключа:** `mz_env_<random>`

**Создание ключа** — в веб-панели: **Настройки → API-ключи → «Создать ключ»**.

**Использование:**

```bash
curl "http://localhost:8080/api/v1/sdk/rules" \
  -H "X-Api-Key: mz_env_abc123def456"
```

| Особенность | Описание |
|-------------|----------|
| Привязка к окружению | Один ключ = одно окружение (dev, staging, production) |
| Отзыв | Можно отозвать ключ в любой момент |
| Ротация | Создайте новый ключ, обновите приложения, отзовите старый |

> **Предупреждение:** Никогда не коммитьте API-ключи в репозиторий. Используйте переменные окружения или secrets manager.

## Формат запросов и ответов

### Content-Type

Все запросы и ответы — JSON:

```
Content-Type: application/json
Accept: application/json
```

### Тело запроса

```json
{
  "key": "new-checkout",
  "name": "Новый чекаут",
  "description": "Переработка оформления заказа",
  "type": "BOOLEAN",
  "tags": ["checkout", "ui-redesign"]
}
```

### Тело ответа

Успешный ответ:

```json
{
  "data": {
    "id": "f_abc123",
    "key": "new-checkout",
    "name": "Новый чекаут",
    "type": "BOOLEAN",
    "tags": ["checkout", "ui-redesign"],
    "createdAt": "2026-06-21T13:41:05Z",
    "updatedAt": "2026-06-21T13:41:05Z"
  }
}
```

### Ошибки

```json
{
  "error": {
    "code": "FLAG_NOT_FOUND",
    "message": "Флаг с ключом 'unknown-flag' не найден",
    "details": {
      "flagKey": "unknown-flag"
    }
  }
}
```

| HTTP-код | Значение |
|----------|----------|
| `200` | Успех |
| `201` | Создано |
| `204` | Успех, без содержимого (например, удаление) |
| `400` | Ошибка валидации: неверные данные |
| `401` | Не аутентифицирован: отсутствует или недействителен токен/ключ |
| `403` | Нет прав: роль не позволяет выполнить действие |
| `404` | Не найдено: ресурс не существует |
| `409` | Конфликт: флаг с таким ключом уже существует |
| `429` | Слишком много запросов: превышен rate limit |
| `500` | Внутренняя ошибка сервера |

## Rate Limiting

| План | Лимит запросов | Окно |
|------|---------------|------|
| **Open Core** | 60 запросов/мин | 1 минута |
| **SDK (получение правил)** | 120 запросов/мин | 1 минута |

При превышении лимита возвращается `429 Too Many Requests` с заголовками:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718970000
Retry-After: 45
```

| Заголовок | Описание |
|-----------|----------|
| `X-RateLimit-Limit` | Максимальное количество запросов в окне |
| `X-RateLimit-Remaining` | Оставшееся количество запросов |
| `X-RateLimit-Reset` | Unix timestamp сброса лимита |
| `Retry-After` | Секунд до сброса лимита |

## Версионирование

API версионируется через URL-префикс:

```
/api/v1/flags
/api/v1/segments
/api/v1/audit
```

| Версия | Статус |
|--------|--------|
| `v1` | Текущая стабильная |

Обратная совместимость гарантируется в пределах мажорной версии (v1). Новые поля могут добавляться, но существующие не удаляются и не меняют тип.

## Пагинация

Коллекции (списки флагов, записи аудита) поддерживают пагинацию:

```bash
curl "http://localhost:8080/api/v1/flags?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `page` | `int` | `0` | Номер страницы (0-based) |
| `size` | `int` | `20` | Размер страницы (макс. 100) |
| `sort` | `string` | `createdAt,desc` | Сортировка: `поле,направление` |

Ответ с пагинацией:

```json
{
  "data": [...],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 147,
    "totalPages": 8
  }
}
```

## Фильтрация

Многие коллекции поддерживают фильтрацию через query-параметры:

```bash
# Флаги по окружению
curl "http://localhost:8080/api/v1/flags?environment=production" \
  -H "Authorization: Bearer $TOKEN"

# Флаги по тегу
curl "http://localhost:8080/api/v1/flags?tag=checkout" \
  -H "Authorization: Bearer $TOKEN"

# Флаги по статусу
curl "http://localhost:8080/api/v1/flags?status=active" \
  -H "Authorization: Bearer $TOKEN"

# Аудит по дате
curl "http://localhost:8080/api/v1/audit?from=2026-06-01T00:00:00Z&to=2026-06-21T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

## Категории API

```mermaid
graph TD
    A[REST API v1] --> B[Флаги]
    A --> C[Сегменты]
    A --> D[Окружения]
    A --> E[API-ключи]
    A --> F[Аудит]
    A --> G[SDK]
    A --> H[Аутентификация]
    A --> I[Вебхуки]
```

| Категория | Базовый путь | Документация |
|-----------|-------------|-------------|
| **Флаги** | `/api/v1/flags` | [REST API](/api/rest#флаги) |
| **Сегменты** | `/api/v1/segments` | [REST API](/api/rest#сегменты) |
| **Окружения** | `/api/v1/environments` | [REST API](/api/rest#окружения) |
| **API-ключи** | `/api/v1/api-keys` | [REST API](/api/rest#api-ключи) |
| **Аудит** | `/api/v1/audit` | [REST API](/api/rest#аудит) |
| **SDK (правила)** | `/api/v1/sdk` | [Обзор SDK](/sdk/overview) |
| **Аутентификация** | `/api/v1/auth` | Текущая страница |
| **Вебхуки** | `/api/v1/webhooks` | [Интеграции](/guide/integrations) |

## Swagger UI и OpenAPI

### Swagger UI

Интерактивная документация API доступна по адресу:

```
http://localhost:8080/swagger-ui.html
```

Swagger UI позволяет просматривать все endpoints, заполнять параметры и выполнять запросы прямо из браузера.

### OpenAPI 3.1 спецификация

Машиночитаемая спецификация в формате OpenAPI 3.1:

```
http://localhost:8080/v3/api-docs
```

Используйте для генерации клиентских библиотек:

```bash
# Генерация Java-клиента через openapi-generator
openapi-generator generate \
  -i http://localhost:8080/v3/api-docs \
  -g java \
  -o ./generated-client

# Генерация TypeScript-клиента
openapi-generator generate \
  -i http://localhost:8080/v3/api-docs \
  -g typescript-axios \
  -o ./generated-client
```

Пути Swagger и OpenAPI настраиваются через переменные окружения:

| Переменная | По умолчанию |
|------------|-------------|
| `SPRINGDOC_SWAGGER_UI_PATH` | `/swagger-ui.html` |
| `SPRINGDOC_API_DOCS_PATH` | `/v3/api-docs` |

## Примеры использования

### Создание флага через API

```bash
curl -X POST "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new-checkout",
    "name": "Новый чекаут",
    "description": "Переработка оформления заказа",
    "type": "BOOLEAN",
    "tags": ["checkout", "ui-redesign"]
  }'
```

### Получение всех флагов

```bash
curl "http://localhost:8080/api/v1/flags?environment=production&page=0&size=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Получение правил для SDK

```bash
curl "http://localhost:8080/api/v1/sdk/rules" \
  -H "X-Api-Key: mz_env_abc123def456"
```

### Обновление стратегии флага

```bash
curl -X PATCH "http://localhost:8080/api/v1/flags/new-checkout/strategies" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "gradual",
    "percentage": 50,
    "environment": "production"
  }'
```

## Что дальше?

- [REST API Reference](/api/rest) — полный список endpoints с примерами
- [Интеграции](/guide/integrations) — CI/CD, вебхуки, GitHub Actions
- [SDK: Обзор](/sdk/overview) — как SDK взаимодействует с API
- [Конфигурация](/guide/configuration) — переменные окружения сервера
