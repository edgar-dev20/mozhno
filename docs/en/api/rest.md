# REST API Reference

Complete reference for the можно REST API. All endpoints are prefixed with `/api`.

For interactive documentation, visit the Swagger UI at `/swagger-ui.html`. The OpenAPI 3.1 specification is available at `/v3/api-docs`.

## Authentication

Include your JWT or API key in the `Authorization` header for every request. See [API Overview](./overview.md#authentication) for details.

```bash
# Environment variable used throughout this document
export MOZHNO_URL="https://your-instance"
export MOZHNO_TOKEN="mz_sk_production_abc123"
```

## Flags

### List All Flags

```bash
GET /api/v1/flags
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | `0` | Page number (zero-indexed) |
| `size` | Integer | `20` | Items per page (max: 100) |
| `state` | String | — | Filter: `ACTIVE`, `PAUSED`, `DRAFT`, `ARCHIVED` |
| `tags` | String | — | Comma-separated tags filter |
| `search` | String | — | Search by key or name |

```bash
curl "$MOZHNO_URL/api/v1/flags?state=ACTIVE&tags=team:checkout&page=0&size=10" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

**Response:**

```json
{
  "items": [
    {
      "key": "checkout_v2",
      "name": "Checkout Redesign v2",
      "description": "New checkout flow",
      "type": "BOOLEAN",
      "defaultValue": false,
      "state": "ACTIVE",
      "tags": ["team:checkout", "type:feature"],
      "rolloutPercentage": 25,
      "targetingRules": [],
      "createdAt": "2026-06-01T10:00:00Z",
      "updatedAt": "2026-06-15T14:30:00Z",
      "createdBy": "alice@example.com"
    }
  ],
  "page": 0,
  "size": 10,
  "totalItems": 1,
  "totalPages": 1
}
```

### Get a Single Flag

```bash
GET /api/v1/flags/{flagKey}
```

```bash
curl "$MOZHNO_URL/api/v1/flags/checkout_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

### Create a Flag

```bash
POST /api/v1/flags
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | String | Yes | Unique identifier (immutable). Use `snake_case`. |
| `name` | String | Yes | Human-readable name |
| `description` | String | No | Flag purpose and behaviour details |
| `type` | String | Yes | `BOOLEAN` or `STRING` |
| `defaultValue` | Boolean/String | Yes | Value returned when no rules match |
| `tags` | String[] | No | List of tags for organisation |

```bash
curl -X POST "$MOZHNO_URL/api/v1/flags" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
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

**Response:** `201 Created` with the full flag object.

### Update a Flag

```bash
PUT /api/v1/flags/{flagKey}
```

Replaces the entire flag configuration. All fields except `key` are writable.

```bash
curl -X PUT "$MOZHNO_URL/api/v1/flags/checkout_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Checkout Redesign v2",
    "description": "Updated description",
    "type": "BOOLEAN",
    "defaultValue": false,
    "state": "ACTIVE",
    "tags": ["team:checkout", "type:feature"],
    "rolloutPercentage": 50,
    "rolloutAttribute": "userId",
    "targetingRules": [
      {
        "priority": 1,
        "conditions": [
          {
            "attribute": "country",
            "operator": "EQUALS",
            "value": "DE"
          }
        ],
        "targetValue": true
      }
    ]
  }'
```

### Patch a Flag (Partial Update)

```bash
PATCH /api/v1/flags/{flagKey}
```

Update specific fields without sending the full object. Useful for toggling state or adjusting rollout.

```bash
# Change rollout percentage only
curl -X PATCH "$MOZHNO_URL/api/v1/flags/checkout_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rolloutPercentage": 75}'

# Pause a flag
curl -X PATCH "$MOZHNO_URL/api/v1/flags/checkout_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state": "PAUSED"}'

# Resume a flag
curl -X PATCH "$MOZHNO_URL/api/v1/flags/checkout_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state": "ACTIVE"}'
```

### Archive a Flag

```bash
POST /api/v1/flags/{flagKey}/archive
```

```bash
curl -X POST "$MOZHNO_URL/api/v1/flags/checkout_v2/archive" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

**Response:** `200 OK` — flag state changed to `ARCHIVED`.

### Restore a Flag

```bash
POST /api/v1/flags/{flagKey}/restore
```

```bash
curl -X POST "$MOZHNO_URL/api/v1/flags/checkout_v2/restore" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

**Response:** `200 OK` — flag state changed to `ACTIVE`.

### Delete a Flag

```bash
DELETE /api/v1/flags/{flagKey}
```

```bash
curl -X DELETE "$MOZHNO_URL/api/v1/flags/checkout_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

