# Design Thinking — how to work on this UI

> **Audience: any human or AI agent** (Kilo, Claude Code, Cursor, Copilot, Codex, Windsurf, …)
> that builds or reworks UI in `mozhno/web`. This file is **tool-agnostic** and is the single
> source of truth for *how to think* when designing. It is a companion to
> [`SKILL.md`](./SKILL.md), which is the reference for *what to use* (tokens, shared components,
> styling rules). **This file governs the process; `SKILL.md` governs the material.**

## Why this exists

A coding tool defaults to **code-centric** thinking: task → component → props → render.
A designer thinks **human-centric**: user → goal → context → flow → interface as a consequence.
The result of the first path "works"; the result of the second is *usable and feels designed*.
This document forces the second order of operations for everyone touching the UI.

You will not become a designer by reading a "be a good designer" instruction. You become one by
following a **process** and working inside **constraints**. That is what this file provides.

## When to apply / when to skip

- **Apply fully** for: a new page or route, a new panel/dialog/card, a data view, a form, an
  onboarding step, or any "make this look better / redesign this" request.
- **Skip to direct implementation** for: a single icon swap, a copy/label change, a one-line
  class tweak, or wiring an existing component with no visual change. Don't ritualize trivia.

## The order of operations (do NOT jump straight to JSX)

```
1. BRIEF      → who / why / what-first, in words, before any code
2. CONSTRAIN  → bind to the design system (tokens + shared components)
3. STATES     → enumerate every state & edge, not just the happy path
4. BUILD      → implement on the constraints
5. CRITIQUE   → self-review vs heuristics + UX laws + WCAG
6. SEE        → render it, screenshot it, run axe — judge by perception, not by code
7. ITERATE    → fix findings, re-see; for non-trivial work, get a second independent review
```

---

## 1. Brief (write this before coding)

Answer in 4–6 short lines. If the request already answers a point, restate it; don't interrogate
the user for things you can reasonably infer.

- **User & state of mind** — who opens this screen, in what state? (first run, in a hurry,
  debugging a production flag, anxious about a destructive action?)
- **Job to be done** — the real task, not the literal ask. ("Turn a flag off fast and safely",
  not "add a toggle".)
- **Primary action** — the single most important thing on the screen; everything else is
  secondary. Name the visual hierarchy: what the eye hits 1st, 2nd, 3rd.
- **States to design** — which of empty / loading / error / partial / overflow apply (see §3).
- **Constraints** — mozhno is **Russian-first** (`<html lang="ru">`), light + dark, keyboard- and
  screen-reader-accessible, and must feel native to the existing app.

## 2. Constrain to the design system

The design system is your "physics" — working within it is what makes output look designed, not
improvised. From [`SKILL.md`](./SKILL.md):

- **Reuse before you build.** Check `@/shared` and `@/app/components/ui` first. Prefer `Card`,
  `Badge`, `GradientButton`, `EmptyState`, `SectionHeader`, `FormField`, `StatusDot`,
  `SearchInput`, the skeletons, etc. over new markup.
- **Tokens only — never raw values.** No `bg-red-600`, `text-white`, `bg-black/50`, `#3A7BFF`,
  `13px`, ad-hoc radii. Use semantic tokens (`bg-primary`, `text-muted-foreground`, `bg-overlay`,
  `border-border`) and the type/space/radius/motion scales. Raw color classes are a **hard ESLint
  error** here — treat that as the floor, not the goal.
- **Match the rhythm.** Reuse the existing spacing, radius (`rounded-[--radius-*]`), typography
  (`text-h2 font-heading`), motion presets (`@/shared/motion`), and the focus-ring pattern so the
  new screen feels part of the app, not bolted on.
- **i18n:** every user-facing string goes through `useT()` and must exist in **both** `en.ts` and
  `ru.ts` (key parity is enforced by a test). Never hardcode Russian/English text.

## 3. States & edges (the biggest gap between "junior code" and "design")

For every screen that shows data or takes input, deliberately design each applicable state. This
single habit closes ~80% of the quality gap.

| State | Design question | mozhno building block |
|-------|-----------------|-----------------------|
| **Empty** | First-run vs. filtered-to-zero — different messages | `EmptyState`, `EmptyFlags/Keys/Segments` |
| **Loading** | Skeleton that matches the final layout (no spinner-only) | `skeletons/`, `LoadingState`, `PageLoader` |
| **Error** | What failed + what the user can do next | `ErrorBox`, query error toasts |
| **Partial** | Some data present, some missing/pending | conditional sections |
| **Overflow** | Long names, huge counts, many tags/rows | truncation, `TruncatedCopyTooltip`, wrap rules |
| **Interactive** | hover / focus-visible / active / disabled / selected | token focus ring, `disabled:*` tokens |
| **Destructive** | Confirmation + clear consequence | `ConfirmDialog`, `AlertDialog` |
| **Dark mode** | Verify contrast among surfaces in `.dark` | semantic tokens (auto) — but actually *look* |

