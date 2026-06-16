import { getOperatorShortCode, OPERATOR_COLORS } from "@/app/components/operators";

interface OperatorBadgeProps {
  operator: string;
  className?: string;
  contextType?: string;
}

export function OperatorBadge({ operator, className = '', contextType }: OperatorBadgeProps) {
  const code = getOperatorShortCode(operator, contextType);
  const colorKey = contextType === 'time' && (operator === 'gt' || operator === 'lt')
    ? (operator === 'gt' ? 'after' : 'before')
    : operator;
  return (
    <span className={`shrink-0 inline-flex items-center font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none uppercase border ${OPERATOR_COLORS[colorKey] ?? 'text-muted-foreground bg-muted border-border'} ${className}`}>
      {code}
    </span>
  );
}