**Response:** `204 No Content`

> **Warning:** Deletion is permanent and irreversible. The flag key should not be referenced in any application code. Consider archiving instead.

### Targeting Rules Schema

Targeting rules are an ordered array. The first rule whose conditions all match determines the returned value.

```json
{
  "targetingRules": [
    {
      "priority": 1,
      "conditions": [
        {
          "attribute": "country",
          "operator": "EQUALS",
          "value": "DE"
        },
        {
          "attribute": "plan",
          "operator": "IN",
          "values": ["pro", "enterprise"]
        }
      ],
      "targetValue": true
    },
    {
      "priority": 2,
      "conditions": [
        {
          "attribute": "beta",
          "operator": "EQUALS",
          "value": "true"
        }
      ],
      "targetValue": true
    }
  ]
}
```

**Condition Operators:** `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `IN`, `NOT_IN`, `REGEX`, `GREATER_THAN`, `LESS_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN_OR_EQUAL`, `EXISTS`, `NOT_EXISTS`, `IN_SEGMENT`

## Segments

### List Segments

```bash
GET /api/v1/segments
```

```bash
curl "$MOZHNO_URL/api/v1/segments" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

### Create a Segment

```bash
POST /api/v1/segments
```

```bash
curl -X POST "$MOZHNO_URL/api/v1/segments" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "beta_testers",
    "description": "Users enrolled in the beta programme",
    "conditions": [
      {
        "attribute": "beta",
        "operator": "EQUALS",
        "value": "true"
      }
    ]
  }'
```

### Update a Segment

```bash
PUT /api/v1/segments/{segmentName}
```

### Delete a Segment

```bash
DELETE /api/v1/segments/{segmentName}
```

## Environments

### List Environments

```bash
GET /api/v1/environments
```

