---
name: mozhno-web
description: Reference for the Mozhno web UI (React 19 SPA under /web, published as @mozhno/core-ui). Use when building or editing UI — the design-token system, Tailwind v4 semantic tokens, shared + shadcn/Radix components, CVA variants, forms (react-hook-form + zod), the TanStack Query data layer, i18n, motion presets, testing, and the plugin registry.
license: MIT
metadata:
  domain: frontend
  role: specialist
  scope: implementation
  triggers: Mozhno web, React 19, Tailwind v4, design tokens, shadcn, Radix, TanStack Query, feature flags UI
---

# Mozhno Web

## Design Principles

Aim for a polished, cohesive, production-grade UI. This project already ships a mature design
system — **work within it, do not reinvent it**:

- Respect the token system and styling rules below — **never** hardcode raw colors, fonts, or
  ad-hoc values. Consistency with existing components beats novelty.
- Reuse `@/shared` and `@/app/components/ui` components before writing new ones.
- Match motion, spacing, radius, and typography to the existing tokens so new screens feel
  native to the app.

---

# Mozhno Project Reference

## Project Overview

Mozhno is an **open-core feature flag management platform**. Monorepo:
- `/server` — Spring Boot 4.0 + PostgreSQL (Java)
- `/web` — React 19 SPA, published as `@mozhno/core-ui` npm package

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Routing | react-router 8 |
| Data fetching | TanStack Query 5 |
| Styling | Tailwind CSS v4 (`@theme inline` pattern) |
| UI primitives | Radix UI (Dialog, Select, DropdownMenu, Switch, Popover, Checkbox, Tooltip, etc.) |
| Component variants | `class-variance-authority` (CVA) |
| Animation | `motion` (framer-motion) |
| Icons | `lucide-react` — curated re-export via `@/shared/icons` |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Theme | `next-themes` (dark mode via `.dark` class) |
| Toasts | `sonner` |
| Class merging | `clsx` + `tailwind-merge` → `cn()` in `@/app/components/ui/utils` |
| Testing | vitest + @testing-library/react + jsdom |
| Charts | recharts |
| Date handling | date-fns + react-day-picker |

## Directory Map

