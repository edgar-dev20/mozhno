import { getOperatorShortCode, OPERATOR_COLORS } from '@/app/components/operators';
import { ContextType } from '@/app/components/contextTypes';
import { Operator } from '@/app/components/operatorsMeta';

interface OperatorBadgeProps {
  operator: string;
  className?: string;
  contextType?: string;
}

export function OperatorBadge({ operator, className = '', contextType }: OperatorBadgeProps) {
  const code = getOperatorShortCode(operator, contextType);
  const colorKey =
    contextType === ContextType.TIME && (operator === Operator.GT || operator === Operator.LT)
      ? operator === Operator.GT
        ? 'after'
        : 'before'
      : operator;
  return (
    <span
      className={`shrink-0 inline-flex items-center font-mono text-caption font-bold px-1.5 py-0.5 rounded leading-none uppercase border ${OPERATOR_COLORS[colorKey] ?? 'text-muted-foreground bg-muted border-border'} ${className}`}
    >
      {code}
    </span>
  );
}
