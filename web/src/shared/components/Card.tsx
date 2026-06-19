import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-card rounded-xl shadow-sm border border-border',
      elevated: 'bg-card rounded-xl shadow-md border border-border',
      panel: 'bg-card rounded-xl shadow-lg border border-border',
      selectable: 'rounded-xl transition-all overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CardProps extends VariantProps<typeof cardVariants> {
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
      variant,
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

    let classes: string;

    if (variant === 'selectable') {
      classes = selected
        ? 'rounded-xl transition-all overflow-hidden bg-gradient-to-br from-sparkline-true/[0.04] to-transparent ring-1 ring-sparkline-true/25 shadow-md'
        : 'rounded-xl transition-all overflow-hidden bg-card shadow-sm hover:shadow-md border border-border';
    } else {
      classes = cardVariants({ variant });
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
