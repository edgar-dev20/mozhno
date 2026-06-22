# REST API Reference

Complete reference for the можно REST API v1. Each endpoint includes method, path, parameters, and `curl` examples.

> **Tip:** Interactive documentation is available via Swagger UI at [`/swagger-ui.html`](http://localhost:8080/swagger-ui.html). OpenAPI 3.1 spec — [`/v3/api-docs`](http://localhost:8080/v3/api-docs).

## Authentication

### Login

```http
POST /api/v1/auth/login
```

**Request body:**

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response:**

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
    "locale": "en",
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

### Refresh Token

```http
POST /api/v1/auth/refresh
```

```bash
curl -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."}'
```

### Logout

```http
POST /api/v1/auth/logout
```

```bash
curl -X POST "http://localhost:8080/api/v1/auth/logout" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Current User

```http
GET /api/v1/auth/me
```

```bash
curl "http://localhost:8080/api/v1/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Select Project

```http
POST /api/v1/auth/select-project
```

### Password Recovery

```http
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Accept Invitation

```http
POST /api/v1/auth/accept-invite
```

## Flags

### Create Flag

```http
POST /api/v1/flags
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | `string` | Yes | Unique flag key |
| `name` | `string` | Yes | Flag name |
| `description` | `string` | No | Description |
| `flagType` | `string` | Yes | `RELEASE` or `KILLSWITCH` |
| `tags` | `string[]` | No | Tag list |
| `projectId` | `long` | Yes | Project ID |

```bash
curl -X POST "http://localhost:8080/api/v1/flags" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new-checkout",
    "name": "New Checkout",
    "description": "Checkout flow redesign",
    "flagType": "RELEASE",
    "projectId": 1,
    "tags": ["checkout", "ui-redesign"]
  }'
```

### List All Flags

```http
GET /api/v1/flags
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeArchived` | `boolean` | `false` | Include archived flags |
| `page` | `int` | `0` | Page number |
| `size` | `int` | `20` | Page size |

```bash
curl "http://localhost:8080/api/v1/flags?includeArchived=true" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Get Flag by ID

```http
GET /api/v1/flags/{id}
```

```bash
curl "http://localhost:8080/api/v1/flags/42" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Flags by Environment

```http
GET /api/v1/flags/by-environment
```

### Enriched Flags (Dashboard)

```http
GET /api/v1/flags/enriched
```

Returns flags with associated segments, tags, contexts, and environments.

### Update Flag

```http
PUT /api/v1/flags/{id}
```

```bash
curl -X PUT "http://localhost:8080/api/v1/flags/42" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Checkout v2",
    "description": "Updated description",
    "tags": ["checkout", "ui-redesign", "v2"]
  }'
```

### Update Flag Strategies

```http
PUT /api/v1/flags/{flagId}/strategies
```

Configure strategy for an environment:

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

### Archive Flag

```http
POST /api/v1/flags/{id}/archive
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/42/archive" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Unarchive Flag

```http
POST /api/v1/flags/{id}/unarchive
```

```bash
curl -X POST "http://localhost:8080/api/v1/flags/42/unarchive" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Segments

### Create Segment

```http
POST /api/v1/segments
```

```bash
curl -X POST "http://localhost:8080/api/v1/segments" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beta Testers",
    "description": "Users with beta- prefix",
    "projectId": 1
  }'
```

### List All Segments

```http
GET /api/v1/segments
```

```bash
curl "http://localhost:8080/api/v1/segments" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Get Segment by ID

```http
GET /api/v1/segments/{id}
```

### Update Segment

```http
PUT /api/v1/segments/{id}
```

### Delete Segment

```http
DELETE /api/v1/segments/{id}
```

## Environments

### Create Environment

```http
POST /api/v1/environments
```

```bash
curl -X POST "http://localhost:8080/api/v1/environments" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staging",
    "projectId": 1
  }'
```

### List All Environments

```http
GET /api/v1/environments
```

### Get Environment by ID

```http
GET /api/v1/environments/{id}
```

### Update Environment

```http
PUT /api/v1/environments/{id}
```

### Delete Environment

```http
DELETE /api/v1/environments/{id}
```

> **Warning:** You cannot delete an environment with active API keys. Revoke all keys for the environment first.

## API Keys

### Create API Key

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
    "environmentId": 3,
    "projectId": 1
  }'
```

Response:

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

> **Warning:** The key value (`apiKey`) is shown **only once** on creation. Save it immediately.

### List All API Keys

```http
GET /api/v1/api-keys
```

### Update API Key

```http
PUT /api/v1/api-keys/{id}
```

### Delete API Key

```http
DELETE /api/v1/api-keys/{id}
```

## Audit

### Get Audit Records

```http
GET /api/v1/audit
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `int` | `0` | Page number |
| `size` | `int` | `20` | Page size |
| `dateFrom` | `datetime` | — | Start of period (ISO 8601) |
| `dateTo` | `datetime` | — | End of period (ISO 8601) |

```bash
curl "http://localhost:8080/api/v1/audit?dateFrom=2026-06-14T00:00:00Z&dateTo=2026-06-21T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## SDK

### Get Feature Flags

```http
GET /api/client/features
```

Used by SDKs on initialization. Returns all flag rules for the environment bound to the API key. Supports ETag / If-None-Match for efficient caching.

```bash
curl "http://localhost:8080/api/client/features" \
  -H "Authorization: Bearer <api-key>"
```

### Evaluate Flags (Client-side)

```http
POST /api/client/evaluate
```

Evaluates flags server-side for the given context (`mode: 'client'`).

```bash
curl -X POST "http://localhost:8080/api/client/evaluate" \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"context": {"userId": "user-123", "country": "US"}}'
```

