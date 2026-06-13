export function Hairline({ className }: { className?: string }) {
  return <div className={`border-t border-border/20 ${className ?? ''}`} />;
}
