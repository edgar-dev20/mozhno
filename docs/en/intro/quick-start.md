# Quick Start

Get **можно**<span class=brand-dot>.</span> running in 5 minutes with Docker Compose.

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
      MOZHNO_DB_URL: jdbc:postgresql://postgres:5432/feature_flags
      MOZHNO_DB_USERNAME: flags_user
      MOZHNO_DB_PASSWORD: flags_password
      MOZHNO_JWT_SECRET: change-me-to-a-real-256-bit-secret
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

## Step 4: Create the administrator and project

On first run, the onboarding wizard will open:

1. **Create the administrator** — enter an email and password. This is the first account with the ADMIN role.
2. **Create a project** — enter name, description, and optionally a logo.
3. **Create the first flag** — enter a key (e.g., `new-checkout`) and a name.

Once the wizard is complete, you'll be taken to the dashboard.

## Step 5: Get your API key

1. In the dashboard, go to **"API Keys"**
2. Click **"Create Key"**
3. Enter a name (e.g., `my-app`)
4. Select type **SERVER** and the **Production** environment
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


## What's Next?

- [Installation](/en/intro/installation) — manual setup and production configuration
- [Configuration](/en/intro/configuration) — all environment variables
- [Flags](/en/concepts/flags) — learn about flag types and rules