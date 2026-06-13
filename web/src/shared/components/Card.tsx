import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'panel' | 'selectable';
  selected?: boolean;
  dimmed?: boolean;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  as?: 'div' | 'button';
  ariaLabel?: string;
}

export const Card = React.forwardRef<HTMLDivElement | HTMLButtonElement, CardProps>(
  (
    {
      variant = 'default',
      selected,
      dimmed,
      padded,
      className = '',
      children,
      onClick,
      as,
      ariaLabel,
    },
    ref,
  ) => {
    const tag = as ?? (onClick ? 'button' : 'div');

    let classes = '';

    if (variant === 'selectable') {
      if (selected) {
        classes =
          'rounded-2xl transition-all overflow-hidden bg-gradient-to-br from-sparkline-true/[0.04] to-transparent ring-1 ring-sparkline-true/25 shadow-md';
      } else {
        classes =
          'rounded-2xl transition-all overflow-hidden bg-card shadow-sm hover:shadow-md border border-border';
      }
    } else {
      const variantBase: Record<string, string> = {
        default: 'bg-card rounded-2xl shadow-sm border border-border',
        elevated: 'bg-card rounded-2xl shadow-md border border-border',
        panel: 'bg-card rounded-2xl shadow-lg border border-border',
      };
      classes = variantBase[variant];
    }

    if (dimmed) classes += ' scale-[0.98] grayscale opacity-60';
    if (padded) classes += ' px-4 py-3.5';
    if (className) classes += ` ${className}`;

    if (tag === 'button') {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={onClick}
          className={`${classes} text-left`}
          type="button"
          aria-label={ariaLabel}
        >
          {children}
        </button>
      );
    }

    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={classes}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