```
web/src/
  main.tsx                 — entry point
  app/
    App.tsx                — providers: ThemeProvider, LocaleProvider, QueryClient, MotionConfig, Router
    routes.tsx             — 16 routes (see Routes below)
    auth/                  — AuthContext, useAuth
    components/
      ui/                  — shadcn/ui: dialog, select, sheet, dropdown-menu, switch, checkbox, toggle, ...
      flags/               — feature flag pages (FlagsList, FlagCard, FlagCreatePanel, FlagEditPanel, ...)
      integrations/        — webhook config pages
      onboarding/          — onboarding wizard (OnboardingWizard, CreateProjectStep, CreateFlagStep)
      skeletons/           — loading skeletons (FlagCardSkeleton, TableRowSkeleton, ...)
      PluginSlot.tsx       — plugin system renderer
      SidePanel.tsx, TipCard.tsx, ConfirmDialog.tsx, DiffView.tsx, InlineDiffBar.tsx, ...
    hooks/                 — queries.ts, mutations.ts, useFlagFilters.ts, useFlagPanels.ts, ...
  shared/
    index.ts               — barrel export: all shared components + utilities
    components/
      Badge.tsx            — CVA: 7 variants × 3 styles × 2 shapes × 2 sizes
      GradientButton.tsx   — CVA: 9 variants × 4 sizes
      Card.tsx             — CVA: 4 variants (default/elevated/panel/selectable)
      StatusDot.tsx        — CVA: 4 states × 2 sizes
      EmptyState.tsx       — icon/illustration + title + action button
      SectionHeader.tsx    — gradient heading + dot + description
      FormField.tsx        — label + hint/error wrapper for inputs
      SearchInput.tsx      — search icon + clear button
      LoadingState.tsx     — pulsing card placeholder
      PageLoader.tsx       — full-page spinner
      LazyPage.tsx         — Suspense wrapper for lazy routes
      ErrorBox.tsx         — alert message
      Hairline.tsx         — thin border divider
      TruncatedCopyTooltip.tsx — truncate + copy tooltip
      CardHeader.tsx       — card title bar with actions slot
      ColorBar.tsx         — horizontal color bar
      ColorIcon.tsx        — small color swatch
      Wordmark.tsx         — brand wordmark (sm/md/lg/xl)
      DatePicker.tsx, DateRangePicker.tsx, DateTimePicker.tsx — date inputs
      StatusIcon.tsx       — icon in a colored container
      SkipLink.tsx         — accessibility skip-to-content
      EmptyFlags.tsx, EmptyKeys.tsx, EmptySegments.tsx — empty state illustrations
    icons.ts               — 116 lucide-react icons, 10 semantic groups, ICON_SIZE export
    motion.ts              — animation presets (spring, card, accordion, fadeUp, ...)
    color.ts               — oklch ↔ hex conversion utilities (hexToOklch, oklchToHex, adjustColor, dimColor)
    format.ts              — formatDate, formatDateTime, timeAgo, getFlagTypeColor, getFlagTypeLabel
    errors.ts              — AppError class, isAppError, createAppError
    errorHandler.ts        — getErrorMessage, getErrorCode, shouldRetry, shouldRedirect
    sparklineUtils.ts      — sparkline data processing
    diffUtils.ts           — diff comparison utilities
    onboardingUtils.ts     — onboarding state management
    extractLogoColor.ts    — dominant color extraction from images
  api/
    index.ts               — main API client (api.modules.flags, api.modules.environments, ...)
    queryKeys.ts           — TanStack query key factory
    schemas.ts             — shared Zod schemas
    validation.ts          — validation helpers
  i18n/
    index.tsx              — LocaleProvider, useT() hook
    messages.ts            — translation messages
    dateLocales.ts         — date-fns locale imports
  styles/
    tokens.css             — GENERATED colour vars (:root light + .dark) from packages/design-tokens; DO NOT edit
    theme.css              — hand-authored scalars (font/spacing/z/motion), @theme inline mapping, @layer base, keyframes + gradient utilities
    tailwind.css           — Tailwind v4 imports + tw-animate-css
    index.css              — entry point (imports tailwind.css + tokens.css + theme.css)
  stories/                  — Storybook stories: Badge, Card, GradientButton, EmptyState, StatusDot, Tokens (palettes/swatches/typography showcase), ...
  test/                     — vitest tests + setup.ts
```

## Routes

| Path | Component | Lazy | Protected |
|------|-----------|------|-----------|
| `/login` | Auth | — | No |
| `/forgot-password` | ForgotPassword | — | No |
| `/reset-password` | ResetPassword | — | No |
| `/accept-invite` | AcceptInvite | — | No |
| `/` | DashboardLayout → redirect /flags | — | Yes |
| `/flags` | Flags | Yes | Yes |
| `/segments` | Segments | Yes | Yes |
| `/contexts` | Constraints | Yes | Yes |
| `/strategies` | Strategies | Yes | Yes |
| `/tags` | Tags | Yes | Yes |
| `/users` | Users | Yes | Yes |
| `/audit` | AuditLog | Yes | Yes |
| `/integrations` | Integrations | Yes | Yes |
| `/apikeys` | ApiKeys | Yes | Yes |
| `/applications` | ClientInstances | Yes | Yes |
| `/settings` | Settings | Yes | Yes |
| `/premium/*` | PremiumPageSlot (plugin-provided pages) | — | Yes |
| `*` | NotFound catch-all | — | — |

DashboardLayout wraps all protected routes with sidebar, header (logo + stats), and user menu. All page components inside DashboardLayout use lazy loading with `<LazyPage Component={...} />`.

---

# Design Token System

## Token Hierarchy (3 Layers)

The colour system is generated. Its **single source of truth** is
`packages/design-tokens/design-tokens.json`; run `make tokens` (or
`node packages/design-tokens/generate.mjs`) to regenerate `src/styles/tokens.css`
(the `:root`/`.dark` colour vars, imported before `theme.css`). Never edit
`tokens.css` by hand. Scalars (typography, spacing, radius, motion), the
`@theme inline` mapping and utilities stay hand-authored in `src/styles/theme.css`.

