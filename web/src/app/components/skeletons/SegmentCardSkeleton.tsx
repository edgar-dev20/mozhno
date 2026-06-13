export function SegmentCardSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="flex gap-4 px-4 py-4">
        <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="h-4 w-40 bg-muted rounded-md" />
          <div className="h-3 w-56 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-4 w-10 bg-muted rounded" />
          <div className="h-5 w-8 bg-muted rounded-full" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function SegmentCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SegmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