Edge inputs to test in your head: name length 0 → 200 chars; 0 / 1 / 10 000 items; no permission
(VIEWER role); slow network.

## 4. Build

Implement on the constraints above. Keep components small, typed, and consistent with neighbors.
Use CVA for variants (`Badge.tsx`, `Card.tsx` are references). Wire data with the existing `api`
client + TanStack Query hooks; build forms with `react-hook-form` + `zod` + `FormField`.

## 5. Self-critique (be your own design reviewer)

Before you say "done", walk this checklist and fix what fails. Cite `file:line` for issues.

**Nielsen's 10 heuristics (condensed):**
1. Visibility of system status — is loading / saving / success / error always shown?
2. Match the real world — labels in the user's language (ru-first), not internal jargon.
3. User control & freedom — cancel / undo / close; no dead ends; Esc closes overlays.
4. Consistency & standards — same patterns as the rest of mozhno (this is why §2 matters).
5. Error prevention — guard destructive actions; validate before submit.
6. Recognition over recall — show options/context; don't make users remember.
7. Flexibility & efficiency — keyboard paths, sensible defaults, shortcuts where earned.
8. Aesthetic & minimalist — remove anything not serving the primary action.
9. Help users recover from errors — plain-language message + a next step.
10. Help & documentation — hints/tooltips (`FormField` hint, `TipCard`) where needed.

**UX laws:** Hick (fewer choices at once), Fitts (make primary targets big/close; tap targets
≥ ~44px), Jakob (behave like tools users already know), Miller (chunk information),
proximity/alignment (group related items, align to the grid).

**WCAG 2.2 AA (must-pass):**
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text / UI components) in **both** themes.
- Every interactive element is reachable and operable by keyboard, with a visible `focus-visible`
  ring (the token pattern).
- Semantic HTML + labels: real `<button>` / `<a>`, `<label>` / `aria-*` (use `FormField`),
  `alt` / `aria-label` on meaningful icons; decorative icons hidden.
- Don't rely on color alone to convey state (pair with icon/text — `StatusDot` + label).
- Respect reduced motion (the motion presets already honor `MotionConfig`).

## 6. See it (visual feedback loop — you must judge by perception, not code)

Judging UI by reading JSX is the core failure mode. Render it and **look**:

- **Storybook is the fastest loop and it is MANDATORY for reusable UI.** For any new or changed
  shared/reusable component (or token), **add or update its `*.stories.tsx`** covering the key
  states from §3 and both themes — this is required, not optional (see `SKILL.md` → "Storybook
  (MANDATORY)"). Then:
  - `npm run storybook` (port 6006) to view.
  - `npm run test-storybook` runs stories in a real browser (Playwright) — **must pass**; it
    catches render breaks and missing stories.
- **Automated a11y:** the Storybook **a11y addon** flags contrast/roles/labels per story;
  `vitest-axe` is available for assertions in tests. Add an axe check for new interactive UI.
- **Screenshot to actually see it.** Playwright is installed. Capture the component/page in light
  and dark, then re-read the image and ask: *Where does the hierarchy break? Where is spacing
  uneven or off-grid? Where is contrast weak? What's crowded? What's misaligned?* If your tool
  cannot capture a screenshot, run `npm run dev` and ask the user for a screenshot of the specific
  screen + state.
- Iterate on the picture, not the code.

## 7. Iterate & get a second opinion

For anything beyond a small tweak, run a **second, independent design-review pass** — a fresh
agent session/subagent whose only job is to critique. Generation and critique are different
mental modes; separating them catches what you rationalized away. Feed the reviewer the diff
and/or screenshots and have it return findings as **Blocker / High / Medium / Nit** with
`file:line` and a concrete fix. Apply Blocker + High before declaring done.

> A ready-made review checklist lives in §5. If your tool supports custom agents/commands, wire a
> "design-review" agent that runs §5 + §6 against the current diff.

---

## Definition of done (UI)

- [ ] Brief written; primary action & hierarchy are intentional.
- [ ] Built from shared components + tokens; **zero** raw color/size values (`npm run lint` green).
- [ ] All applicable states from §3 implemented (empty/loading/error included, not just happy path).
- [ ] Self-critique done; WCAG AA contrast + keyboard + focus verified in light **and** dark.
- [ ] i18n keys added to **both** `en.ts` and `ru.ts`.
- [ ] For any new/changed shared/reusable component or token: **story added/updated** (states +
      both themes) and `npm run test-storybook` passes.
- [ ] Seen rendered (Storybook/screenshot), not just read as code; a11y addon / axe clean.
- [ ] `npm run test` + `npm run lint` green; non-trivial work got a second design-review pass.