**Layer 1 — Primitives** (raw palette, theme-dependent):
- `--palette-{color}-{50..950}` for gray, brand, primary, success, warning, danger, info
- Example: `--palette-gray-50`, `--palette-success-500`, `--palette-danger-700`
- Each has light + dark variants

**Layer 2 — Semantic** (purpose, theme-dependent):
- Surfaces: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`
- Interactive: `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`
- Feedback: `--destructive`, `--destructive-foreground`, `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--info`, `--info-foreground`
- Structure: `--border`, `--input-border`, `--input-background`, `--switch-background`, `--overlay-bg`
- Brand: `--brand`, `--brand-foreground`
- Focus: `--ring`, `--ring-success`, `--ring-destructive`, `--ring-warning`, `--ring-brand`

**Layer 3 — Component-specific**:
- Gradients: `--gradient-start`, `--gradient-end` (hover via `.gradient-btn-primary` CSS class using `color-mix()`)
- Gradient variants: `--gradient-danger-start`, `--gradient-danger-end` (hover via `.gradient-btn-danger`), `--gradient-warning-start`, `--gradient-warning-end` (hover via `.gradient-btn-warning`)
- Button gradient classes: `.gradient-btn-primary`, `.gradient-btn-danger`, `.gradient-btn-warning` — handle background + hover in CSS via `color-mix(in oklch, ..., black N%)` (primary darkens 12%, danger/warning 10%)
- Subtle gradients: `--gradient-subtle-start`, `--gradient-subtle-end`
- Overlay: `--overlay-bg` (modal/sheet/alert backdrops, light: 35% black `oklch(0 0 0 / 0.35)`, dark: 55% `oklch(0 0 0 / 0.55)`)
- Panel sizing: `--panel-min-width` (8rem), `--panel-max-width` (32rem)
- Icon sizing: `--icon-sm` (0.75rem), `--icon-md` (1rem), `--icon-lg` (1.25rem)
- Sparklines: `--sparkline-true`, `--sparkline-false`
- Sidebar: `--sidebar`, `--sidebar-primary`, `--sidebar-accent`, etc.
- Charts: `--chart-1` through `--chart-5`
- Disabled: `--disabled-bg`, `--disabled-fg`, `--disabled-border`

## Typography Tokens

**Font families** (in `:root`, theme-independent):
- `--font-sans`: **Onest** (primary), then `Inter`, `ui-sans-serif`, `system-ui` fallbacks
- `--font-mono`: JetBrains Mono, Fira Code, Consolas

Both **Onest** (weights 400–800) and **JetBrains Mono** are loaded from Google Fonts in
`web/index.html` with `subset=cyrillic,latin` — the UI is Russian-first (`<html lang="ru">`),
so any new font must ship a Cyrillic subset. Do **not** hardcode font families in components;
rely on `--font-sans` / `--font-mono` (exposed as Tailwind `font-sans` / `font-mono`).

**Size scale** → Tailwind utilities:
| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--text-display` | `text-display` | clamp(2rem, 5vw, 2.75rem) |
| `--text-h1` | `text-h1` | clamp(1.5rem, 3.5vw, 2rem) |
| `--text-h2` | `text-h2` | clamp(1.125rem, 2.5vw, 1.25rem) |
| `--text-h3` | `text-h3` | clamp(0.9375rem, 2vw, 1rem) |
| `--text-body` | `text-body` | 0.875rem |
| `--text-body-sm` | `text-body-sm` | 0.8125rem |
| `--text-caption` | `text-caption` | 0.75rem |
| `--text-overline` | `text-overline` | 0.75rem |

**Weights** → Tailwind utilities:
- `font-display` (750), `font-heading` (700), `font-medium` (500), `font-normal` (400)

**Line heights** → Tailwind utilities:
- `leading-display` (1.15), `leading-heading` (1.25), `leading-body` (1.5), `leading-ui` (1.45), `leading-caption` (1.4)

**Headings** use: `<h1>` = `text-h1 font-heading leading-heading`, `<h2>` = `text-h2 font-heading leading-heading`, etc.

## Radius Tokens

