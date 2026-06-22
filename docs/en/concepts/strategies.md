# Strategies

A **strategy** defines *how* a flag behaves on a specific environment. Each flag can have different strategy configurations per environment.

## Strategy Configuration

Each strategy consists of:

| Component | Description |
|-----------|-------------|
| **Enabled** | Whether the flag is active on this environment |
| **Context** | Set of attribute-based rules (constraints) for targeting |
| **Segments** | Reusable user groups to target (OR logic) |
| **Percentage** | Deterministic hash-based rollout (0-100) |

## How Strategies Work

A strategy is evaluated in a fixed order:

1. **Check enabled** — if disabled, return `false`
2. **Evaluate context rules** — all constraints must match (AND logic)
3. **Evaluate segments** — at least one segment must match (OR logic)
4. **When both present** — either constraints or segments passing grants access
5. **Percentage rollout** — MurmurHash32 hash of `flagKey + userId` compared against percentage
6. **Default** — if nothing matched, return `false`

## Targeting with Context Rules

Context rules match user attributes using operators:

```json
{
  "constraints": [
    {"field": "country", "operator": "in", "values": ["DE", "FR", "NL"]},
    {"field": "plan", "operator": "eq", "values": ["enterprise"]}
  ]
}
```

All constraints must pass for the flag to be enabled (AND logic). If a context attribute is missing, the rule evaluates to `false`.

## Targeting with Segments

Segments are reusable groups defined separately and referenced by key. A strategy can reference multiple segments — matching any one grants access (OR logic).

## Percentage Rollout

Percentage rollout uses deterministic hashing so the same user always gets the same result:

```
hash = MurmurHash32(flagKey + userId) % 100
if hash < percentage → enabled
else → disabled
```

If `userId` is not available, `sessionId` is used instead.

## Per-Environment Strategies

Strategies are configured per environment:

| Environment | Strategy |
|-------------|----------|
| **dev** | 100% rollout, no rules — all developers see the feature |
| **staging** | 50% rollout + `beta: true` segment — subset of staging users |
| **production** | 10% rollout + country rules — gradual global rollout |

Each environment has its own API key. The SDK receives only the strategy for its environment.

## Related Pages

- [Flags](/en/concepts/flags) — flag types and evaluation logic
- [Segments](/en/concepts/segments) — reusable user groups
- [Environments](/en/concepts/environments) — environment isolation
