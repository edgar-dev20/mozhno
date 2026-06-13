import React from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'accent';
type BadgeStyle = 'subtle' | 'outline' | 'solid';
type BadgeShape = 'rounded' | 'pill';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  style?: BadgeStyle;
  shape?: BadgeShape;
  size?: BadgeSize;
  uppercase?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const variantStyleClasses: Record<BadgeVariant, Record<BadgeStyle, string>> = {
  default: {
    subtle: 'text-muted-foreground bg-muted border border-border',
    outline: 'text-muted-foreground border border-border',
    solid: 'text-foreground bg-accent border border-accent',
  },
  primary: {
    subtle: 'text-primary bg-primary/10 border border-primary/10',
    outline: 'text-primary border border-primary/30',
    solid: 'text-primary-foreground bg-primary border border-primary',
  },
  success: {
    subtle: 'text-success bg-success/10 border border-success/20',
    outline: 'text-success border border-success/30',
    solid: 'text-success-foreground bg-success border border-success',
  },
  warning: {
    subtle: 'text-warning bg-warning/10 border border-warning/20',
    outline: 'text-warning border border-warning/30',
    solid: 'text-warning-foreground bg-warning border border-warning',
  },
  destructive: {
    subtle: 'text-destructive bg-destructive/10 border border-destructive/20',
    outline: 'text-destructive border border-destructive/30',
    solid: 'text-destructive-foreground bg-destructive border border-destructive',
  },
  info: {
    subtle: 'text-info bg-info/10 border border-info/20',
    outline: 'text-info border border-info/30',
    solid: 'text-info-foreground bg-info border border-info',
  },
  accent: {
    subtle: 'text-muted-foreground bg-accent border border-border',
    outline: 'text-muted-foreground border border-accent',
    solid: 'text-foreground bg-accent border border-accent',
  },
};

const shapeClasses: Record<BadgeShape, string> = {
  rounded: 'rounded',
  pill: 'rounded-full',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
};

export function Badge({
  variant = 'default',
  style = 'subtle',
  shape = 'rounded',
  size = 'md',
  uppercase = false,
  icon,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold leading-none shrink-0 ${shapeClasses[shape]} ${sizeClasses[size]} ${variantStyleClasses[variant][style]} ${uppercase ? 'uppercase tracking-[0.2em]' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