| Token | Tailwind Utility | Value |
|-------|-----------------|-------|
| `--radius-sm` | `rounded-[--radius-sm]` | 0.375rem (6px) |
| `--radius-md` | `rounded-[--radius-md]` | 0.5rem (8px) |
| `--radius-lg` | `rounded-[--radius-lg]` | 0.625rem (10px) |
| `--radius-xl` | `rounded-[--radius-xl]` | 0.875rem (14px) |

## Shadow Tokens

`shadow-xs` → `shadow-sm` → `shadow-md` → `shadow-lg` → `shadow-xl` → `shadow-2xl`

Defined in both `:root` (light, lower opacity) and `.dark` (higher opacity). Use directly — theme switching is automatic.

## Spacing & Z-Index

- **Spacing**: Use Tailwind's built-in scale (4px base via `p-4`, `gap-2`, etc.)
- **Z-index tokens**: `--z-base` (0) → `--z-docked` (10) → `--z-dropdown` (20) → `--z-sticky` (30) → `--z-overlay` (40) → `--z-drawer` (50) → `--z-modal` (60) → `--z-popover` (70) → `--z-tooltip` (80) → `--z-toast` (90)

## Motion Tokens

**Durations**:
| Token | Value | Use Case |
|-------|-------|----------|
| `--duration-instant` | 0ms | No animation |
| `--duration-fast` | 150ms | Hover, micro-interactions |
| `--duration-normal` | 200ms | Default transitions |
| `--duration-slow` | 300ms | Entrance animations |
| `--duration-deliberate` | 500ms | Page transitions |

**Easings**:
- `--ease-default`: cubic-bezier(0.4, 0, 0.2, 1) — standard
- `--ease-in`: cubic-bezier(0.4, 0, 1, 1) — deceleration
- `--ease-out`: cubic-bezier(0, 0, 0.2, 1) — acceleration
- `--ease-in-out`: cubic-bezier(0.4, 0, 0.2, 1) — symmetric
- `--ease-spring`: cubic-bezier(0.22, 0.45, 0, 0.95) — bouncy

**Usage in CSS**: `transition-[...] duration-[--duration-fast] ease-[--ease-out]`

## Dark Mode

- Managed by `next-themes` → adds `.dark` class to `<html>`
- All color tokens have dark equivalents in `.dark {}` block in theme.css
- **No manual `dark:` prefix needed** for color tokens — just use the semantic token
- Shadow tokens automatically intensify in dark mode
- Overlay token (`--overlay-bg`) switches from `oklch(0 0 0 / 0.35)` to `oklch(0 0 0 / 0.55)`
- Icon, spacing, radius, duration tokens are theme-independent

---

# Styling Rules

## CRITICAL: NO Raw Color Values

