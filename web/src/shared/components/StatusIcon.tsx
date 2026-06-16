import React from 'react';

type StatusIconVariant = 'brand' | 'destructive' | 'success' | 'warning' | 'info';

interface StatusIconProps {
  variant: StatusIconVariant;
  icon: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<StatusIconVariant, { outer: string; inner: string }> = {
  brand: {
    outer: 'bg-gradient-to-br from-gradient-start/10 to-gradient-end/10',
    inner: 'bg-gradient-to-br from-gradient-start to-gradient-end',
  },
  destructive: {
    outer: 'bg-destructive/10',
    inner: 'bg-gradient-to-br from-red-500 to-red-600',
  },
  success: {
    outer: 'bg-success/10',
    inner: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
  warning: {
    outer: 'bg-warning/10',
    inner: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  info: {
    outer: 'bg-info/10',
    inner: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
};

const sizeStyles: Record<'sm' | 'md', { outer: string; inner: string; iconSize: number }> = {
  sm: { outer: 'w-10 h-10 rounded-full', inner: 'w-6 h-6 rounded-full', iconSize: 12 },
  md: { outer: 'w-12 h-12 rounded-full', inner: 'w-7 h-7 rounded-full', iconSize: 14 },
};

export function StatusIcon({ variant, icon, size = 'md', className = '' }: StatusIconProps) {
  const s = sizeStyles[size];
  const v = variantStyles[variant];

  return (
    <div className={`flex-shrink-0 ${s.outer} flex items-center justify-center ${className}`}>
      <div className={`${s.inner} flex items-center justify-center text-white`}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, {
              size: s.iconSize,
              className: 'text-white',
            })
          : icon}
      </div>
    </div>
  );
}
