export function TagCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-4 w-24 bg-muted rounded-md" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function TagCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <TagCardSkeleton key={i} />
      ))}
    </div>
  );
}
