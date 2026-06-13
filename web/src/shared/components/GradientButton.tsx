import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'default'
    | 'danger'
    | 'amber'
    | 'secondary'
    | 'muted'
    | 'outline'
    | 'ghost'
    | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-gradient-start to-gradient-end hover:from-gradient-start-hover hover:to-gradient-end-hover text-white',
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white',
  amber:
    'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
  secondary:
    'bg-card border border-border text-foreground/80 hover:bg-accent hover:text-foreground',
  muted: 'bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20',
  outline:
    'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
  ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-caption gap-1.5',
  md: 'h-9 px-4 text-body gap-2',
  lg: 'h-10 px-6 text-body gap-2',
  icon: 'size-9',
};

function needsFocusRing(variant: string): boolean {
  return !['link'].includes(variant);
}

function needsShadow(variant: string): boolean {
  return (
    variant !== 'secondary' &&
    variant !== 'muted' &&
    variant !== 'outline' &&
    variant !== 'ghost' &&
    variant !== 'link'
  );
}

export function GradientButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: GradientButtonProps) {
  const hasShadow = needsShadow(variant);
  const focusRing = needsFocusRing(variant)
    ? 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
    : '';
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-[transform,box-shadow,filter] duration-200 outline-none active:scale-95 disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-fg disabled:border-disabled-border disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${hasShadow ? 'shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-black/10 dark:hover:shadow-black/30' : ''} ${focusRing} ${className}`}
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
