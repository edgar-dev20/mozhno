# Integrations

можно supports **custom webhooks** — HTTP callbacks sent to your URL when system events occur.

## How It Works

When an event fires (flag created/updated/archived, segment modified, etc.), the server sends an HTTP POST to your configured URL. Dispatch is asynchronous, after the database transaction commits.

The request body is built from a template you define, with event variable substitution.

## Configuring a Webhook

### Dashboard

**Integrations** → **Connect**. Fields:

| Field | Description |
|-------|-------------|
| **Name** | Human-readable webhook name |
| **URL** | HTTPS endpoint to POST to |
| **Headers** | Custom HTTP headers (JSON object). Default: `Content-Type: application/json` |
| **Body** | Request body template. Uses event variable placeholders. Omit for body-less requests |
| **Events** | Which system events trigger the webhook |
| **Enabled** | Active / inactive toggle |

### REST API

```bash
curl -X POST "http://localhost:8080/api/v1/integrations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My webhook",
    "enabled": true,
    "type": "custom_webhook",
    "configJson": "{\"url\":\"https://my-server.example.com/hooks\",\"headers\":{\"Content-Type\":\"application/json\"},\"body\":\"{ \\\"event\\\": \\\"[[events.action]]\\\", \\\"resource\\\": \\\"[[events.resourceName]]\\\" }\"}",
    "eventSubscriptionsJson": "[\"flag.created\",\"flag.updated\",\"flag.archived\"]"
  }'
```

List:

```bash
curl "http://localhost:8080/api/v1/integrations" \
  -H "Authorization: Bearer $TOKEN"
```

Update:

```bash
curl -X PUT "http://localhost:8080/api/v1/integrations/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false, "name": "My webhook", "type": "custom_webhook", "configJson": "...", "eventSubscriptionsJson": "..."}'
```

Delete:

```bash
curl -X DELETE "http://localhost:8080/api/v1/integrations/1" \
  -H "Authorization: Bearer $TOKEN"
```

## Event Types

| Event | Trigger |
|-------|---------|
| `flag.created` | New flag created |
| `flag.updated` | Flag fields modified |
| `flag.archived` | Flag moved to archive |
| `flag.unarchived` | Flag restored from archive |
| `flag.deleted` | Flag deleted |
| `segment.created` | New segment created |
| `segment.updated` | Segment conditions modified |
| `segment.deleted` | Segment removed |
| `strategy.updated` | Flag strategy modified |
| `apikey.created` | API key created |
| `apikey.updated` | API key modified |
| `apikey.deleted` | API key deleted |
| `environment.created` | Environment created |
| `environment.updated` | Environment modified |
| `environment.deleted` | Environment removed |
| `project.updated` | Project settings changed |

## Body Template Variables

The body template supports the following event variables:

- `events.action` — Event code (e.g. flag.created)
- `events.resourceType` — Resource type (flag, segment, strategy, apikey, environment, project)
- `events.resourceId` — Resource ID (number)
- `events.resourceName` — Resource name/key
- `events.details` — Change details (text)
- `events.projectId` — Project ID
- `events.user.id` — User ID who made the change
- `events.user.name` — User name
- `events.user.email` — User email
- `events.timestamp` — Event time (ISO 8601)

Wrap them with double curly braces in your body template.

If writing JSON config for the API, use double square brackets to avoid escaping issues: `[[events.action]]`.

## Characteristics

- **HTTPS only** — URL must use HTTPS, no loopback/localhost
- **Timeout** — 30 seconds per request
- **Fire-and-forget** — no retries on failure. Last error stored in `lastError`
- **Async** — dispatch does not block the user request
- **Limits** — webhook count is limited (plan-dependent)

## Next Steps

- [REST API](../api/rest.md) — Full API documentation
- [Audit](./audit.md) — Change history
