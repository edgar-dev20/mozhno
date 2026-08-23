#!/usr/bin/env node
/**
 * Generates CSS custom-property files for every consumer of the Mozhno design
 * system from the single canonical spec in ./design-tokens.json.
 *
 *   node generate.mjs        # writes the consumer files
 *   node generate.mjs --check # exits non-zero if any file is out of date
 *
 * Outputs (DO NOT hand-edit — they carry a generated header):
 *   web/src/styles/tokens.css                 CSS vars for the React app (Tailwind v4)
 *   docs/.vitepress/theme/tokens.generated.css --vp-c-* vars for the VitePress site
 *
 * Canonical scope = the colour system (palettes + semantic + component),
 * shadows and overlay. Typography families, spacing and radius are stable and
 * stay hand-authored in each consumer.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const tokens = JSON.parse(readFileSync(resolve(here, 'design-tokens.json'), 'utf8'));

const HEADER = (src) =>
  `/* AUTO-GENERATED from packages/design-tokens/design-tokens.json — DO NOT EDIT.\n` +
  `   Run \`node packages/design-tokens/generate.mjs\` (or \`make tokens\`) to refresh.\n` +
  `   Consumer: ${src} */\n`;

const { primitives, semantic, component } = tokens.color;

/** semantic/component token value for a mode */
const S = (name, mode) => semantic[name][mode];
const C = (name, mode) => component[name][mode];
/** primitive palette shade value for a mode */
const P = (group, shade, mode) => primitives[group][shade][mode];
/** add an alpha channel to a plain `oklch(L C H)` value */
const soft = (value, alpha) => value.replace(/\)\s*$/, ` / ${alpha})`);

function paletteLines(mode) {
  return Object.entries(primitives)
    .map(([group, shades]) =>
      '  ' +
      Object.entries(shades)
        .map(([shade, v]) => `--palette-${group}-${shade}:${v[mode]};`)
        .join(''),
    )
    .join('\n');
}

function mapLines(obj, mode) {
  return Object.entries(obj)
    .map(([name, v]) => `  --${name}:${v[mode]};`)
    .join('\n');
}

function shadowLines(mode) {
  return Object.entries(tokens.shadow)
    .map(([name, v]) => `  --shadow-${name}:${v[mode]};`)
    .join('\n');
}

/* ─────────────────────────── web: tokens.css ─────────────────────────── */
function buildWeb() {
  const block = (mode) =>
    [
      paletteLines(mode),
      '',
      mapLines(semantic, mode),
      mapLines(component, mode),
      shadowLines(mode),
      `  --overlay-bg:${tokens.overlay[mode]};`,
    ].join('\n');

  return (
    HEADER('web/src/styles/tokens.css (imported by index.css, consumed by theme.css @theme)') +
    `\n:root {\n${block('light')}\n}\n\n.dark {\n  color-scheme:dark;\n${block('dark')}\n}\n`
  );
}

/* ──────────────────── docs: tokens.generated.css (VitePress) ──────────────────── */
// Each --vp-* var is derived from a canonical token where one exists; a handful
// of VitePress-specific surface/text shades have no semantic token and are literals.
function docsVars(mode) {
  const isLight = mode === 'light';
  return [
    ['--vp-font-family-base', `'Onest','Inter',ui-sans-serif,system-ui,sans-serif`],
    ['--vp-font-family-mono', `'JetBrains Mono','Fira Code','Consolas',monospace`],

    ['--vp-c-brand-1', isLight ? S('brand', mode) : 'oklch(0.77 0.12 175)'],
    ['--vp-c-brand-2', isLight ? P('brand', '600', mode) : 'oklch(0.83 0.10 175)'],
    ['--vp-c-brand-3', isLight ? P('brand', '700', mode) : 'oklch(0.75 0.13 175)'],
    ['--vp-c-brand-soft', soft(isLight ? S('brand', mode) : 'oklch(0.77 0.12 175)', '0.14')],

    ['--vp-c-copper-1', isLight ? S('warning', mode) : 'oklch(0.78 0.14 75)'],
    ['--vp-c-copper-2', isLight ? P('warning', '400', mode) : P('warning', '600', mode)],
    ['--vp-c-copper-3', isLight ? P('warning', '600', mode) : P('warning', '400', mode)],
    ['--vp-c-copper-soft', soft(isLight ? S('warning', mode) : 'oklch(0.78 0.14 75)', '0.12')],

    ['--vp-c-bg', isLight ? 'oklch(0.978 0.001 200)' : S('background', mode)],
    ['--vp-c-bg-alt', isLight ? 'oklch(0.992 0.001 200)' : 'oklch(0.22 0.004 80)'],
    ['--vp-c-bg-elv', isLight ? 'oklch(1 0.001 200)' : 'oklch(0.26 0.003 80)'],
    ['--vp-c-bg-soft', isLight ? 'oklch(0.97 0.002 200)' : 'oklch(0.24 0.004 80)'],

    ['--vp-c-text-1', S('foreground', mode)],
    // Dark-mode text shades are raised above the canonical palette steps so the
    // pairs pass APCA Lc >= 60 on the dark surface (--vp-c-bg oklch(0.18 0.003 80)):
    // the canonical gray-500/600 dark steps measure Lc 25/49 and fail the floor.
    ['--vp-c-text-2', isLight ? P('gray', '600', mode) : 'oklch(0.80 0.006 80)'],
    ['--vp-c-text-3', isLight ? P('gray', '500', mode) : 'oklch(0.78 0.008 80)'],

    ['--vp-c-border', isLight ? 'oklch(0 0 0 / 0.12)' : S('border', mode)],
    ['--vp-c-divider', isLight ? 'oklch(0 0 0 / 0.10)' : 'oklch(1 0 0 / 0.10)'],
    ['--vp-c-gutter', isLight ? 'oklch(0 0 0 / 0.10)' : 'oklch(1 0 0 / 0.08)'],

    ['--vp-c-danger-1', isLight ? S('destructive', mode) : P('danger', '500', mode)],
    ['--vp-c-danger-2', isLight ? P('danger', '400', mode) : P('danger', '600', mode)],
    ['--vp-c-danger-3', isLight ? P('danger', '600', mode) : P('danger', '400', mode)],
    ['--vp-c-danger-soft', soft(isLight ? S('destructive', mode) : P('danger', '500', mode), '0.14')],

    ['--vp-c-tip-1', S('success', mode)],
    ['--vp-c-tip-2', isLight ? P('success', '400', mode) : P('success', '500', mode)],
    ['--vp-c-tip-3', isLight ? P('success', '600', mode) : P('success', '400', mode)],
    ['--vp-c-tip-soft', soft(S('success', mode), '0.14')],

    ['--vp-c-warning-1', S('warning', mode)],
    ['--vp-c-warning-2', isLight ? P('warning', '400', mode) : P('warning', '600', mode)],
    ['--vp-c-warning-3', isLight ? P('warning', '600', mode) : P('warning', '300', mode)],
    ['--vp-c-warning-soft', soft(S('warning', mode), '0.14')],

    ['--vp-c-info-1', S('info', mode)],
    ['--vp-c-info-2', isLight ? P('info', '400', mode) : P('info', '600', mode)],
    ['--vp-c-info-3', isLight ? P('info', '600', mode) : P('info', '400', mode)],
    ['--vp-c-info-soft', soft(S('info', mode), '0.14')],

    ['--vp-c-default-1', S('primary', mode)],
    ['--vp-c-default-2', isLight ? P('primary', '700', mode) : P('primary', '500', mode)],
    ['--vp-c-default-3', isLight ? P('primary', '800', mode) : P('primary', '400', mode)],
    ['--vp-c-default-soft', soft(S('primary', mode), isLight ? '0.1' : '0.12')],

    ['--vp-shadow-1', isLight ? '0 1px 3px 0 oklch(0 0 0 / 0.06)' : '0 1px 2px 0 oklch(0 0 0 / 0.22)'],
    ['--vp-shadow-2', isLight
      ? '0 4px 6px -1px oklch(0 0 0 / 0.08), 0 2px 4px -2px oklch(0 0 0 / 0.04)'
      : '0 4px 6px -1px oklch(0 0 0 / 0.32), 0 2px 4px -2px oklch(0 0 0 / 0.22)'],
    ['--vp-shadow-3', isLight
      ? '0 10px 15px -3px oklch(0 0 0 / 0.07), 0 4px 6px -4px oklch(0 0 0 / 0.04)'
      : '0 10px 15px -3px oklch(0 0 0 / 0.38), 0 4px 6px -4px oklch(0 0 0 / 0.26)'],

    ...(isLight
      ? [
          ['--vp-nav-height', '64px'],
          ['--vp-sidebar-width', '272px'],
          ['--radius', '0.625rem'],
        ]
      : []),
  ];
}

function buildDocs() {
  const emit = (mode) =>
    docsVars(mode)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n');

  return (
    HEADER('docs/.vitepress/theme/tokens.generated.css (imported by custom.css)') +
    `\n:root {\n${emit('light')}\n}\n\n.dark {\n  color-scheme: dark;\n${emit('dark')}\n}\n`
  );
}

/* ─────────────────────────────── run ─────────────────────────────── */
const outputs = [
  ['web/src/styles/tokens.css', buildWeb()],
  ['docs/.vitepress/theme/tokens.generated.css', buildDocs()],
];

const check = process.argv.includes('--check');
let drift = false;

for (const [rel, content] of outputs) {
  const abs = resolve(repoRoot, rel);
  if (check) {
    let current = '';
    try {
      current = readFileSync(abs, 'utf8');
    } catch {
      /* missing */
    }
    if (current !== content) {
      drift = true;
      console.error(`out of date: ${rel}`);
    }
  } else {
    writeFileSync(abs, content);
    console.log(`wrote ${rel}`);
  }
}

if (check && drift) {
  console.error('Design tokens are stale. Run `make tokens`.');
  process.exit(1);
}
if (check) console.log('design tokens up to date');
