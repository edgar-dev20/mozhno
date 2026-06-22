# Flags

A **flag** (feature toggle) is the central unit of configuration in **можно.**. It controls whether a feature is active for a given user or request.

## Flag Types

### RELEASE

Standard feature flag for gradual rollout of new functionality. Enabled for target audiences through targeting rules and percentage rollout.

```java
if (client.isEnabled("new-checkout")) {
    // show new checkout flow
} else {
    // show old checkout flow
}
```

Use RELEASE flags for:
- Gradual rollouts of new features
- Per-environment feature configuration

### KILLSWITCH

Emergency switch to instantly disable functionality. Typically enabled (active) for everyone, disabled during incidents. Always checked with `isEnabled()` — if it returns `false`, the feature is blocked.

```java
if (!client.isEnabled("kill-payment-gw")) {
    throw new ServiceUnavailableException();
}
```

### When to Use Each

| | RELEASE | KILLSWITCH |
|---|---------|------------|
| **Purpose** | Enables new functionality | Disables broken functionality |
| **Code pattern** | `if (isEnabled)` — new code | `if (!isEnabled)` — block |
| **Default state** | Off (gradually enabled) | On (instantly disabled) |
| **Scenario** | Rolling out a new feature: 1% → 100% | Service degradation: payment gateway is down — disable it |
| **Example key** | `new-checkout` | `kill-payment-gateway` |
| **Rollback** | Set `enabled: false` or 0% | Set `enabled: false` |

## Targeting Rules (Contexts)

Rules determine *who* sees a flag by matching context attributes. Rules within a context are evaluated with AND logic — all must match.

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `in` | Value is in a list | `country` in `[RU, BY, KZ]` |
| `not_in` | Value is not in a list | `country` not_in `[US, CA]` |
| `eq` | Equality (numeric for `contextType: number`) | `age` eq `18` |
| `ne` | Not equal | `plan` ne `free` |
| `gt` | Greater than | `version` gt `2.0` |
| `gte` | Greater than or equal | `age` gte `21` |
| `lt` | Less than | `priority` lt `5` |
| `lte` | Less than or equal | `retries` lte `3` |
| `contains` | String contains | `email` contains `@company.com` |

### Context Types

| `contextType` | Behavior | Example |
|---------------|----------|---------|
| `string` (default) | String comparison | `country` in `[RU, KZ]` |
| `number` | Numeric comparison | `age` gte `18` |
| `time` | ISO8601 date comparison | `eventDate` gt `2026-01-01T00:00:00Z` |
| `semver` | Semantic version comparison | `appVersion` gte `2.1.0` |

### Rule Example

```json
{
  "field": "country",
  "operator": "in",
  "values": ["DE", "FR", "NL"]
}
```

Rules are grouped into **contexts** (context definitions). All rules within a context must pass (AND logic).

## Segments

A **segment** is a reusable group of users defined by matching rules (contexts). Referenced by flag strategies — at least one segment must match for the strategy to apply (OR logic).

Examples:
- "EU users" — country in list of EU codes
- "Premium subscribers" — plan equals premium
- "Beta testers" — specific userIds

## Percentage Rollout

Percentage rollout distributes flag visibility deterministically using MurmurHash32 over `flagKey + userId` (or `sessionId`). The same user always gets the same result.

| Percentage | Behavior |
|------------|----------|
| 0% | Flag off for everyone |
| 25% | Flag on for ~25% of users |
| 50% | Flag on for ~50% of users |
| 100% | Flag on for everyone |

## Evaluation Logic

When `isEnabled()` is called, the SDK evaluates in this order:

1. **Flag disabled?** → return `false`
2. **No strategy?** → return `true`
3. **Check constraints:** all context rules must match (AND)
4. **Check segments:** at least one segment must match (OR)
5. **Both constraints and segments present:** either passing grants access (OR)
6. **Percentage rollout:** MurmurHash32 hash of `flagKey + userId`, modulo 100 comparison
7. **Nothing matched** → return `false`

## Flag Lifecycle

Flags have two states:

| State | Description |
|-------|-------------|
| **Active** | Flag is live and available to SDKs |
| **Archived** | Flag is archived. SDKs no longer receive its configuration |

Per-environment, a flag can be **enabled** or **disabled** via strategy configuration.

## Best Practices

1. **Naming** — use descriptive kebab-case keys: `checkout-v2`, `ai-search-enabled`, `dark-mode-rollout`
2. **Clean up stale flags** — archive flags at 100% rollout after 2+ weeks of stability
3. **Avoid flag nesting** — `if (flagA && flagB)` is hard to debug; use segments instead
4. **Document flags** — fill in the description field in the dashboard
5. **Monitor** — track which flags are active and for how long

## Related Pages

- [Segments](/en/concepts/segments) — reusable user groups for targeting rules
- [Strategies](/en/concepts/strategies) — how rollout strategies work
- [Environments](/en/concepts/environments) — per-environment flag configuration