```bash
curl "$MOZHNO_URL/api/v1/environments" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

**Response:**

```json
{
  "items": [
    {
      "id": "env-001",
      "name": "Production",
      "key": "production",
      "description": "Production environment",
      "createdAt": "2026-01-01T00:00:00Z"
    },
    {
      "id": "env-002",
      "name": "Staging",
      "key": "staging",
      "description": "Pre-production staging environment",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Create an Environment

```bash
POST /api/v1/environments
```

```bash
curl -X POST "$MOZHNO_URL/api/v1/environments" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development",
    "key": "development",
    "description": "Local development environment"
  }'
```

## API Keys

### List API Keys

```bash
GET /api/v1/api-keys
```

```bash
curl "$MOZHNO_URL/api/v1/api-keys" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

### Create an API Key

```bash
POST /api/v1/api-keys
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Human-readable key name |
| `environmentId` | String | Yes | Environment this key belongs to |
| `scopes` | String[] | Yes | Permissions: `flags:read`, `flags:write`, `segments:read`, `segments:write`, `admin` |

```bash
curl -X POST "$MOZHNO_URL/api/v1/api-keys" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production SDK",
    "environmentId": "env-001",
    "scopes": ["flags:read", "segments:read"]
  }'
```

**Response:**

```json
{
  "id": "key-001",
  "name": "Production SDK",
  "key": "mz_sk_production_x1y2z3a4b5c6d7e8f9",
  "environmentId": "env-001",
  "scopes": ["flags:read", "segments:read"],
  "createdAt": "2026-06-21T10:00:00Z"
}
```

> **Warning:** The full API key value (`mz_sk_...`) is returned **only once** at creation time. Store it securely — it cannot be retrieved later.

### Revoke an API Key

```bash
DELETE /api/v1/api-keys/{keyId}
```

```bash
curl -X DELETE "$MOZHNO_URL/api/v1/api-keys/key-001" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

**Response:** `204 No Content`

## Audit Log

### List Audit Entries

```bash
GET /api/v1/audit
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | `0` | Page number |
| `size` | Integer | `20` | Items per page |
| `resourceType` | String | — | `FLAG`, `SEGMENT`, `API_KEY`, `ENVIRONMENT` |
| `resourceId` | String | — | Flag key or segment name |
| `action` | String | — | `CREATED`, `UPDATED`, `DELETED`, `ARCHIVED`, `RESTORED`, `PAUSED`, `RESUMED` |
| `actor` | String | — | User email |
| `from` | ISO 8601 | — | Start of date range |
| `to` | ISO 8601 | — | End of date range |

```bash
curl "$MOZHNO_URL/api/v1/audit?resourceType=FLAG&resourceId=checkout_v2&from=2026-06-01T00:00:00Z" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

### Export Audit Data

```bash
GET /api/v1/audit/export
```

Accepts the same filtering parameters as the list endpoint. Returns CSV by default.

```bash
curl "$MOZHNO_URL/api/v1/audit/export?resourceType=FLAG&from=2026-06-01T00:00:00Z&to=2026-07-01T00:00:00Z" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Accept: text/csv" \
  -o audit_june_2026.csv
```

## SDK Rules Endpoint

Used internally by SDKs to fetch flag rules for local evaluation:

```bash
GET /api/v1/sdk/rules
```

```bash
curl "$MOZHNO_URL/api/v1/sdk/rules" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

This endpoint returns all flags and segments for the environment associated with the API key. SDKs call this on initialisation and during background polling.

## Webhooks

### List Webhooks

```bash
GET /api/v1/webhooks
```

### Create a Webhook

```bash
POST /api/v1/webhooks
```

```bash
curl -X POST "$MOZHNO_URL/api/v1/webhooks" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-service.example.com/webhooks/mozhno",
    "secret": "whsec_your_shared_secret",
    "events": ["flag.updated", "flag.archived", "audit.entry.created"],
    "active": true
  }'
```

### Delete a Webhook

```bash
DELETE /api/v1/webhooks/{webhookId}
```

## Health Check

```bash
GET /api/v1/health
```

```bash
curl "$MOZHNO_URL/api/v1/health"
```

**Response:**

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

## Common Workflows

### Create, Rollout, and Archive a Flag (Full Lifecycle)

```bash
# 1. Create a draft flag
curl -X POST "$MOZHNO_URL/api/v1/flags" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "dark_mode_v2",
    "name": "Dark Mode v2",
    "type": "BOOLEAN",
    "defaultValue": false,
    "tags": ["team:ui", "type:feature"]
  }'

# 2. Add targeting rule for internal team
curl -X PATCH "$MOZHNO_URL/api/v1/flags/dark_mode_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "ACTIVE",
    "targetingRules": [
      {
        "priority": 1,
        "conditions": [
          {"attribute": "email", "operator": "CONTAINS", "value": "@company.com"}
        ],
        "targetValue": true
      }
    ]
  }'

# 3. Start 10% rollout to external users
curl -X PATCH "$MOZHNO_URL/api/v1/flags/dark_mode_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rolloutPercentage": 10, "rolloutAttribute": "userId"}'

# 4. Increase to 50%
curl -X PATCH "$MOZHNO_URL/api/v1/flags/dark_mode_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rolloutPercentage": 50}'

# 5. Full rollout
curl -X PATCH "$MOZHNO_URL/api/v1/flags/dark_mode_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rolloutPercentage": 100}'

# 6. Remove targeting rules, rely on default
curl -X PUT "$MOZHNO_URL/api/v1/flags/dark_mode_v2" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dark Mode v2",
    "type": "BOOLEAN",
    "defaultValue": true,
    "state": "ACTIVE",
    "tags": ["team:ui", "type:feature"],
    "rolloutPercentage": 0,
    "targetingRules": []
  }'

# 7. Archive after code cleanup
curl -X POST "$MOZHNO_URL/api/v1/flags/dark_mode_v2/archive" \
  -H "Authorization: Bearer $MOZHNO_TOKEN"
```

### Emergency Kill Switch

```bash
# Pause flags by tag (all payment-service flags)
PAYMENT_FLAGS=$(curl -s "$MOZHNO_URL/api/v1/flags?state=ACTIVE&tags=service:payments" \
  -H "Authorization: Bearer $MOZHNO_TOKEN" | jq -r '.items[].key')

for flag in $PAYMENT_FLAGS; do
  curl -X PATCH "$MOZHNO_URL/api/v1/flags/$flag" \
    -H "Authorization: Bearer $MOZHNO_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"state": "PAUSED"}'
  echo "Paused: $flag"
done
```

## API Documentation

- **Swagger UI:** `https://your-instance/swagger-ui.html`
- **OpenAPI 3.1 Spec:** `https://your-instance/v3/api-docs`

## Next Steps

- [API Overview](./overview.md) — Authentication, rate limiting, and base URL structure.
- [Webhooks](../guide/integrations.md) — Push-based event notifications.
- [SDK Overview](../sdk/overview.md) — How SDKs consume the REST API.
