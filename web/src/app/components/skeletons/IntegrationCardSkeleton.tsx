export function IntegrationCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-32 bg-muted rounded-md" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-12 bg-muted rounded-full" />
          </div>
        </div>
        <div className="h-5 w-5 bg-muted rounded shrink-0" />
      </div>
    </div>
  );
}

export function IntegrationCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <IntegrationCardSkeleton key={i} />
      ))}
    </div>
  );
}
