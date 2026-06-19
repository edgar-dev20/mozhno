import React from 'react';
import { adjustColor } from '@/shared/color';

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

const sizeMap: Record<ColorIconSize, { container: string; shadow: string | null }> = {
  xs: { container: 'w-4 h-4 rounded', shadow: null },
  sm: { container: 'w-5 h-5 rounded-md', shadow: null },
  md: { container: 'w-8 h-8 rounded-lg', shadow: 'shadow-sm' },
  lg: { container: 'w-11 h-11 rounded-xl', shadow: null },
  xl: { container: 'w-14 h-14 rounded-2xl', shadow: null },
};

function coloredShadow(color: string, size: ColorIconSize): string | undefined {
  if (size === 'lg') return `0 4px 12px ${color}33`;
  if (size === 'xl') return `0 8px 24px ${color}40`;
  return undefined;
}

export function ColorIcon({
  variant = 'solid',
  size = 'md',
  color,
  icon,
  shadow = false,
  darkDim = true,
  className = '',
  ...rest
}: ColorIconProps) {
  const s = sizeMap[size];

  const bgStyle: React.CSSProperties = {};

  if (variant === 'solid') {
    bgStyle.backgroundColor = color;
  } else if (variant === 'gradient') {
    bgStyle.backgroundImage = `linear-gradient(135deg, ${color}, ${adjustColor(color, 25)})`;
  } else if (variant === 'ghost') {
    bgStyle.backgroundColor = color + '20';
  }

  if (shadow) {
    const cs = coloredShadow(color, size);
    if (cs) {
      bgStyle.boxShadow = cs;
    }
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${variant !== 'ghost' ? 'text-white' : ''} ${s.container} ${shadow && s.shadow ? s.shadow : ''} ${darkDim ? 'dark:brightness-[.85] dark:saturate-[.7]' : ''} ${className}`}
      style={bgStyle}
      {...rest}
    >
      {icon}
    </div>
  );
}
