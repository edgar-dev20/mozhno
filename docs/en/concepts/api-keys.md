# API Keys

An API key is how SDKs authenticate with the **можно**<span class=brand-dot>.</span> server. Each key is bound to a specific environment and project, determining which flags the client can access and what operations are allowed.

## Key Types

**можно**<span class=brand-dot>.</span> supports two types of API keys:

| Type | Permissions | Features | Use For |
|------|------------|----------|---------|
| **SERVER** | Read rules + write metrics | Receives full flag config, evaluates locally | Server-side SDKs (Java, Node.js backend) |
| **FRONTEND** | Evaluate flags + send metrics | Sends context to server, receives result | Browser and mobile SDKs |

### When to Use SERVER

- Backend services (Spring Boot, Express, Ktor)
- CI/CD pipelines
- Services where the API key is not exposed to the client

### When to Use FRONTEND

- Browser SPAs
- Mobile applications
- Clients where the key could be extracted from code

## Key Format

An API key is a 64-character Base64url string without a prefix:

```
dGhpcyBpcyBhIDY0LWNoYXJhY3RlciBiYXNlNjR1cmwgZW5jb2RlZCBrZXk
```

The key can be viewed in the API Keys section of the web dashboard at any time.

## Creating a Key

### In the Web Dashboard

1. Go to the **API Keys** section
2. Click **Create Key**
3. Enter a name (e.g., `backend-prod`, `mobile-staging`)
4. Select the type: `SERVER` or `FRONTEND`
5. Select an environment
6. Copy the key and store it securely

## Passing the Key to the SDK

```java
MozhnoConfig config = MozhnoConfig.builder()
    .mozhnoUrl("http://localhost:8080")
    .apiKey("your-api-key-here")
    .appName("my-app")
    .instanceId("instance-1")
    .environment("production")
    .build();
var client = new DefaultMozhnoClient(config);
```

## Key Revocation

Deleting a key via the dashboard or API (`DELETE /api/v1/api-keys/{id}`) immediately cuts off access for all clients using that key. The server returns `401` on all subsequent requests.

## Security

- Never commit keys to a repository — use a secrets manager or environment variables.
- Different keys for different environments: a dev key must not grant access to production.
- Least privilege: for SDK clients — SERVER or FRONTEND, not an admin JWT.
- Rotate keys at least once per year.

See [Security](/en/advanced/security) for details.

## Related Pages

- [Environments](/en/concepts/environments) — how keys relate to environments
- [API Keys](/en/concepts/api-keys) — key management
- [Security](/en/advanced/security) — JWT, rate limiting, CORS