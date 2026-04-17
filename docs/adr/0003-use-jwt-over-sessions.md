# ADR-0003: Use JWT over Server-Side Sessions

**Date:** 2026-06-12
**Status:** Accepted

## Context

Mozhno — это API-first сервер. Клиенты: React SPA (встроенная веб-панель), Java SDK,
JavaScript SDK. SDK-клиенты аутентифицируются по API-ключам (долгоживущие статические
токены). Пользователи веб-панели аутентифицируются по email/password.

Нужен механизм аутентификации, который:
1. Не требует sticky sessions при горизонтальном масштабировании.
2. Позволяет revoke-токены без централизованного хранилища сессий.
3. Поддерживает refresh token rotation с защитой от replay.

## Decision

**JSON Web Tokens (JWT)** с HMAC-SHA256 подписью для access-токенов и opaque
refresh-токенов в БД.

- Access-токен: короткоживущий (15 мин), содержит user_id, email, role, status.
  Валидируется без запроса к БД.
- Refresh-токен: хранится в БД (таблица `refresh_tokens`), поддерживает family-based
  rotation с `SELECT ... FOR UPDATE`. При обнаружении повторного использования —
  вся family немедленно revoke'ится.
- API-ключи: проверяются прямым поиском в БД через `ApiKeyAuthenticationProvider`.

## Consequences

**Позитивные:**
- Stateless: любой инстанс сервера может валидировать access-токен без обращения к БД
  или shared cache.
- Refresh token rotation с `SELECT ... FOR UPDATE` защищает от race condition при
  одновременном refresh с одного токена.
- API-ключи не требуют refresh-логики — SDK просто хранит ключ.
- Нет необходимости в Redis или shared session storage.

**Негативные:**
- Нельзя мгновенно отозвать access-токен (только через короткий TTL).
- Refresh-токены требуют БД-запроса при каждом refresh (приемлемо — 1 запрос на ~15 мин).
- JWT payload растёт с числом claims (ограничение 4KB на куки, нерелевантно для
  Authorization header).

## Alternatives Considered

- **Server-side sessions (Spring Session + Redis):** Требует Redis, sticky sessions
  или distributed cache. Избыточен для API-first сервера.
- **Opaque tokens:** Каждый запрос требует БД-запроса. JWT даёт zero-DB-lookup для
  веба и SDK.
- **OAuth2/OpenID Connect:** Избыточен для self-hosted сервера. Может быть добавлен
  как `AuthenticationFlowSpi` в enterprise-версии.
