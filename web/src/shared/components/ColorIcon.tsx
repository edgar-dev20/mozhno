import React from 'react';
import { adjustColor, dimColor } from '@/shared/color';

type ColorIconVariant = 'solid' | 'gradient' | 'ghost';
type ColorIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ColorIconProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ColorIconVariant;
  size?: ColorIconSize;
  color: string;
  icon: React.ReactNode;
  shadow?: boolean;
  darkDim?: boolean;
  className?: string;
}

const sizeMap: Record<ColorIconSize, { container: string; tailwindShadow: string | null }> = {
  xs: { container: 'w-4 h-4 rounded', tailwindShadow: null },
  sm: { container: 'w-5 h-5 rounded-md', tailwindShadow: null },
  md: { container: 'w-8 h-8 rounded-lg', tailwindShadow: 'shadow-sm' },
  lg: { container: 'w-11 h-11 rounded-xl', tailwindShadow: null },
  xl: { container: 'w-14 h-14 rounded-2xl', tailwindShadow: null },
};

function coloredShadow(color: string, size: ColorIconSize): string | undefined {
  if (size === 'lg') return `0 4px 12px ${color}33`;
  if (size === 'xl') return `0 8px 24px ${color}40`;
  return undefined;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background';

export function ColorIcon({
  variant = 'solid',
  size = 'md',
  color,
  icon,
  shadow = false,
  darkDim = true,
  className = '',
  onClick,
  role: _role,
  tabIndex: _tabIndex,
  onKeyDown: _onKeyDown,
  ...rest
}: ColorIconProps) {
  const s = sizeMap[size];

  const varStyle: Record<string, string> = {};
  const inlineStyle: React.CSSProperties = {};

  const dark = darkDim ? dimColor(color) : color;

  if (variant === 'solid') {
    varStyle['--ci-bg'] = color;
    varStyle['--ci-bg-dark'] = dark;
  } else if (variant === 'gradient') {
    varStyle['--ci-grad'] = `linear-gradient(135deg, ${color}, ${adjustColor(color, 25)})`;
    varStyle['--ci-grad-dark'] = `linear-gradient(135deg, ${dark}, ${adjustColor(dark, 25)})`;
  } else if (variant === 'ghost') {
    inlineStyle.backgroundColor = color + '20';
  }

  if (shadow) {
    const lightShadow = coloredShadow(color, size);
    if (lightShadow) {
      varStyle['--ci-shadow'] = lightShadow;
      varStyle['--ci-shadow-dark'] = coloredShadow(dark, size) ?? lightShadow;
    }
  }

  const isInteractive = typeof onClick === 'function';

  const variantClass =
    variant === 'solid'
      ? 'bg-[var(--ci-bg)] dark:bg-[var(--ci-bg-dark)]'
      : variant === 'gradient'
        ? '[background-image:var(--ci-grad)] dark:[background-image:var(--ci-grad-dark)]'
        : '';

  const shadowClass =
    shadow && coloredShadow(color, size)
      ? '[box-shadow:var(--ci-shadow)] dark:[box-shadow:var(--ci-shadow-dark)]'
      : '';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${variant !== 'ghost' ? 'text-white' : ''} ${s.container} ${shadow && s.tailwindShadow ? s.tailwindShadow : ''} ${variantClass} ${shadowClass} ${isInteractive ? `cursor-pointer transition-transform hover:scale-110 ${focusRing}` : ''} ${className}`}
      style={{ ...inlineStyle, ...(varStyle as React.CSSProperties) }}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).click();
              }
            }
          : undefined
      }
      {...rest}
    >
      {icon}
    </div>
  );
}
