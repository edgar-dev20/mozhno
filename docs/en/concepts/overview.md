# Overview

**можно.** is an open-core feature flag management platform. This page gives a high-level overview of all core concepts and how they fit together.

## Core Concepts

### Flags

A **flag** (feature toggle) controls whether a feature is enabled or disabled for a given request. Two types:

- **RELEASE** — standard flag for gradual rollout of new features
- **KILLSWITCH** — emergency switch to instantly disable functionality

Flags are evaluated in real time by the SDK using locally cached rules — no network calls on the hot path.

See [Flags](/en/concepts/flags).

### Strategies

A **strategy** defines *how* a flag behaves on a specific environment. Each strategy includes:

- **Enabled/disabled** state for that environment
- **Context** — set of constraints (field/operator/values rules) the user must match
- **Segments** — reusable user groups to target
- **Percentage rollout** — deterministic hash-based distribution

Evaluation logic: constraints (AND) → segments (OR) → percentage rollout. First match wins.

See [Strategies](/en/concepts/strategies).

### Segments

A **segment** is a reusable group of users defined by matching rules (contexts). Instead of repeating the same targeting conditions across multiple flags, you define a segment once and reference it from any flag.

Examples: "beta testers" (users with `beta: true`), "EU users" (users where `country` is in a list of EU country codes), "internal employees" (users with email ending in `@company.com`).

See [Segments](/en/concepts/segments).

### Contexts

**Contexts** define attribute-based rules for targeting. Operands include `in`, `not_in`, `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `contains`. Context types (`string`, `number`, `time`, `semver`) control comparison behavior.

Evaluation happens **locally** in the SDK with no network call. Rules are fetched in the background and cached.

```java
MozhnoContext ctx = MozhnoContext.builder()
    .userId("user-123")
    .addProperty("country", "DE")
    .addProperty("plan", "enterprise")
    .build();
```

```typescript
const ctx = {
  userId: 'user-123',
  country: 'DE',
  plan: 'enterprise',
};
```

### Environments

An **environment** is an isolated namespace for flag configuration — typically `dev`, `staging`, and `production`. Each environment has:

- Its own set of strategy configurations (a flag can be on in dev but off in prod)
- Its own API keys with granular permissions
- Independent targeting rules

See [Environments](/en/concepts/environments).

### API Keys

**API keys** authenticate SDKs and external services with the server. Keys are scoped to a single environment. Two types:

- **SERVER** — read/write access for backend SDKs
- **FRONTEND** — read-only access for browser-based SDKs

Create and manage API keys from the web dashboard.

### Audit Log

Every change to flags, segments, strategies, environments, and API keys is recorded in an immutable **audit log**. Each entry includes:

- The user who made the change
- What was changed (field-level diff)
- Timestamp of the change
- The environment where the change was applied

The audit log is accessible from the web dashboard and via the REST API.

## Module Architecture

**можно.** is organized as a multi-module Gradle project:

| Module | Purpose |
|--------|---------|
| `mozhno-spi` | Service Provider Interface — extension points for enterprise plugins |
| `mozhno-core` | Core business logic: flag evaluation, segment matching, strategy engine |
| `mozhno-web-api` | REST controllers, DTOs, request/response mapping |
| `mozhno-app` | Spring Boot application entry point, auto-configuration, Flyway migrations |

Server — Spring Boot 4.0 / JDK 25. Web UI — React 19 SPA (Vite, Tailwind CSS 4, Radix UI). SDKs fetch flag rules once and evaluate locally.

## Related Pages

- [Flags](/en/concepts/flags) — flag types, rules, and lifecycle
- [Segments](/en/concepts/segments) — reusable user groups
- [Strategies](/en/concepts/strategies) — rollout strategies and chaining
- [Environments](/en/concepts/environments) — environment isolation and API keys