> **Enforced:** an ESLint rule (`no-restricted-syntax` in `eslint.config.js`) makes raw color
> classes a **hard error** — `npm run lint` / CI fail on them. Chromatic scales map to feedback
> tokens (`red→destructive`, `green/emerald→success`, `amber/yellow→warning`, `teal/cyan→brand`,
> `blue/sky→info`), grays to `muted`/`muted-foreground`/`border`, `white`/`black` to the matching
> `*-foreground`/surface/`overlay` token. Data-driven colors (a user's chosen tag/flag color) stay
> as inline `style={{ backgroundColor }}` — the rule only bans Tailwind color *classes*.

**NEVER** use:
- `bg-red-600`, `bg-blue-500`, `text-green-400`, `from-amber-500 to-orange-500`, `border-l-red-400`
- `bg-black/50`, `bg-white/20`, `text-white`, `shadow-black/10`
- Tailwind's built-in color palette (`red-*`, `blue-*`, etc.)

**ALWAYS** use semantic tokens:
- `bg-primary`, `text-muted-foreground`, `border-border`
- `bg-overlay` (for modals/sheets/alert backdrops)
- `bg-input-background`, `bg-switch-background`
- `text-foreground` (main text), `text-muted-foreground` (secondary)

**Opacity variants** use Tailwind's opacity modifier on semantic tokens:
- `bg-primary/10`, `bg-success/20`, `text-muted-foreground/50`, `border-primary/30`

**Palette access** (when you need a specific shade):
- `bg-palette-brand-500`, `text-palette-danger-700`
- Tailwind: `bg-palette-success-100`, `border-palette-gray-200`

## Component Variants

Use **`class-variance-authority`** (CVA) for components with variants:
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const myVariants = cva('base-classes', {
  variants: {
    variant: { ... },
    size: { ... },
  },
  compoundVariants: [ ... ],
  defaultVariants: { ... },
});
```

Reference implementations: `Badge.tsx`, `GradientButton.tsx`, `Card.tsx`, `StatusDot.tsx`, `toggleVariants.ts`.

## Class Merging

```typescript
import { cn } from '@/app/components/ui/utils';
// cn() combines clsx + tailwind-merge
```

## Focus Rings

Standard pattern across all interactive elements:
```
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

## Disabled State

```
disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-fg disabled:border-disabled-border
```

---

# Icons

Import from `@/shared/icons`:
```typescript
import { Plus, Trash2, Settings, Flag, Search } from '@/shared/icons';
```

**ICON_SIZE** constant (CSS token references):
```typescript
import { ICON_SIZE } from '@/shared/icons';
// ICON_SIZE.sm = 'var(--icon-sm)' // 0.75rem (12px)
// ICON_SIZE.md = 'var(--icon-md)' // 1rem (16px)
// ICON_SIZE.lg = 'var(--icon-lg)' // 1.25rem (20px)
```

Usage: `<Plus className="size-[--icon-md]" />`

**NOTE**: Most Lucide icons use `size-4` (16px) by default via `[&_svg:not([class*='size-'])]:size-4` in UI components. No need to specify size on every icon.

---

# Motion & Animation

**Import**: `import { MOTION, fadeUp, scaleIn } from '@/shared/motion';`

**Available presets**:
- `MOTION.spring` — spring physics `[300, 30, 0, 1]`
- `MOTION.card` — staggered card list entrance
- `MOTION.accordion` — height expand/collapse
- `MOTION.hover` — scale(1.02) on hover
- `MOTION.fade` / `MOTION.fadeUp` / `MOTION.slideUp` / `MOTION.scaleIn` — entrance presets
- `MOTION.dialog` — overlay + content entrance
- `MOTION.sparkline` — SVG path draw

**Motion tokens are read from CSS at runtime** — if you change `--duration-normal` in theme.css, `MOTION.card` and `MOTION.accordion` update automatically.

**CSS keyframes** (in `theme.css`): `fadeIn`, `shake`
**tw-animate-css** classes: `animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2`, etc.

---

# Shared Components Quick Reference

All exported from `@/shared`:

| Component | Key Props |
|-----------|----------|
| **Badge** | `variant` (7), `style` (subtle/outline/solid), `shape` (rounded/pill), `size` (sm/md), `uppercase`, `icon` |
| **GradientButton** | `variant` (primary/default/danger/warning/secondary/muted/outline/ghost/link), `size` (sm/md/lg/icon), `icon`, `loading`, `disabled` | Gradient variants use `.gradient-btn-*` CSS classes from theme.css |
| **Card** | `variant` (default/elevated/panel/selectable), `padded`, `dimmed`, `selected`, `onClick`, `as` |
| **StatusDot** | `state` (active/recent/stale/neutral), `size` (sm/md), `label` |
| **SectionHeader** | `title` (string), `description` (ReactNode), `gradientClass` |
| **EmptyState** | `illustration`/`icon`, `title`, `description`, `buttonLabel`, `onAction` |
| **FormField** | `label`, `hint`, `error`, `maxLength`, `value`, `children` (input) |
| **SearchInput** | Standard input props + search icon |
| **LoadingState** | No props — renders pulsing card |
| **PageLoader** | No props — full page spinner |
| **LazyPage** | `Component` — suspense wrapper |
| **ErrorBox** | `message` |
| **Hairline** | `className` |
| **TruncatedCopyTooltip** | `text` |
| **CardHeader** | `title`, children (actions slot) |
| **DatePicker** / **DateRangePicker** / **DateTimePicker** | Date selection with calendar popover |

---

# Shadcn/UI Components

Located in `@/app/components/ui/`. All wrap Radix primitives:

| Component | Import | Key Notes |
|-----------|--------|-----------|
| AlertDialog | `alert-dialog.tsx` | Overlay uses `bg-overlay`, content `rounded-[--radius-xl]` |
| Avatar | `avatar.tsx` | Radix Avatar |
| Checkbox | `checkbox.tsx` | `rounded-[--radius-sm]`, `duration-[--duration-fast]` |
| Dialog | `dialog.tsx` | Overlay `bg-overlay backdrop-blur-sm`, content `rounded-[--radius-xl]` |
| DropdownMenu | `dropdown-menu.tsx` | `min-w-[--panel-min-width]`, `rounded-[--radius-xl]` |
| Input | `input.tsx` | `bg-input-background`, `border-input`, `rounded-lg` |
| Label | `label.tsx` | `text-body-sm` |
| Popover | `popover.tsx` | `min-w-[--panel-min-width]`, `rounded-[--radius-xl]` |
| RadioGroup | `radio-group.tsx` | `duration-[--duration-fast]`, `size-[--icon-sm]` |
| Select | `select.tsx` | Scroll buttons, `bg-input-background` |
| Separator | `separator.tsx` | Horizontal/vertical, `bg-border` |
| Sheet | `sheet.tsx` | Overlay `bg-overlay backdrop-blur-sm`, side-based positioning |
| Skeleton | `skeleton.tsx` | `bg-accent animate-pulse` |
| Switch | `switch.tsx` | `bg-primary` when checked, `bg-switch-background` unchecked |
| Textarea | `textarea.tsx` | `rounded-[--radius-md]`, `text-body` |
| Toggle | `toggle.tsx` | CVA via `toggleVariants` (default/outline × default/sm/lg) |
| Tooltip | `tooltip.tsx` | `rounded-[--radius-lg]`, arrow `rounded-[--radius-sm]` |

---

# Forms

- Library: `react-hook-form` + `zod` validation
- Resolver: `@hookform/resolvers/zod`
- **ALWAYS wrap form fields in `<FormField>`** from `@/shared`:
  ```tsx
  <FormField label="Name" hint="Optional hint" error={errors.name?.message}>
    <Input {...register('name')} />
  </FormField>
  ```
- FormField auto-generates accessible `id`/`aria-describedby` connections
- Reference patterns: `FlagCreatePanel.tsx`, `FlagEditPanel.tsx`, `Settings.tsx`, `CreateFlagStep.tsx`

---

# API & Data

```typescript
import { api } from '@/api';
import { useProjectQuery, useEnrichedFlagsQuery } from '@/app/hooks/queries';
import { useFlagDelete, useFlagToggle } from '@/app/hooks/mutations';
import { queryKeys } from '@/api/queryKeys';
```

- API client: modular (`api.projects.getLogoUrl()`, `api.flags.create()`, etc.)
- TanStack Query hooks prefixed with `use...Query` / `use...Mutation`
- QueryCache error handling in `App.tsx` — auto-toasts on query errors
- Query config: staleTime 60s, gcTime 10min, retry 1, no refetchOnWindowFocus

---

# i18n

```typescript
import { useT } from '@/i18n';
const t = useT();
// t('navigation.flags'), t('flags.create.title'), etc.
```

---

# Testing

- **Framework**: vitest + @testing-library/react + jsdom
- **Setup**: `src/test/setup.ts`
- **Tests location**: `src/test/*.test.tsx` (unit/component tests)
- **Run**: `npm run test`
- **Coverage**: `npm run test:coverage` (thresholds: lines 22%, functions 18%, branches 15%, statements 20%)

### Test templates

**Component test** (`@testing-library/react` + vitest):
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/shared/components/Badge';

describe('Badge', () => {
  it('renders and applies the semantic variant class', () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText('OK').className).toContain('bg-success');
  });
});
```

**Pure hook test:**
```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlagFilters } from '@/app/hooks/useFlagFilters';

