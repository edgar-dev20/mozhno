import { getOperatorShortCode, OPERATOR_COLORS } from "@/app/components/operators";

interface OperatorBadgeProps {
  operator: string;
  className?: string;
}

export function OperatorBadge({ operator, className = '' }: OperatorBadgeProps) {
  const code = getOperatorShortCode(operator);
  return (
    <span className={`shrink-0 inline-flex items-center font-mono text-xs font-bold px-1.5 py-0.5 rounded leading-none uppercase border ${OPERATOR_COLORS[operator] ?? 'text-muted-foreground bg-muted border-border'} ${className}`}>
      {code}
    </span>
  );
}
