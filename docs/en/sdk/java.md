# Java SDK

The можно Java SDK provides local evaluation of feature flags on the JVM. Compatible with JDK 17+, supports synchronous evaluation, and integrates with Spring Boot via auto-configuration.

## Installation

### Gradle (Kotlin DSL)

```kotlin
repositories {
    mavenCentral()
}

dependencies {
    implementation("dev.mozhno:mozhno-client-java:1.0.1")
}
```

### Gradle (Groovy DSL)

```groovy
repositories {
    mavenCentral()
}

dependencies {
    implementation 'dev.mozhno:mozhno-client-java:1.0.1'
}
```

> **Tip:** Check the [GitHub releases page](https://github.com/mozhno-dev/mozhno/releases) for the latest version.

## Configuration

The SDK uses a **builder pattern** for client construction. Create a single client instance and reuse it across your application:

```java
import dev.mozhno.sdk.MozhnoClient;
import dev.mozhno.sdk.MozhnoConfig;
import dev.mozhno.sdk.MozhnoContext;
import dev.mozhno.sdk.DefaultMozhnoClient;

MozhnoConfig config = MozhnoConfig.builder()
    .appName("my-app")
    .instanceId("instance-1")
    .mozhnoUrl("https://mozhno.example.com")
    .apiKey("<api-key>")
    .fetchTogglesInterval(15)
    .sendMetricsInterval(60)
    .environment("production")
    .build();

MozhnoClient client = new DefaultMozhnoClient(config);
client.start();
```

### Builder Options

| Method | Type | Default | Description |
|--------|------|---------|-------------|
| `appName(String)` | String | **Required** | Your application identifier |
| `instanceId(String)` | String | **Required** | Unique instance identifier |
| `mozhnoUrl(String)` | String | **Required** | Base URL of your можно instance |
| `apiKey(String)` | String | **Required** | API key for the target environment |
| `fetchTogglesInterval(int)` | int | `15 sec` | Polling interval |
| `sendMetricsInterval(int)` | int | `60 sec` | Metrics reporting interval |
| `environment(String)` | String | `null` | Environment name |
| `disableMetrics(boolean)` | boolean | `false` | Disable metrics reporting |
| `synchronousFetchOnInitialisation(boolean)` | boolean | `false` | Block on initial flag fetch |
| `contextProvider(MozhnoContextProvider)` | — | `null` | Custom context provider |

### Spring Boot Auto-Configuration

The SDK provides auto-configuration via `MozhnoAutoConfiguration`. Configure via `application.yml`:

```yaml
mozhno:
  url: https://mozhno.example.com
  api-key: <api-key>
  app-name: my-app
  instance-id: ${random.uuid}
  environment: production
  fetch-toggles-interval: 15
  send-metrics-interval: 60
```

The client is automatically created and available as a Spring bean:

```java
@Service
public class CheckoutService {

    private final MozhnoClient mozhnoClient;

    public CheckoutService(MozhnoClient mozhnoClient) {
        this.mozhnoClient = mozhnoClient;
    }

    public boolean isNewCheckoutEnabled(String userId) {
        MozhnoContext context = MozhnoContext.builder()
            .userId(userId)
            .addProperty("country", "DE")
            .build();
        return mozhnoClient.isEnabled("checkout_v2", context);
    }
}
```

## MozhnoContext

A builder-based context object for providing attributes at evaluation time.

```java
import dev.mozhno.sdk.MozhnoContext;

MozhnoContext context = MozhnoContext.builder()
    .userId("user-12345")
    .sessionId("session-abc")
    .addProperty("country", "DE")
    .addProperty("plan", "enterprise")
    .addProperty("appVersion", "2.4.1")
    .build();
```

All attribute values are strings. For numeric comparisons, set `contextType: number` in your targeting rules.

| Method | Description |
|--------|-------------|
| `userId(String)` | User ID (used for percentage rollout hashing) |
| `sessionId(String)` | Session ID (fallback for hashing) |
| `addProperty(String key, String value)` | Arbitrary attribute |

## Next Steps

- [SDK Overview](./overview.md) — Architecture and evaluation model.
- [JavaScript SDK](./javascript.md) — For Node.js and browser applications.
- [REST API](../api/rest.md) — Manage flags programmatically.