### Submit Metrics

```http
POST /api/client/metrics
```

Sends accumulated SDK usage metrics.

```bash
curl -X POST "http://localhost:8080/api/client/metrics" \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"metrics": [{"flagKey": "new-checkout", "trueCount": 150, "falseCount": 50}]}'
```

## Integrations

### Create Integration

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

### List All Integrations

```http
GET /api/v1/integrations
```

### Update Integration

```http
PUT /api/v1/integrations/{id}
```

### Delete Integration

```http
DELETE /api/v1/integrations/{id}
```

### Check Webhook Quota

```http
GET /api/v1/integrations/webhook-limit
```

## Users

### Invite User

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

| Role | Description |
|------|-------------|
| `ADMIN` | Full access to all resources |
| `DEVELOPER` | Flag, segment, and strategy management |
| `VIEWER` | Read-only access |

### List All Users

```http
GET /api/v1/users
```

### Get User

```http
GET /api/v1/users/{id}
```

### Update User

```http
PUT /api/v1/users/{id}
```

### Delete User

```http
DELETE /api/v1/users/{id}
```

## Tags

### Create Tag

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

### List All Tags

```http
GET /api/v1/tags
```

### Get Tag by ID

```http
GET /api/v1/tags/{id}
```

### Update Tag

```http
PUT /api/v1/tags/{id}
```

### Delete Tag

```http
DELETE /api/v1/tags/{id}
```

## Contexts

### Create Context Definition

```http
POST /api/v1/contexts
```

### List All Contexts

```http
GET /api/v1/contexts
```

### Get Context by ID

```http
GET /api/v1/contexts/{definitionId}
```

### Update Context

```http
PUT /api/v1/contexts/{definitionId}
```

### Delete Context

```http
DELETE /api/v1/contexts/{definitionId}
```

### Context Values

```http
GET    /api/v1/contexts/{definitionId}/values
POST   /api/v1/contexts/{definitionId}/values
PUT    /api/v1/contexts/{definitionId}/values
GET    /api/v1/contexts/values/{valueId}
PUT    /api/v1/contexts/values/{valueId}
DELETE /api/v1/contexts/values/{valueId}
```

## Metrics

### Flag Metrics

```http
GET /api/v1/flags/{flagId}/metrics
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `environmentId` | `long` | Environment ID |
| `instanceId` | `string` | SDK instance ID |
| `appName` | `string` | Application name |

### Project Metrics

```http
GET /api/v1/metrics
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `environmentId` | `long` | Environment ID |

## Project Settings

### Get Settings

```http
GET /api/v1/settings
```

### Update Settings

```http
PUT /api/v1/settings
```

## Projects

### List All Projects

```http
GET /api/v1/projects
```

### Get Project by ID

```http
GET /api/v1/projects/{id}
```

### Create Project

```http
POST /api/v1/projects
```

### Update Project

```http
PUT /api/v1/projects/{id}
```

### Delete Project

```http
DELETE /api/v1/projects/{id}
```

### SDK Client Instances

```http
GET /api/v1/projects/{id}/client-instances
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `environmentId` | `long` | Environment ID |

## API Error Codes

| HTTP Code | Error Code | Description |
|-----------|-----------|-------------|
| `400` | `BAD_REQUEST` | Invalid request parameters |
| `400` | `VALIDATION_ERROR` | Request body validation error |
| `401` | `UNAUTHORIZED` | Missing or invalid token/key |
| `401` | `INVALID_CREDENTIALS` | Wrong email or password |
| `401` | `TOKEN_REUSE` | Reused refresh token detected |
| `402` | `QUOTA_EXCEEDED` | Resource quota exceeded |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Resource already exists |
| `429` | `RATE_LIMIT_EXCEEDED` | Request rate limit exceeded |
| `500` | `INTERNAL_ERROR` | Internal server error |

## Swagger UI and OpenAPI

| Resource | URL |
|----------|-----|
| **Swagger UI** | [`/swagger-ui.html`](http://localhost:8080/swagger-ui.html) |
| **OpenAPI 3.1 JSON** | [`/v3/api-docs`](http://localhost:8080/v3/api-docs) |
| **OpenAPI 3.1 YAML** | [`/v3/api-docs.yaml`](http://localhost:8080/v3/api-docs.yaml) |

## Complete Flag Lifecycle via API

```bash
#!/bin/bash
BASE="http://localhost:8080/api/v1"
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 1. Create flag
curl -s -X POST "$BASE/flags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "my-feature", "name": "My Feature", "flagType": "RELEASE", "projectId": 1}'

# 2. Configure strategy: 1% rollout
curl -s -X PUT "$BASE/flags/42/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": 3, "enabled": true, "percentage": 1}'

# 3. Increase to 50%
curl -s -X PUT "$BASE/flags/42/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": 3, "enabled": true, "percentage": 50}'

# 4. Enable for all (100%)
curl -s -X PUT "$BASE/flags/42/strategies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environmentId": 3, "enabled": true, "percentage": 100}'

# 5. Archive
curl -s -X POST "$BASE/flags/42/archive" \
  -H "Authorization: Bearer $TOKEN"

# 6. Check audit
curl -s "$BASE/audit?dateFrom=2026-01-01T00:00:00Z" \
  -H "Authorization: Bearer $TOKEN"
```

## Related Pages

- [API Overview](/en/api/overview) — authentication, format, limits
- [Integrations](/en/guide/integrations) — webhook integrations, CI/CD
- [SDK Overview](/en/sdk/overview) — how SDK uses the API
- [Swagger UI](http://localhost:8080/swagger-ui.html) — interactive documentation
