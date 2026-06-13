export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 animate-pulse">
      <div className="flex items-center gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded-md"
            style={{ width: `${40 + ((i * 37) % 60)}px`, flex: '0 0 auto' }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
}
