# Overview

All key concepts in **можно.** form a unified system. Here's how they work together:

```mermaid
graph TD
    FLAG[Flag<br/>new-checkout]
    ENV1[dev<br/>strategy: 100%]
    ENV2[staging<br/>strategy: 50%]
    ENV3[production<br/>strategy: off]
    STRATEGY[Strategy]
    RULES[Constraint rules<br/>country = US AND plan = premium]
    SEGMENT[Segment<br/>"Beta Testers"]
    PCT[Percentage rollout<br/>25%]
    SDK[SDK]
    CTX[Context<br/>userId, country, plan]

    FLAG --> ENV1
    FLAG --> ENV2
    FLAG --> ENV3
    ENV3 --> STRATEGY
    STRATEGY --> RULES
    STRATEGY --> SEGMENT
    STRATEGY --> PCT
    SDK -->|evaluates| FLAG
    CTX -->|passes attributes| SDK
```

1. **Flag** — a toggle point in your code. The same flag (`new-checkout`) exists across all environments.
2. **Environment** (dev, staging, production) — each has its own independent strategy for the flag.
3. **Strategy** — a combination of constraint rules, segments, and percentage rollout. Determines who sees the feature.
4. **Context** — user attributes that the SDK passes when evaluating a flag.
5. **API key** — the key the SDK uses to fetch rules for a specific environment.

---

### Flags

A named toggle point in your code. Two types:

| Type | Code Pattern | Use For |
|------|-------------|---------|
| **RELEASE** | `if (isEnabled("flag")) { new code }` | Gradual rollout of new features |
| **KILLSWITCH** | `if (!isEnabled("kill-xxx")) { block }` | Instant emergency shutdown |

See [Flags](/en/concepts/flags).

### Strategies

Defines *how* a flag behaves on a specific environment. A strategy includes:

- **State** — enabled/disabled on this environment
- **Constraint rules** — conditions the user must match (AND logic)
- **Segments** — reusable user groups (OR logic between segments)
- **Percentage rollout** — deterministic distribution via MurmurHash32

See [Strategies](/en/concepts/strategies).

### Segments

A reusable **user group** defined by shared attributes. Instead of duplicating targeting rules across flags, define a segment once and reference it.

Examples: "US users", "Premium subscribers", "Beta testers".

See [Segments](/en/concepts/segments).

### Context

User or request attributes that the SDK passes when evaluating a flag:

```java
MozhnoContext ctx = MozhnoContext.builder()
    .userId("user-123")
    .addProperty("country", "US")
    .addProperty("plan", "premium")
    .build();
boolean enabled = client.isEnabled("new-checkout", ctx);
```

See [Targeting](/en/guide/targeting).

### Environments

Isolated namespaces for flags: **dev**, **staging**, **production**. Each environment has its own strategy configurations and API keys. A flag enabled in dev can be disabled in production.

See [Environments](/en/concepts/environments).

### API Keys

SDK authentication keys, bound to an environment and project. Two types: **SERVER** (backend SDKs) and **FRONTEND** (browser/mobile SDKs).

See [API Keys](/en/concepts/api-keys).

### Audit

All flag, segment, and strategy changes are recorded in an immutable audit log: who changed what and when.

See [Audit](/en/guide/audit).

## Related Pages

- [Flags](/en/concepts/flags) — flag types and lifecycle
- [Strategies](/en/concepts/strategies) — rollout mechanics
- [Environments](/en/concepts/environments) — dev / staging / production isolation
- [API Keys](/en/concepts/api-keys) — SDK access management
