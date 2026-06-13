export function ApiKeyRowSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-4 w-36 bg-muted rounded-md" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-5 w-14 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>
        <div className="h-4 w-4 bg-muted rounded" />
      </div>
    </div>
  );
}

export function ApiKeyTableSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <ApiKeyRowSkeleton key={i} />
      ))}
    </div>
  );
}
