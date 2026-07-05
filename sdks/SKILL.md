---
name: mozhno-sdks
description: Reference for the Mozhno client SDKs under /sdks — the Java SDK (`sdks/java`, published as `dev.mozhno:mozhno-client-java`) and the JS/TS SDK (`sdks/js`, published as `@mozhno/client-js`). Use when editing SDK code: client lifecycle, local flag evaluation, context/constraint/segment evaluation, polling + metrics batching, and the Spring Boot starter.
license: MIT
metadata:
  domain: sdk
  role: specialist
  scope: implementation
  triggers: Mozhno SDK, client-java, client-js, feature flag client, local evaluation, ConstraintEvaluator, MozhnoClient
---

# Mozhno SDKs

Client SDKs that let apps evaluate feature flags. Layout:

| Package | Path | Published as | Runtime |
|---------|------|--------------|---------|
| Java SDK | `sdks/java` | `dev.mozhno:mozhno-client-java` (Gradle `:mozhno-client-java`) | **JDK 17+** (consumer-facing; not JDK 25) |
| JS/TS SDK | `sdks/js` | `@mozhno/client-js` (ESM + CJS) | Browser + Node |
| Design tokens | `sdks/design-tokens` | shared token package | — |

## Core principle (both SDKs)

**Evaluate locally, fail-closed.** The client fetches flag *rules* once and re-polls on an
interval; each `isEnabled(...)` check is a local, in-memory decision — **no network call per
check**. Metrics are buffered and sent in batches. When a flag is missing or the fetch fails,
the SDK returns `false` / the caller's default (fail-closed) rather than throwing.

Both SDKs support two modes:
- **server mode** (default): fetch the full flag set and evaluate locally against the context.
- **client mode**: the server evaluates and returns ready toggles; the SDK just serves them.

---

## Java SDK (`sdks/java`)

- **JDK 17** source/target (broad consumer compatibility — do **not** raise to 25). Deps kept
  minimal: `jackson-databind`, `slf4j-api`; Spring is `compileOnly`. Version in `build.gradle`.
- **`MozhnoClient`** interface (fail-closed semantics documented in Javadoc):
  ```java
  void start();
  void stop();
  boolean isEnabled(String flagKey);                                   // false if not found
  boolean isEnabled(String flagKey, boolean defaultReturn);            // custom default
  boolean isEnabled(String flagKey, MozhnoContext context);            // false if not found
  boolean isEnabled(String flagKey, MozhnoContext context, boolean defaultReturn);
  void addEventListener(EventListener listener);
  ```
- **`DefaultMozhnoClient`** — production impl; **`FakeMozhnoClient`** — in-memory impl for
  consumer tests (no HTTP). Use the interface in application code.
- **`MozhnoConfig.builder()`** fields: `appName`, `instanceId`, `mozhnoUrl`, `apiKey`,
  `contextProvider`, `fetchTogglesInterval` (default 15s), `sendMetricsInterval` (default 60s),
  `synchronousFetchOnInitialisation` (false), `disableMetrics` (false), `environment`, `proxy`.
- **`MozhnoContext.builder()`** — `userId`, custom fields; supplied per call or via
  `MozhnoContextProvider`.
- **`ConstraintEvaluator`** — local evaluation engine: combines `constraints` + `segments` from
  a flag's `Activation` (fail-closed if evaluation fails). Keep its logic in lock-step with the
  server engine and the JS `evaluator`.
- **`HttpFeatureFetcher`** — polls the server for flag rules / posts metrics (Jackson).
- **Spring Boot starter**: `spring/MozhnoAutoConfiguration` + `MozhnoProperties`
  (`@ConfigurationProperties`) auto-wire a `MozhnoClient` from properties. Spring is optional
  (`compileOnly`) — the SDK must work without Spring on the classpath.
- Build/test: `./gradlew :mozhno-client-java:check` (or `make java-sdk-test`). Tests use JUnit 5
  + Mockito; see `ConstraintEvaluatorTest`, `FakeMozhnoClientTest`, `MozhnoConfigTest`.

