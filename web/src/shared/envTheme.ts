export type EnvBadgeVariant = 'success' | 'info' | 'warning' | 'primary' | 'destructive';

export interface EnvTheme {
  /** Badge variant token */
  variant: EnvBadgeVariant;
  /** solid dot background, e.g. bg-success */
  dot: string;
  /** subtle pill: background + text + border */
  flat: string;
  /** card: background + border */
  card: string;
  /** tailwind gradient stops for avatar backgrounds */
  gradient: string;
  /** border only */
  border: string;
  /** text only */
  text: string;
  /** raw hex gradient endpoints (inline styles) */
  from: string;
  to: string;
}

const ENV_THEMES: readonly EnvTheme[] = [
  {
    variant: 'success',
    dot: 'bg-success',
    flat: 'bg-success/10 text-success border-success/20',
    card: 'bg-success/10 border border-success/20',
    gradient: 'from-success/10 to-success/5',
    border: 'border-success/20',
    text: 'text-success',
    from: '#2d9484',
    to: '#3db8a5',
  },
  {
    variant: 'info',
    dot: 'bg-info',
    flat: 'bg-info/10 text-info border-info/20',
    card: 'bg-info/10 border border-info/20',
    gradient: 'from-info/10 to-info/5',
    border: 'border-info/20',
    text: 'text-info',
    from: '#5a82a0',
    to: '#6e94b4',
  },
  {
    variant: 'warning',
    dot: 'bg-warning',
    flat: 'bg-warning/10 text-warning border-warning/20',
    card: 'bg-warning/10 border border-warning/20',
    gradient: 'from-warning/10 to-warning/5',
    border: 'border-warning/20',
    text: 'text-warning',
    from: '#c08140',
    to: '#d4995a',
  },
  {
    variant: 'primary',
    dot: 'bg-primary',
    flat: 'bg-primary/10 text-primary border-primary/20',
    card: 'bg-primary/10 border border-primary/20',
    gradient: 'from-primary/10 to-primary/5',
    border: 'border-primary/20',
    text: 'text-primary',
    from: '#6d5ae0',
    to: '#8b7bf0',
  },
  {
    variant: 'destructive',
    dot: 'bg-destructive',
    flat: 'bg-destructive/10 text-destructive border-destructive/20',
    card: 'bg-destructive/10 border border-destructive/20',
    gradient: 'from-destructive/10 to-destructive/5',
    border: 'border-destructive/20',
    text: 'text-destructive',
    from: '#c05a52',
    to: '#d47068',
  },
];

/**
 * Deterministic color theme for an environment, chosen by its id.
 * Environment names are user-editable, so colors must not depend on them.
 */
export function getEnvTheme(id: number | null | undefined): EnvTheme {
  if (id == null || !Number.isFinite(id)) return ENV_THEMES[0];
  return ENV_THEMES[Math.abs(Math.trunc(id)) % ENV_THEMES.length];
}
