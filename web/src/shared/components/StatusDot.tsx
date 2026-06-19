import { cva, type VariantProps } from 'class-variance-authority';

const statusDotVariants = cva('rounded-full shrink-0', {
  variants: {
    state: {
      active: 'bg-success shadow-sm shadow-success/40',
      recent: 'bg-warning shadow-sm shadow-warning/40',
      stale: 'bg-muted-foreground/20',
      neutral: 'bg-muted-foreground/20',
    },
    size: {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
    },
  },
  defaultVariants: {
    state: 'neutral',
    size: 'md',
  },
});

interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
  label?: string;
}

export function StatusDot({ state, size, label }: StatusDotProps) {
  return (
    <>
      <div
        className={statusDotVariants({ state, size })}
        aria-hidden="true"
      />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}
