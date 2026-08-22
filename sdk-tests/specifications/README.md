# Mozhno SDK Specifications

Single source of truth for conformance tests across all Mozhno SDKs.

Every SDK (Java, JS, future Go/Python/...) MUST run these specifications and produce
**identical results** — this guarantees "predictable results across platforms"
(the same approach as `Unleash/client-specification`).

## How to add a new SDK

1. Implement a runner that:
   - reads `index.json`;
   - for every file in `specs`, loads `flags` and runs `tests`;
   - compares the result of `isEnabled(flag, context)` with `expected`.
2. Point the runner at this directory via the `SPECS_DIR` env var.
3. Wire the runner into the SDK repository's CI.

## Format

`index.json`:

```json
{ "version": 1, "specs": ["01-rollout-bucketing.json", "..."] }
```

A spec file:

```json
{
  "name": "01-rollout-bucketing",
  "flags": [
    { "name": "Test Flag", "key": "test-flag", "enabled": true,
      "activation": { "rollOut": 50, "constraints": [], "segments": [] } }
  ],
  "tests": [
    { "name": "bucket 72 < 50 => false",
      "flag": "test-flag",
      "context": { "userId": "user-1" },
      "expected": false }
  ]
}
```

Flag fields (`flags[]`) match the SDK model: `name`, `key`, `enabled`,
`activation.rollOut`, `activation.constraints[]` (`field`, `operator`, `values`,
`contextType`), `activation.segments[]` (`name`, `constraints[]`).

The optional `rollOut` field on a test overrides the flag's `activation.rollOut`
for that test only — this lets specs probe exact bucket boundaries (N and N+1)
for the same seed without duplicating flags that share a key. Runners apply the
override to a copy of the flag.

## Versioning

`version` in `index.json` is the specification version. SDKs pin it in CI
(download the specs at a pinned revision/tag). Changing the specs means bumping
`version`.

## Conventions

- All bucket vectors are derived from `murmurHash32` and pinned with a pair of
  boundary percentages (N and N+1) to catch any bucket drift.
- Rollout identifier chain: `userId` → `sessionId` → `anonymousId`.
