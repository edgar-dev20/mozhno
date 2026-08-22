# Flags

A flag is a named toggle point in your code. **mozhno** supports two flag types, context constraints, segments, and percentage rollout.

## Flag Types

### RELEASE

Standard feature flag for gradual rollouts. Off by default — enabled for target audiences via activation rules.

### KILLSWITCH

Emergency shutoff switch. On by default for everyone — disabled during incidents. Checked with `isEnabled()`: if it returns `false`, the feature is blocked.

### When to Use Each

| | RELEASE | KILLSWITCH |
|---|---------|------------|
| **Purpose** | Enables new functionality | Disables broken functionality |
| **Default state** | Off (gradually enabled) | On (instantly disabled) |
| **Example key** | `new-checkout` | `kill-payment-gateway` |
| **Rollback** | Set `enabled: false` or 0% | Set `enabled: false` |

## Context Constraints

Context constraints control who sees a flag based on attributes passed to the SDK. All constraints within a group are evaluated with **AND** logic — every one must match.

Each constraint references a context definition (via `field`), specifies a comparison operator, and lists acceptable values. The context type (`string`, `number`, `time`, `semver`) determines how the operator interprets the value.

See [Contexts](/en/concepts/contexts) for details.

## Segments

A segment is a reusable user group defined through the same context constraints. Instead of duplicating rules across flags, define a segment once and reference it.

A flag can reference multiple segments — matching any one is enough (**OR**). See [Segments](/en/concepts/segments).

## Percentage Rollout

Deterministic distribution via MurmurHash32 of `flagKey + userId` (or `sessionId`, or the auto-generated `anonymousId`). The same user always lands in the same bucket. See [Rollout](/en/guide/rollout).

## Lifecycle

| State | Description |
|-------|-------------|
| **Active** | Flag created, available for SDK evaluation |
| **Archived** | Flag archived. SDK does not receive its configuration |

A flag can also be **enabled** (`enabled: true`) or **disabled** (`enabled: false`) independently on each environment.

## What's Next

- [Activation Rules](/en/concepts/strategies) — how to configure targeting per environment
- [Segments](/en/concepts/segments) — reusable user groups
- [Targeting](/en/guide/targeting) — detailed targeting guide