const { result } = renderHook(() => useFlagFilters(flags));
act(() => result.current.setSearch('alpha'));
expect(result.current.filtered).toHaveLength(1);
```

**Query/mutation hook** — wrap in a `QueryClientProvider` with retries off:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);
const { result } = renderHook(() => useEnrichedFlagsQuery(), { wrapper });
```

---

# No Deprecated APIs

Target the versions this repo runs on: **React 19, react-router 8, TanStack Query 5,
Tailwind v4, Radix UI, motion (framer-motion), Vite 8, TypeScript**. Do **not** introduce APIs
deprecated or removed in these versions.

- **Never call a symbol marked `@deprecated`** (check the JSDoc/TS hover) — use its documented
  replacement. If TypeScript renders it struck-through, switch APIs.
- React 19: use `createRoot` (not `ReactDOM.render`), function components + hooks (no legacy
  lifecycle methods, string refs, or `defaultProps` on function components); use the `use` hook
  / actions patterns where the codebase already does.
- TanStack Query 5: object-form only — `useQuery({ queryKey, queryFn })`; use `gcTime` (not
  `cacheTime`), `isPending` (not the old `isLoading` semantics), and `placeholderData` (not the
  removed `keepPreviousData`).
- react-router 8: use the current router/data APIs already wired in `app/routes.tsx`; don't
  reach for removed v5-era APIs (`Switch`, `useHistory`, `Redirect`).
