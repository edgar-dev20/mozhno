name: frontend-design description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics. license: Complete terms in LICENSE.txt
Triggers
Activate this skill when the user asks to:

Build a web component, page, application, or interface
Create a landing page, dashboard, or portfolio
Style or beautify an existing web UI
Generate HTML/CSS/JS, React, Vue, or similar frontend code
Design a poster, card, or visual artifact for the web
NOT For
Backend logic — APIs, databases, server routes, authentication; use coding tools directly
Data modeling — schema design, ORM configuration, data pipelines
CLI or terminal UIs — this skill is for browser/web interfaces only
Infrastructure or deployment — Docker, CI/CD, cloud configs
Decision Rules
If the request is purely visual/UI → follow this skill fully (design thinking + aesthetic guidelines)
If the request mixes frontend + backend → handle frontend with this skill; handle backend separately
If the user specifies a framework (React, Vue, Svelte) → use it; otherwise default to clean HTML/CSS/JS
If the user specifies an aesthetic → follow their direction; otherwise commit to a bold, unexpected choice
If the artifact is small (single button, one card) → skip the design thinking step, implement directly
This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

Design Thinking
Before coding, understand the context and commit to a BOLD aesthetic direction:

Purpose: What problem does this interface solve? Who uses it?
Tone: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
Constraints: Technical requirements (framework, performance, accessibility).
Differentiation: What makes this UNFORGETTABLE? What's the one thing someone will remember?
CRITICAL: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

Production-grade and functional
Visually striking and memorable
Cohesive with a clear aesthetic point-of-view
Meticulously refined in every detail
Frontend Aesthetics Guidelines
Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
Spatial Composition: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
Backgrounds & Visual Details: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.
NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

IMPORTANT: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## Mozhno PluginRegistry API

The `pluginRegistry` is a singleton for registering premium feature plugins in Mozhno's open-core architecture. Plugins rendered via `<PluginSlot slotId="..." />`.

### Available slots

| Slot ID | Location | Description |
|---------|----------|-------------|
| `sidebar.admin` | DashboardLayout sidebar | Injected in the admin section, between "Контексты" and "Пользователи" |
| `settings.premium` | Settings page | Appears at the bottom of the Settings page, after the "Опасная зона" section |

### Usage

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

### Plugin component contract

```tsx
import React from 'react';

// Plugin component receives no props — use api module for data fetching.
// Must be a named export or default export that React can render.
function MyAdminPlugin() {
  return <div>My premium feature</div>;
}

export default MyAdminPlugin;
```

### Rendering plugins

```tsx
import { PluginSlot } from '@mozhno/core-ui/plugin';

// In DashboardLayout or Settings:
<PluginSlot slotId="sidebar.admin" />
// Renders all registered plugins for this slot, sorted by priority.
```

### Priority ordering
- Plugins are sorted by `priority` ascending (lower = first).
- Default priority is `50`.
- Multiple plugins in the same slot render in priority order.
