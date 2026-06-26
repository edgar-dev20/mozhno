# API Overview

The можно REST API provides programmatic access to feature flags, segments, environments, API keys, and audit data. It is the same API that powers the web dashboard and SDKs.

## Base URL

All API requests use your можно instance as the base URL:

```
http://localhost:8080/api/v1
```

For production:

```
https://<your-mozhno-instance>/api/v1
```

## Authentication

можно supports two authentication methods, both using the `Authorization: Bearer` header:

### JWT (JSON Web Token)

Used for **human users** accessing the web dashboard. JWTs are obtained by logging in.

```bash
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

Response:

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
    "locale": "en",
    "createdAt": "2026-01-01T00:00:00Z",
    "lastActiveAt": "2026-06-21T10:00:00Z"
  }
}
```

| Property | Description |
|----------|-------------|
| **Access token lifetime** | 15 minutes (configurable via `JWT_ACCESS_TOKEN_TTL_MINUTES`) |
| **Refresh token lifetime** | 30 days (configurable via `JWT_REFRESH_TOKEN_TTL_DAYS`) |
| **Refresh rotation** | Token family rotation — old token revoked on refresh, reuse of revoked token revokes entire family |

**Refresh tokens:**

```bash
curl -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."}'
```

### API Key

Used for **machine clients** — SDKs, CI/CD pipelines, and automated scripts. API keys are created and managed in the dashboard under **Settings → API Keys**.

```bash
curl "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer <your-api-key>"
```

| Property | Description |
|----------|-------------|
| **Format** | 64-character Base64url-encoded random string (no prefix) |
| **Environment** | Each key is bound to a specific environment |
| **Types** | `SERVER` (read+write) or `FRONTEND` (read-only) |
| **Lifetime** | Until revoked |

The API key is sent in the `Authorization: Bearer` header, the same as JWT. The server distinguishes JWT from API key automatically.

> **Warning:** API keys are secrets. Never commit them to source control or expose them in client-side browser code. For browser applications, use the `FRONTEND` key type and restrict access.

## Request & Response Format

- **Content-Type:** `application/json`
- **Accept:** `application/json`

### Success Response

Single resource — returned directly:

```json
{
  "id": 1,
  "key": "checkout_v2",
  "name": "Checkout Redesign v2",
  "description": "New checkout flow",
  "flagType": "RELEASE",
  "enabled": true,
  "archived": false,
  "tags": ["checkout", "ui-redesign"],
  "createdAt": "2026-06-01T10:00:00Z",
  "lastUsedAt": "2026-06-15T14:30:00Z"
}
```

List (paginated) response:

```json
{
  "items": [...],
  "page": 0,
  "size": 20,
  "totalItems": 142,
  "totalPages": 8
}
```

### Error Response

```json
{
  "error": "human-readable error message",
  "code": "NOT_FOUND",
  "traceId": "abc123"
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| `400` | `BAD_REQUEST` | Request body or parameters invalid |
| `400` | `VALIDATION_ERROR` | Request body failed validation (includes `details` array) |
| `401` | `UNAUTHORIZED` | Missing or invalid authentication |
| `401` | `INVALID_CREDENTIALS` | Login failed |
| `401` | `TOKEN_REUSE` | Stolen refresh token detected |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Resource already exists |
| `405` | `METHOD_NOT_ALLOWED` | Wrong HTTP method |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

## Pagination

List endpoints support offset-based pagination:

```bash
curl "http://localhost:8080/api/v1/flags?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | `0` | Zero-based page number |
| `size` | Integer | `20` | Items per page (max: 100) |

## API Categories

| Category | Base Path | Used By |
|----------|-----------|---------|
| **Flags** | `/api/v1/flags` | Dashboard, CI/CD |
| **Segments** | `/api/v1/segments` | Dashboard |
| **Environments** | `/api/v1/environments` | Dashboard |
| **Contexts** | `/api/v1/contexts` | Dashboard |
| **API Keys** | `/api/v1/api-keys` | Dashboard |
| **Audit** | `/api/v1/audit` | Dashboard |
| **Projects** | `/api/v1/projects` | Dashboard |
| **Users** | `/api/v1/users` | Dashboard (Admin) |
| **Settings** | `/api/v1/settings` | Dashboard (Admin) |
| **Integrations** | `/api/v1/integrations` | Dashboard |
| **Tags** | `/api/v1/tags` | Dashboard |
| **Metrics** | `/api/v1/metrics` | Dashboard |
| **Auth** | `/api/v1/auth` | Login, refresh, logout |

### SDK Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/client/features` | `GET` | API Key | Fetch all flags for the environment (ETag support) |
| `/api/client/evaluate` | `POST` | API Key | Evaluate flags with a given context |
| `/api/client/metrics` | `POST` | API Key | Send usage metrics |

## Swagger UI & OpenAPI

Interactive API documentation is available at:

```
http://localhost:8080/swagger-ui.html
```

Machine-readable OpenAPI 3.1 specification:

```
http://localhost:8080/v3/api-docs
```

Generate client libraries:

```bash
openapi-generator generate \
  -i http://localhost:8080/v3/api-docs \
  -g java \
  -o ./generated-client
```

## Examples

### Create a Flag

```bash
curl -X POST "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "checkout_v2",
    "name": "Checkout Redesign v2",
    "description": "New checkout flow with one-click purchase",
    "flagType": "RELEASE",
    "projectId": 1
  }'
```

### Get SDK Rules

```bash
curl "http://localhost:8080/api/client/features" \
  -H "Authorization: Bearer <your-api-key>"
```

### Archive a Flag

```bash
curl -X POST "http://localhost:8080/api/v1/flags/42/archive" \
  -H "Authorization: Bearer $TOKEN"
```

## Next Steps

- [Swagger UI](/swagger-ui.html) — Interactive API documentation
- [SDK Overview](../sdk/overview.md) — How SDKs use the REST API internally.
- [Webhooks](../guide/integrations.md) — Push-based integration for CI/CD pipelines.
