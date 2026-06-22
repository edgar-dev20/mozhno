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
    image: ghcr.io/mozhno-dev/mozhno:latest
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
3. Choose type: **RELEASE** (standard feature flag)
4. Choose strategy: enable the flag for the desired environment
5. Click **"Save"**

## Step 5: Get your API key

1. In the dashboard, go to **"API Keys"**
2. Click **"Create Key"**
3. Enter a name (e.g., `my-app`)
4. Select type **SERVER** and environment **production**
5. Copy the key value — it is shown only once

## Step 6: Add the flag to your code

### Java

Add the dependency to `build.gradle`:

```groovy
repositories { mavenCentral() }
dependencies { implementation 'dev.mozhno:mozhno-client-java:1.0.1' }
```

```java
import dev.mozhno.sdk.*;

var config = MozhnoConfig.builder()
    .appName("my-app")
    .instanceId("instance-1")
    .mozhnoUrl("http://localhost:8080")
    .apiKey("your-api-key")  // API key from «API Keys» in the dashboard
    .build();

var client = new DefaultMozhnoClient(config);
client.start();

var ctx = MozhnoContext.builder().userId("user-123").build();
boolean isEnabled = client.isEnabled("new-checkout", ctx);

if (isEnabled) {
    // new code
} else {
    // old code
}
```

### JavaScript / TypeScript

Install the package:

```bash
npm install @mozhno/client-js
```

```typescript
import { MozhnoClient } from '@mozhno/client-js';

const client = new MozhnoClient({
  url: 'http://localhost:8080',
  apiKey: 'your-api-key',
  appName: 'my-app',
});
await client.start();

const enabled = client.isEnabled('new-checkout', { userId: 'user-123' });

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
