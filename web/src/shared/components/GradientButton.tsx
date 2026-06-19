import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const gradientButtonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-lg transition-[transform,box-shadow,filter] duration-200 outline-none active:scale-95 disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-fg disabled:border-disabled-border disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-gradient-start to-gradient-end hover:from-gradient-start-hover hover:to-gradient-end-hover text-white shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-black/10 dark:hover:shadow-black/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-black/10 dark:hover:shadow-black/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        danger:
          'bg-gradient-to-r from-gradient-danger-start to-gradient-danger-end hover:from-gradient-danger-start-hover hover:to-gradient-danger-end-hover text-white shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-black/10 dark:hover:shadow-black/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        warning:
          'bg-gradient-to-r from-gradient-warning-start to-gradient-warning-end hover:from-gradient-warning-start-hover hover:to-gradient-warning-end-hover text-warning-foreground shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-black/10 dark:hover:shadow-black/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        secondary:
          'bg-card border border-border text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        muted:
          'bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        outline:
          'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        ghost:
          'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-caption gap-1.5',
        md: 'h-9 px-4 text-body gap-2',
        lg: 'h-10 px-6 text-body gap-2',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  icon?: React.ReactNode;
  loading?: boolean;
}

export function GradientButton({
  variant,
  size,
  icon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: GradientButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={gradientButtonVariants({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
