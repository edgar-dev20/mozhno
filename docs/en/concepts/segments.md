# Segments

A **segment** is a reusable, named group of users defined by a set of matching rules. Segments let you define complex targeting logic once and reuse it across multiple flags.

## Why Segments?

Without segments, you'd repeat the same targeting rules in every flag:

- "Show feature X to beta testers"
- "Show feature Y to beta testers"
- "Show feature Z to beta testers"

With segments, you define "beta testers" once and reference it from all three flags. When the beta tester list changes, you update one place.

## Segment Structure

A segment consists of:

- **Key** — unique identifier (e.g., `beta-testers`, `eu-users`)
- **Name** — human-readable label
- **Description** — what the segment represents
- **Rules** — one or more conditions that must match for a user to belong to the segment

## Segment Rules

Segment rules use the same attribute-matching system as flag rules. Each rule specifies an attribute from the [evaluation context](/en/concepts/overview#context), an operator, and expected values.

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `country equals "DE"` |
| `notEquals` | Does not equal | `plan notEquals "free"` |
| `contains` | String contains | `email contains "@company.com"` |
| `startsWith` | String starts with | `userId startsWith "internal-"` |
| `endsWith` | String ends with | `email endsWith "@company.com"` |
| `in` | Value is in list | `country in ["DE", "FR", "NL"]` |
| `notIn` | Value is not in list | `country notIn ["US", "CA"]` |
| `greaterThan` | Numeric greater than | `loginCount greaterThan 10` |
| `lessThan` | Numeric less than | `age lessThan 18` |

### Rule Combination

Multiple rules within a segment are combined with **AND** logic — all rules must match for the user to be included in the segment.

To express **OR** logic, create separate segments and reference them independently in flag rules.

## Examples

### Beta Testers

Users who have opted into the beta program.

```yaml
key: beta-testers
name: Beta Testers
rules:
  - attribute: beta
    operator: equals
    values: ["true"]
```

### EU Users (GDPR)

Users in the European Union, useful for GDPR-related feature gates.

```yaml
key: eu-users
name: EU Users
rules:
  - attribute: country
    operator: in
    values:
      - AT
      - BE
      - BG
      - HR
      - CY
      - CZ
      - DK
      - EE
      - FI
      - FR
      - DE
      - GR
      - HU
      - IE
      - IT
      - LV
      - LT
      - LU
      - MT
      - NL
      - PL
      - PT
      - RO
      - SK
      - SI
      - ES
      - SE
```

### Internal Employees

Users with a company email address.

```yaml
key: internal-employees
name: Internal Employees
rules:
  - attribute: email
    operator: endsWith
    values: ["@company.com"]
```

### Premium Users (Multiple Conditions)

Users on a paid plan with at least 30 days of activity.

```yaml
key: premium-active-users
name: Premium Active Users
rules:
  - attribute: plan
    operator: notEquals
    values: ["free"]
  - attribute: daysSinceSignup
    operator: greaterThan
    values: ["30"]
```

## Using Segments in Flags

Once a segment is defined, reference it from any flag via the segment rule type:

```json
{
  "type": "segment",
  "segmentKey": "beta-testers",
  "serve": true
}
```

In the dashboard, segments appear as a selectable option when adding targeting rules to a flag.

## Segment vs. Flag Rules

| Aspect | Segment Rules | Flag Rules |
|--------|--------------|------------|
| Scope | Reusable across multiple flags | Specific to one flag |
| Logic | All rules must match (AND) | First matching rule wins |
| Output | Boolean (in segment or not) | Boolean or variant value |
| Management | Managed separately | Embedded in flag config |

## Evaluation Example

Given this evaluation context:

```java
var ctx = new EvaluationContext()
    .set("userId", "user-123")
    .set("email", "alice@company.com")
    .set("country", "DE")
    .set("beta", "true")
    .set("plan", "enterprise");
```

| Segment | Match? | Reason |
|---------|--------|--------|
| `beta-testers` | ✅ Yes | `beta equals "true"` |
| `eu-users` | ✅ Yes | `country in [DE, FR, ...]` |
| `internal-employees` | ✅ Yes | `email endsWith "@company.com"` |
| `premium-active-users` | ❌ No | `daysSinceSignup` is missing from context |

When an attribute referenced in a segment rule is missing from the context, the rule does **not** match and the user is excluded from the segment.

## Related Pages

- [Flags](/en/concepts/flags) — flag types and targeting rules
- [Strategies](/en/concepts/strategies) — rollout strategies that use segments
- [Overview](/en/concepts/overview) — how all concepts fit together
