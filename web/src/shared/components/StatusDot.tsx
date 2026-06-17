interface StatusDotProps {
  state: 'active' | 'recent' | 'stale' | 'neutral';
  size?: 'sm' | 'md';
  label?: string;
}

const stateClasses: Record<string, string> = {
  active: 'bg-success shadow-sm shadow-success/40',
  recent: 'bg-warning shadow-sm shadow-warning/40',
  stale: 'bg-muted-foreground/20',
  neutral: 'bg-muted-foreground/20',
};

const sizeClasses: Record<string, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

export function StatusDot({ state, size = 'md', label }: StatusDotProps) {
  return (
    <>
      <div
        className={`rounded-full shrink-0 ${sizeClasses[size]} ${stateClasses[state]}`}
        aria-hidden="true"
      />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}
