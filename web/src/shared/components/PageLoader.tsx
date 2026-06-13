export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gradient-subtle-start to-gradient-subtle-end animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
