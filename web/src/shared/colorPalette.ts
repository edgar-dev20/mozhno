import type { MessageKey } from '@/i18n';

/**
 * Shared color palette used by tag, segment and environment color pickers so the
 * customization experience stays identical across the app.
 */
export const COLOR_PALETTES: readonly [MessageKey, readonly string[]][] = [
  ['tags.colors.red', ['#b85a50', '#c87068', '#d8847c', '#a04840']],
  ['tags.colors.orange', ['#b86840', '#c87850', '#e09060', '#9a4828']],
  ['tags.colors.amber', ['#b89430', '#d0a840', '#e8c050', '#987820']],
  ['tags.colors.green', ['#4a8c5e', '#5a9e6e', '#6db87e', '#3a7048', '#2d8860', '#1d7850']],
  ['tags.colors.teal', ['#1a6b60', '#2d9484', '#3db8a5', '#155a50', '#0e7a6e']],
  ['tags.colors.blue', ['#4a6e8a', '#5a82a0', '#6e94b4', '#3a5870']],
  ['tags.colors.violet', ['#2d3a32', '#4a5e50', '#5a7260', '#6b8676', '#3a4a40', '#507060']],
  ['tags.colors.pink', ['#b87070', '#c88484', '#d89898', '#a05858', '#9a4860']],
];

const COLOR_NAMES: Record<string, string> = {
  '#b85a50': 'Red 500', '#c87068': 'Red 400', '#d8847c': 'Red 300', '#a04840': 'Red 600',
  '#b86840': 'Terracotta 500', '#c87850': 'Terracotta 400', '#e09060': 'Terracotta 300', '#9a4828': 'Terracotta 600',
  '#b89430': 'Gold 500', '#d0a840': 'Gold 400', '#e8c050': 'Gold 300', '#987820': 'Gold 600',
  '#4a8c5e': 'Forest 500', '#5a9e6e': 'Forest 400', '#6db87e': 'Forest 300', '#3a7048': 'Forest 600', '#2d8860': 'Pine 500', '#1d7850': 'Pine 600',
  '#1a6b60': 'Teal 700', '#2d9484': 'Teal 500', '#3db8a5': 'Teal 400', '#155a50': 'Teal 800', '#0e7a6e': 'Teal 900',
  '#4a6e8a': 'Slate 500', '#5a82a0': 'Slate 400', '#6e94b4': 'Slate 300', '#3a5870': 'Slate 600',
  '#2d3a32': 'Moss 800', '#4a5e50': 'Moss 600', '#5a7260': 'Moss 500', '#6b8676': 'Moss 400', '#3a4a40': 'Moss 700', '#507060': 'Moss 550',
  '#b87070': 'Rose 500', '#c88484': 'Rose 400', '#d89898': 'Rose 300', '#a05858': 'Rose 600', '#9a4860': 'Rose 700',
};

const colorHexCache: Record<string, string> = {};

/** Human-readable name for a palette hex, falling back to the hex itself. */
export function getColorName(hex: string): string {
  if (colorHexCache[hex]) return colorHexCache[hex];
  const normalized = hex.toLowerCase();
  colorHexCache[hex] = COLOR_NAMES[normalized] ?? hex;
  return colorHexCache[hex];
}
