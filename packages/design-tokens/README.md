# @mozhno/design-tokens

Canonical design tokens for the Mozhno platform — the **single source of truth**
for the colour system (OKLCH palettes + semantic + component roles), shadows and
overlay, in both light and dark modes.

## How it works

```
design-tokens.json ──(generate.mjs)──▶ web/src/styles/tokens.css
                                      └▶ docs/.vitepress/theme/tokens.generated.css
```

- **`design-tokens.json`** — edit this and only this. It is the source of truth.
- **`generate.mjs`** — emits CSS custom-property files for each consumer. The
  generated files carry a `DO NOT EDIT` header and are committed to the repo, so
  consumers just `@import` them with no build-time coupling to this package.

Consumers derive their variables from the canonical tokens (e.g. VitePress
`--vp-c-brand-1` → `semantic.brand`, `--vp-c-copper-*` → the `warning` scale),
so brand values can never drift between the app and the docs again.

## Commands

```bash
node generate.mjs          # regenerate the consumer CSS files
node generate.mjs --check  # CI guard: fail if a generated file is stale
```

From the repo root: `make tokens` (regenerate) — run it after any edit to
`design-tokens.json`.

## Scope

Colour, shadow and overlay only. Typography families, spacing, radius and motion
are stable and remain hand-authored in each consumer (`web/src/styles/theme.css`,
`docs/.vitepress/theme/custom.css`).
