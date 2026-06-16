export function SidePanelSkeleton() {
  return (
    <div className="space-y-5 animate-pulse px-6 py-5">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted rounded-md" />
        <div className="h-9 w-full bg-muted rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-20 bg-muted rounded-md" />
        <div className="h-9 w-full bg-muted rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted rounded-md" />
        <div className="h-24 w-full bg-muted rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-9 w-full bg-muted rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}