- Radix / lucide-react / motion: don't use props flagged deprecated in the installed version;
  import icons via `@/shared/icons` and animation via `@/shared/motion`.
- Prefer the repo's own utilities over ad-hoc/older ones: `cn()`, `@/shared` components, the
  `api` client, and `useT()` — do not reintroduce patterns those replaced.
- Check a dependency's release notes for its installed `package.json` version before using an
  unfamiliar API; if it's deprecated or "for removal", pick the replacement. Don't hide the
  signal with blanket `// eslint-disable` / `@ts-ignore` — fix the call instead.

---

# Build Commands

| Command | What |
|---------|------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run build:lib` | Library build (`@mozhno/core-ui`) |
| `npm run build:static` | Build to `../server/mozhno-app/src/main/resources/static` |
| `npm run storybook` | Storybook dev server (port 6006) |
| `npm run build-storybook` | Static Storybook build |
| `npm run test` | vitest run |
| `npm run test:watch` | vitest in watch mode |
| `npm run test:coverage` | vitest with coverage |
| `npm run lint` | eslint |
| `npm run format` | prettier |

---

# Mozhno PluginRegistry API

The `pluginRegistry` is a singleton for registering premium feature plugins in Mozhno's open-core architecture. Plugins rendered via `<PluginSlot slotId="..." />`.

## Available slots

| Slot ID | Location | Description |
|---------|----------|-------------|
| `sidebar.admin` | DashboardLayout sidebar | Injected in the admin section, between "Контексты" and "Пользователи" |
| `settings.premium` | Settings page | Appears at the bottom of the Settings page, after the "Опасная зона" section |

## Usage

```typescript
import { pluginRegistry, type PremiumPlugin } from '@mozhno/core-ui/plugin';

// Register a plugin
pluginRegistry.register('sidebar.admin', MyAdminPlugin, {
  priority: 50,           // Lower = rendered first (default: 50)
  requiredPlan: 'pro',    // Optional — for future plan gating
  onInit: () => console.log('Plugin loaded'),
  onDestroy: () => console.log('Plugin removed'),
});

// Unregister
pluginRegistry.unregister('sidebar.admin', MyAdminPlugin);

// Query registered plugins
const plugins = pluginRegistry.getForSlot('sidebar.admin');
```

## Plugin component contract

```tsx
import React from 'react';

// Plugin component receives no props — use api module for data fetching.
// Must be a named export or default export that React can render.
function MyAdminPlugin() {
  return <div>My premium feature</div>;
}

export default MyAdminPlugin;
```

## Rendering plugins

```tsx
import { PluginSlot } from '@mozhno/core-ui/plugin';

// In DashboardLayout or Settings:
<PluginSlot slotId="sidebar.admin" />
// Renders all registered plugins for this slot, sorted by priority.
```

## Priority ordering
- Plugins are sorted by `priority` ascending (lower = first).
- Default priority is `50`.
- Multiple plugins in the same slot render in priority order.
