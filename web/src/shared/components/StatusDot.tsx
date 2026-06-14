interface StatusDotProps {
  state: 'active' | 'recent' | 'stale' | 'neutral';
  size?: 'sm' | 'md';
}

const stateClasses: Record<string, string> = {
  active: 'bg-success shadow-sm shadow-success/40',
  recent: 'bg-warning',
  stale: 'bg-muted-foreground/20',
  neutral: 'bg-muted-foreground/20',
};

const sizeClasses: Record<string, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export function StatusDot({ state, size = 'md' }: StatusDotProps) {
  return (
    <div className={`rounded-full shrink-0 ${sizeClasses[size]} ${stateClasses[state]}`} aria-hidden="true" />
  );
}