Usage (see root `README.md`):
```java
var config = MozhnoConfig.builder()
    .appName("my-app").instanceId("instance-1")
    .mozhnoUrl("https://flags.example.com").apiKey("env-abc123").build();
var client = new DefaultMozhnoClient(config);
client.start();
boolean on = client.isEnabled("new-checkout", MozhnoContext.builder().userId("42").build());
```

---

## JS/TS SDK (`sdks/js`)

- **`@mozhno/client-js`**, `type: module`, built with **Vite** to ESM (`.mjs`) + CJS (`.cjs`)
  + `.d.ts`. Tests: **Vitest**; lint: ESLint; format: Prettier.
- **`MozhnoClient extends EventEmitter`** — public API:
  ```ts
  await client.start();                 // bootstrap + initial fetch + start timers
  client.stop();                        // clear timers
  client.isEnabled(flagKey, context?)   // local decision; false if missing (fail-closed)
  client.getVariant(flagKey)            // server-mode only
  client.updateContext(ctx) / client.setContextField(k, v) / client.removeContextField(k)
  ```
- **Config** (`MozhnoConfig`): `url`, `apiKey`, `appName`, `environment` ('default'),
  `instanceId`, `refreshInterval` (15s), `metricsInterval` (60s), `disableMetrics`, `mode`
  ('server' | 'client'), `bootstrap` (seed flags), `storageProvider`, `stickyAnonId` (true),
  `context`.
- **Events** (emit): `initialized`, `update`, `ready`, `error`, `warn`, `sent`.
- **Targeting key** = `userId ?? sessionId ?? anonId` (sticky anon id persisted in
  `localStorage` when `stickyAnonId` is on; warns once if none present).
- **Metrics**: buffered as `{ t, f }` counts per flag, flushed each `metricsInterval`; on send
  failure the batch is merged back (no loss). Fetch/evaluate use retry backoff `[1s, 2s, 4s]`.
- **Public exports** (`src/index.ts`): `MozhnoClient`, `isFlagEnabled`, `EventEmitter`,
  `HttpFetcher`, `createDefaultStorage`, and the type exports. Keep new public API additions in
  `index.ts`; `isFlagEnabled` (`evaluation/evaluator.ts`) is the shared evaluation function —
  keep it aligned with the Java `ConstraintEvaluator` and the server engine.
- Structure: `MozhnoClient.ts`, `types.ts`, `events.ts`, `evaluation/evaluator.ts`,
  `transport/fetcher.ts`, `repository/storage.ts`.
- Build/test: `npm test` / `npm run build` in `sdks/js` (or `make js-sdk-test`,
  `make js-sdk-build`).

Usage:
```ts
import { MozhnoClient } from '@mozhno/client-js';
const client = new MozhnoClient({ url: 'https://flags.example.com', apiKey: 'env-abc123', appName: 'my-app' });
await client.start();
const on = client.isEnabled('new-checkout', { userId: '42' });
```

---

## Cross-SDK invariants

- **Never break fail-closed behavior** — a missing flag or a failed fetch must return
  `false` / the provided default, never throw out of `isEnabled`.
- **No per-check network I/O** — evaluation stays in-memory; only polling and metrics touch the
  network.
- **Keep the three evaluators in sync** — server engine (`mozhno-core` `flags/strategy`), Java
  `ConstraintEvaluator`, and JS `isFlagEnabled` must agree on constraint/segment/rollout
  semantics. A change to targeting logic usually needs matching edits in all three.
- **No deprecated APIs** — target the versions each SDK pins (Java: JDK 17, Jackson/SLF4J from
  the Boot BOM; JS: the versions in `sdks/js/package.json`); never call `@Deprecated` /
  `@deprecated` symbols — use the documented replacement.
- License: BUSL-1.1 (source-available); keep the SDKs dependency-light.
