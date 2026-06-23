# Contexts

A context describes an attribute that the SDK passes when evaluating a flag. Context definitions are optional — the SDK works without them. They exist to make rule configuration in the dashboard easier: with type hints, value whitelists, and typo protection.

## Context Definitions

A context definition describes an attribute: its key, data type, and validation mode.

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | Human-readable name | "Country" |
| `key` | Machine key (used as `field` in constraints) | `country` |
| `type` | Data type: `string`, `number`, `time`, `semver` | `string` |
| `isStrict` | Enforce a whitelist of allowed values | `true` |

## Value Whitelist

A context can be configured with a whitelist of allowed values. This is useful when you want to restrict the choices when configuring rules in the dashboard — for example, preventing someone from typing `usa` instead of `US`. With the whitelist enabled, only the predefined values are available in constraints and segments.

If you don't need a whitelist — simply leave it off, and any value can be entered when configuring rules.

## Context Types & Operators

The context type determines how comparison operators interpret the value:

| Operator | Description | string | number | time | semver | Example |
|----------|-------------|--------|--------|------|--------|---------|
| `in` | Matches a value from the list | ✓ | | | | `country` in `[US, CA]` |
| `not_in` | Not in the list | ✓ | | | | `plan` not_in `[free]` |
| `eq` | Equals | ✓ | ✓ | ✓ | ✓ | `age` eq `18` |
| `ne` | Not equals | ✓ | ✓ | ✓ | ✓ | `plan` ne `free` |
| `gt` | Greater than | ✓ | ✓ | ✓ | ✓ | `version` gt `2.0` |
| `gte` | Greater than or equal | ✓ | ✓ | ✓ | ✓ | `age` gte `21` |
| `lt` | Less than | ✓ | ✓ | ✓ | ✓ | `priority` lt `5` |
| `lte` | Less than or equal | ✓ | ✓ | ✓ | ✓ | `retries` lte `3` |
| `contains` | Contains substring | ✓ | | | | `email` contains `@corp.com` |

## Using Contexts in Code

Contexts are passed to the SDK when evaluating a flag:

```java
MozhnoContext ctx = MozhnoContext.builder()
    .userId("user-123")
    .addProperty("country", "US")
    .addProperty("plan", "premium")
    .build();

boolean enabled = client.isEnabled("new-checkout", ctx);
```

The `country` and `plan` attributes can be defined as context definitions for easier rule configuration in the dashboard, but the SDK may pass any attributes regardless.

## What's Next

- [Flags](/en/concepts/flags) — flag types and rollout
- [Activation Rules](/en/concepts/strategies) — how context is used in rules
- [Targeting](/en/guide/targeting) — targeting guide
