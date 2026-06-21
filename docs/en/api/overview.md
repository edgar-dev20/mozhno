# API Overview

The можно REST API provides programmatic access to feature flags, segments, environments, API keys, and audit data. It is the same API that powers the web dashboard and SDKs.

## Base URL

All API requests use your можно instance as the base URL:

```
https://<your-mozhno-instance>/api
```

For local development:

```
http://localhost:8080/api
```

## Authentication

можно supports two authentication methods:

### JWT (JSON Web Token)

Used for **human users** accessing the web dashboard and API interactively. JWTs are obtained by logging in through the dashboard or the authentication endpoint.

```bash
# Obtain a JWT
curl -X POST https://your-instance/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "your-password"}'

# Response
# { "token": "eyJhbGciOiJIUzI1NiIs...", "expiresAt": "2026-06-22T10:30:00Z" }
```

Use the JWT in the `Authorization` header:

```bash
curl https://your-instance/api/flags \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

| Property | Description |
|----------|-------------|
| **Lifetime** | Configurable (default: 24 hours) |
| **Refresh** | Supported via `/api/auth/refresh` |
| **Scope** | Full access based on user role (Viewer, Editor, Admin) |

### API Key

Used for **machine clients** — SDKs, CI/CD pipelines, and automated scripts. API keys are created and managed in the dashboard under **Settings → API Keys**.

```bash
curl https://your-instance/api/flags \
  -H "Authorization: Bearer mz_sk_production_abc123"
```

API keys must include the `Authorization: Bearer` prefix, just like JWTs.

| Property | Description |
|----------|-------------|
| **Prefix** | `mz_sk_` (можно secret key) |
| **Lifetime** | Until revoked |
| **Scope** | Configurable per key: `flags:read`, `flags:write`, `segments:read`, `segments:write`, `admin` |
| **Environment** | Each key is bound to a specific environment |

> **Warning:** API keys are secrets. Never commit them to source control or expose them in client-side browser code. For browser applications, use a backend proxy or restrict the key's scope to `flags:read` only.

## Request Format

- **Content-Type:** `application/json` for request bodies
- **Accept:** `application/json` for responses
- **HTTP Methods:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **Encoding:** UTF-8

### Example Request

```bash
curl -X POST https://your-instance/api/flags \
  -H "Authorization: Bearer mz_sk_production_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "checkout_v2",
    "name": "Checkout Redesign v2",
    "description": "New checkout flow with one-click purchase",
    "type": "BOOLEAN",
    "defaultValue": false,
    "tags": ["team:checkout", "type:feature"]
  }'
```

## Rate Limiting

| Tier | Rate Limit | Burst |
|------|------------|-------|
| **API Key (read)** | 1000 requests/minute | 100 |
| **API Key (write)** | 200 requests/minute | 20 |
| **JWT (dashboard)** | 600 requests/minute | 60 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1718964000
```

When rate-limited, the API returns `429 Too Many Requests` with a `Retry-After` header.

> **Tip:** SDKs already handle rate limiting internally through local evaluation and polling. Direct API consumers should implement exponential backoff on 429 responses.

## API Versioning

можно does not use URL path versioning. The API is designed to be backward-compatible:

- **New fields** may be added to response payloads — clients should ignore unknown fields.
- **New optional parameters** may be added to requests — clients should only send what they need.
- **Breaking changes** are communicated through deprecation headers and release notes.

Check the OpenAPI specification for the exact contract:

```
https://your-instance/v3/api-docs
```

## Pagination

List endpoints support cursor-based and offset-based pagination:

```bash
# Offset pagination (default)
curl "https://your-instance/api/flags?page=0&size=20" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response includes pagination metadata
# {
#   "items": [...],
#   "page": 0,
#   "size": 20,
#   "totalItems": 142,
#   "totalPages": 8
# }
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | `0` | Zero-based page number |
| `size` | Integer | `20` | Items per page (max: 100) |

## Response Format

### Success

Successful responses return a `2xx` status code with a JSON body:

```json
{
  "key": "checkout_v2",
  "name": "Checkout Redesign v2",
  "description": "New checkout flow",
  "type": "BOOLEAN",
  "defaultValue": false,
  "state": "ACTIVE",
  "tags": ["team:checkout", "type:feature"],
  "createdAt": "2026-06-01T10:00:00Z",
  "updatedAt": "2026-06-15T14:30:00Z",
  "createdBy": "alice@example.com"
}
```

### Error

Error responses return a `4xx` or `5xx` status code with a JSON body:

```json
{
  "error": "NOT_FOUND",
  "message": "Flag with key 'nonexistent_flag' not found",
  "status": 404,
  "timestamp": "2026-06-21T10:30:00Z",
  "path": "/api/flags/nonexistent_flag"
}
```

| Field | Description |
|-------|-------------|
| `error` | Machine-readable error code |
| `message` | Human-readable error description |
| `status` | HTTP status code |
| `timestamp` | UTC timestamp of the error |
| `path` | Request path that caused the error |

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| `400` | `VALIDATION_ERROR` | Request body failed validation |
| `401` | `UNAUTHORIZED` | Missing or invalid authentication |
| `403` | `FORBIDDEN` | Authenticated but insufficient permissions |
| `404` | `NOT_FOUND` | Resource does not exist |
| `409` | `CONFLICT` | Resource already exists (e.g., duplicate flag key) |
| `429` | `RATE_LIMITED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

## API Documentation

### Swagger UI

An interactive API documentation UI is available at:

```
https://your-instance/swagger-ui.html
```

The Swagger UI lets you browse all endpoints, see request/response schemas, and execute requests directly from the browser.

### OpenAPI Specification

The machine-readable OpenAPI 3.1 specification is available at:

```
https://your-instance/v3/api-docs
```

Use this to generate client libraries, import into tools like Postman or Insomnia, or integrate with CI/CD pipelines.

## Environment Separation

Each API key is bound to a specific environment. Resources (flags, segments) are scoped to that environment:

```bash
# Production environment (api key: mz_sk_production_...)
curl https://your-instance/api/flags \
  -H "Authorization: Bearer mz_sk_production_abc123"
# → Returns only production flags

# Staging environment (api key: mz_sk_staging_...)
curl https://your-instance/api/flags \
  -H "Authorization: Bearer mz_sk_staging_xyz789"
# → Returns only staging flags
```

> **Tip:** Use separate instances or API keys to isolate environments. Never use a production API key in a staging or CI environment.

## Next Steps

- [REST API Reference](./rest.md) — Full endpoint documentation with curl examples.
- [SDK Overview](../sdk/overview.md) — How SDKs use the REST API internally.
- [Webhooks](../guide/integrations.md) — Push-based integration for CI/CD pipelines.
