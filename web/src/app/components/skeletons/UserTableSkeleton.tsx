export function UserRowSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-4 w-32 bg-muted rounded-md" />
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-14 bg-muted rounded" />
        </div>
        <div className="h-4 w-4 bg-muted rounded" />
      </div>
    </div>
  );
}

export function UserTableSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <UserRowSkeleton key={i} />
      ))}
    </div>
  );
}
