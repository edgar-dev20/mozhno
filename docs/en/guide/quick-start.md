# Quick Start

Get **можно.** running in 5 minutes with Docker Compose.

## Step 1: Create docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: feature_flags
      POSTGRES_USER: flags_user
      POSTGRES_PASSWORD: flags_password
    volumes:
      - pgdata:/var/lib/postgresql/data

  mozhno:
    image: ghcr.io/edgar-dev20/mozhno:latest
    ports:
      - '8080:8080'
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/feature_flags
      SPRING_DATASOURCE_USERNAME: flags_user
      SPRING_DATASOURCE_PASSWORD: flags_password
      JWT_SECRET: change-me-to-a-real-256-bit-secret
    depends_on:
      - postgres

volumes:
  pgdata:
```

## Step 2: Start the server

```bash
docker compose up -d
```

## Step 3: Open the web dashboard

Navigate to [`http://localhost:8080`](http://localhost:8080).

On first run, you'll be prompted to create a project and admin user.

## Step 4: Create your first flag

1. In the dashboard, click **"Create Flag"**
2. Enter a flag key, e.g. `new-checkout`
3. Choose type: **Boolean** (on/off)
4. Choose strategy: **Default** (standard rollout)
5. Click **"Save"**

## Step 5: Add the flag to your code

### Java

```java
var client = MozhnoClient.builder()
    .serverUrl("http://localhost:8080")
    .apiKey("your-api-key")  // API key from «API Keys» in the dashboard
    .build();

var ctx = new EvaluationContext().set("userId", "user-123");
boolean isEnabled = client.isFlagEnabled("new-checkout", ctx);

if (isEnabled) {
    // new code
} else {
    // old code
}
```

### JavaScript / TypeScript

```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  serverUrl: 'http://localhost:8080',
  apiKey: 'your-api-key',
});

const enabled = await client.isEnabled('new-checkout', { userId: 'user-123' });

if (enabled) {
  // new code
} else {
  // old code
}
```

## What's Next?

- [Installation](/en/guide/installation) — manual setup and production configuration
- [Configuration](/en/guide/configuration) — all environment variables
- [Flags](/en/concepts/flags) — learn about flag types and rules
