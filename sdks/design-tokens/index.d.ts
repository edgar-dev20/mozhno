declare module '@mozhno/design-tokens' {
  export interface ThemeColor {
    light: string;
    dark: string;
  }

  export interface Primitives {
    gray: Record<number, ThemeColor>;
    brand: Record<number, ThemeColor>;
    success: Record<number, ThemeColor>;
    warning: Record<number, ThemeColor>;
    danger: Record<number, ThemeColor>;
    info: Record<number, ThemeColor>;
    primary: Record<number, ThemeColor>;
  }

  export interface SemanticColors {
    background: ThemeColor;
    foreground: ThemeColor;
    card: ThemeColor;
    'card-foreground': ThemeColor;
    popover: ThemeColor;
    'popover-foreground': ThemeColor;
    primary: ThemeColor;
    'primary-foreground': ThemeColor;
    secondary: ThemeColor;
    'secondary-foreground': ThemeColor;
    muted: ThemeColor;
    'muted-foreground': ThemeColor;
    accent: ThemeColor;
    'accent-foreground': ThemeColor;
    destructive: ThemeColor;
    'destructive-foreground': ThemeColor;
    border: ThemeColor;
    'input-border': ThemeColor;
    'input-background': ThemeColor;
    'switch-background': ThemeColor;
    ring: ThemeColor;
    brand: ThemeColor;
    'brand-foreground': ThemeColor;
    success: ThemeColor;
    'success-foreground': ThemeColor;
    warning: ThemeColor;
    'warning-foreground': ThemeColor;
    info: ThemeColor;
    'info-foreground': ThemeColor;
    'disabled-bg': ThemeColor;
    'disabled-fg': ThemeColor;
    'disabled-border': ThemeColor;
  }

  export interface ComponentColors {
    'gradient-start': ThemeColor;
    'gradient-end': ThemeColor;
    'gradient-subtle-start': ThemeColor;
    'gradient-subtle-end': ThemeColor;
    'gradient-danger-start': ThemeColor;
    'gradient-danger-end': ThemeColor;
    'gradient-warning-start': ThemeColor;
    'gradient-warning-end': ThemeColor;
    'sparkline-true': ThemeColor;
    'sparkline-false': ThemeColor;
    [key: `chart-${number}`]: ThemeColor;
    sidebar: ThemeColor;
    'sidebar-foreground': ThemeColor;
    'sidebar-primary': ThemeColor;
    'sidebar-primary-foreground': ThemeColor;
    'sidebar-accent': ThemeColor;
    'sidebar-accent-foreground': ThemeColor;
    'sidebar-border': ThemeColor;
    'sidebar-ring': ThemeColor;
    'ring-success': ThemeColor;
    'ring-destructive': ThemeColor;
    'ring-warning': ThemeColor;
    'ring-brand': ThemeColor;
  }

  export interface Typography {
    fontFamily: { sans: string; mono: string };
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  }

  export interface Radius {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  }

  export interface Shadow {
    xs: ThemeColor;
    sm: ThemeColor;
    md: ThemeColor;
    lg: ThemeColor;
    xl: ThemeColor;
    '2xl': ThemeColor;
  }

  export interface ZIndex {
    base: string;
    docked: string;
    dropdown: string;
    sticky: string;
    overlay: string;
    drawer: string;
    modal: string;
    popover: string;
    tooltip: string;
    toast: string;
  }

  export interface Motion {
    duration: Record<string, string>;
    easing: Record<string, string>;
  }

  export interface DesignTokens {
    color: {
      primitives: Primitives;
      semantic: SemanticColors;
      component: ComponentColors;
    };
    typography: Typography;
    radius: Radius;
    shadow: Shadow;
    zIndex: ZIndex;
    overlay: ThemeColor;
    icon: { size: Record<string, string> };
    panel: { minWidth: string; maxWidth: string };
    motion: Motion;
  }

  export const color: DesignTokens['color'];
  export const typography: DesignTokens['typography'];
  export const radius: DesignTokens['radius'];
  export const shadow: DesignTokens['shadow'];
  export const zIndex: DesignTokens['zIndex'];
  export const overlay: DesignTokens['overlay'];
  export const icon: DesignTokens['icon'];
  export const panel: DesignTokens['panel'];
  export const motion: DesignTokens['motion'];

  const tokens: DesignTokens;
  export default tokens;
}

declare module '@mozhno/design-tokens/tokens.json' {
  const tokens: import('@mozhno/design-tokens').DesignTokens;
  export default tokens;
}
