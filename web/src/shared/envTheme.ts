import type { CSSProperties } from 'react';

export const ENV_FALLBACK_COLORS: readonly string[] = [
  '#2d9484',
  '#5a82a0',
  '#c08140',
  '#6d5ae0',
  '#c05a52',
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type EnvColorInput =
  | { id?: number | null; color?: string | null }
  | number
  | null
  | undefined;

function fallbackById(id: number | null | undefined): string {
  if (id == null || !Number.isFinite(id)) return ENV_FALLBACK_COLORS[0];
  return ENV_FALLBACK_COLORS[Math.abs(Math.trunc(id)) % ENV_FALLBACK_COLORS.length];
}

export function getEnvColor(env: EnvColorInput): string {
  if (env != null && typeof env === 'object') {
    const color = env.color;
    if (typeof color === 'string' && HEX_RE.test(color)) return color.toLowerCase();
    return fallbackById(env.id);
  }
  return fallbackById(env);
}

export interface EnvColorStyles {
  /** solid dot/swatch */
  dot: CSSProperties;
  /** subtle pill: tinted bg + text + border in the env color */
  soft: CSSProperties;
  /** subtle card: tinted bg + border */
  card: CSSProperties;
}

/**
 * Inline-style building blocks derived from a 6-digit `#rrggbb` env color
 * (as returned by {@link getEnvColor}). Arbitrary hex can't be Tailwind classes
 * at runtime, so env-colored UI uses these inline styles.
 */
export function envColorStyles(hex: string): EnvColorStyles {
  return {
    dot: { backgroundColor: hex },
    soft: { backgroundColor: `${hex}1f`, color: hex, borderColor: `${hex}33` },
    card: { backgroundColor: `${hex}1a`, borderColor: `${hex}33` },
  };
}
