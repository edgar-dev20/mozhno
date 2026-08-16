export function SegmentCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md animate-pulse">
      <div className="h-1.5 bg-muted" />
      <div className="p-5 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-muted rounded-md" />
          <div className="h-3 w-full bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-3 w-28 bg-muted rounded" />
        </div>
        <div className="bg-secondary rounded-lg p-3 border border-border space-y-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function SegmentCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SegmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
