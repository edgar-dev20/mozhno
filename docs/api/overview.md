# Обзор API

**можно**<span class=brand-dot>.</span> предоставляет REST API для программного управления флагами, сегментами, окружениями и API-ключами. На этой странице — общие принципы: аутентификация, формат запросов, ошибки и версионирование.

## Базовый URL

Все запросы к API выполняются относительно базового URL сервера:

```
http://localhost:8080/api/v1
```

В продакшене:

```
https://flags.example.com/api/v1
```

## Аутентификация

**можно**<span class=brand-dot>.</span> поддерживает два метода аутентификации через заголовок `Authorization: Bearer`:

### JWT Bearer Token

Используется для доступа к веб-панели и управления ресурсами.

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

Ответ:

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
    "avatar": null,
    "locale": "ru",
    "createdAt": "2026-01-01T00:00:00Z",
    "lastActiveAt": "2026-06-21T10:00:00Z"
  }
}
```

| Параметр | Значение по умолчанию | Описание |
|----------|----------------------|----------|
| Access token TTL | 15 минут | Настраивается через `JWT_ACCESS_TOKEN_TTL_MINUTES` |
| Refresh token TTL | 30 дней | Настраивается через `JWT_REFRESH_TOKEN_TTL_DAYS` |
| Refresh token rotation | Включена | Семейная ротация: старый токен инвалидируется при обновлении |

### API Key

Используется SDK и для сервер-сервер взаимодействия. Привязан к конкретному окружению.

```bash
curl "http://localhost:8080/api/client/features" \
  -H "Authorization: Bearer <your-api-key>"
```

| Особенность | Описание |
|-------------|----------|
| **Формат** | 64-символьная Base64url-encoded случайная строка (без префикса) |
| **Типы** | `SERVER` (чтение+запись) или `FRONTEND` (только чтение) |
| **Привязка к окружению** | Один ключ = одно окружение |
| **Отзыв** | Можно отозвать ключ в любой момент |
| **Ротация** | Создайте новый ключ, обновите приложения, отзовите старый |

> **Предупреждение:** Никогда не коммитьте API-ключи в репозиторий. Используйте переменные окружения или secrets manager.

## Формат запросов и ответов

- **Content-Type:** `application/json`
- **Accept:** `application/json`

### Успешный ответ (один объект)

```json
{
  "id": 1,
  "key": "checkout_v2",
  "name": "Новый чекаут",
  "description": "Переработка оформления заказа",
  "flagType": "RELEASE",
  "enabled": true,
  "archived": false,
  "tags": ["checkout", "ui-redesign"],
  "createdAt": "2026-06-21T13:41:05Z"
}
```

### Список (пагинация)

```json
{
  "items": [...],
  "page": 0,
  "size": 20,
  "totalItems": 147,
  "totalPages": 8
}
```

### Ошибка

```json
{
  "error": "человекочитаемое сообщение",
  "code": "NOT_FOUND",
  "traceId": "abc123"
}
```

| HTTP-код | Код ошибки | Описание |
|----------|------------|----------|
| `400` | `BAD_REQUEST` | Неверные параметры запроса |
| `400` | `VALIDATION_ERROR` | Ошибка валидации тела запроса |
| `401` | `UNAUTHORIZED` | Отсутствует или недействителен токен/ключ |
| `401` | `INVALID_CREDENTIALS` | Неверный email или пароль |
| `401` | `TOKEN_REUSE` | Обнаружен повторно использованный refresh-токен |
| `403` | `FORBIDDEN` | Недостаточно прав |
| `404` | `NOT_FOUND` | Ресурс не найден |
| `409` | `CONFLICT` | Ресурс уже существует |
| `405` | `METHOD_NOT_ALLOWED` | Неверный HTTP-метод |
| `500` | `INTERNAL_ERROR` | Внутренняя ошибка сервера |

## Пагинация

Коллекции поддерживают пагинацию:

```bash
curl "http://localhost:8080/api/v1/flags?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `page` | `int` | `0` | Номер страницы (0-based) |
| `size` | `int` | `20` | Размер страницы (макс. 100) |

## Категории API

| Категория | Базовый путь | Используется |
|-----------|-------------|-------------|
| **Флаги** | `/api/v1/flags` | Панель, CI/CD |
| **Сегменты** | `/api/v1/segments` | Панель |
| **Окружения** | `/api/v1/environments` | Панель |
| **Контексты** | `/api/v1/contexts` | Панель |
| **API-ключи** | `/api/v1/api-keys` | Панель |
| **Аудит** | `/api/v1/audit` | Панель |
| **Проекты** | `/api/v1/projects` | Панель |
| **Пользователи** | `/api/v1/users` | Панель (Admin) |
| **Настройки** | `/api/v1/settings` | Панель (Admin) |
| **Интеграции** | `/api/v1/integrations` | Панель |
| **Теги** | `/api/v1/tags` | Панель |
| **Метрики** | `/api/v1/metrics` | Панель |
| **Аутентификация** | `/api/v1/auth` | Логин, обновление, выход |

### SDK-эндпоинты

| Endpoint | Метод | Аутентификация | Описание |
|----------|--------|----------------|----------|
| `/api/client/features` | `GET` | API Key | Получение всех флагов окружения (ETag) |
| `/api/client/evaluate` | `POST` | API Key | Оценка флагов для переданного контекста |
| `/api/client/metrics` | `POST` | API Key | Отправка метрик использования |

## Swagger UI и OpenAPI

Интерактивная документация API:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI 3.1 спецификация:

```
http://localhost:8080/v3/api-docs
```

Генерация клиентских библиотек:

```bash
openapi-generator generate \
  -i http://localhost:8080/v3/api-docs \
  -g java \
  -o ./generated-client
```

| Переменная | По умолчанию |
|------------|-------------|
| `SPRINGDOC_SWAGGER_UI_PATH` | `/swagger-ui.html` |
| `SPRINGDOC_API_DOCS_PATH` | `/v3/api-docs` |

## Примеры использования

### Создание флага

```bash
curl -X POST "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "checkout_v2",
    "name": "Новый чекаут",
    "description": "Переработка оформления заказа",
    "flagType": "RELEASE",
    "projectId": 1
  }'
```

### Получение правил для SDK

```bash
curl "http://localhost:8080/api/client/features" \
  -H "Authorization: Bearer <api-key>"
```

### Архивирование флага

```bash
curl -X POST "http://localhost:8080/api/v1/flags/42/archive" \
  -H "Authorization: Bearer $TOKEN"
```

## Что дальше?

- [REST API Reference](/api/rest) — полный список endpoints с примерами
- [Интеграции](/guide/integrations) — CI/CD, вебхуки, GitHub Actions
- [SDK: Обзор](/sdk/overview) — как SDK взаимодействует с API
- [Конфигурация](/intro/configuration) — переменные окружения сервера
