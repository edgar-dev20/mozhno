import type { OperatorDef } from '@/app/components/operators';
import {
  getOperatorShortCode,
  getOperatorI18nKey,
  OPERATOR_COLORS,
} from '@/app/components/operators';
import { useT } from '@/i18n';

interface OperatorSelectorProps {
  availableOps: OperatorDef[];
  currentOperator: string;
  onSelect: (op: string) => void;
  contextType?: string;
}

export function OperatorSelector({
  availableOps,
  currentOperator,
  onSelect,
  contextType,
}: OperatorSelectorProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {availableOps.map((op) => (
        <button
          key={op.value}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(op.value);
          }}
          className={`px-3 py-2.5 rounded-lg text-caption font-medium text-left transition-all flex flex-col items-center gap-1.5 border ${
            currentOperator === op.value
              ? 'bg-brand/10 text-brand border-brand/20'
              : 'bg-secondary/60 text-foreground/70 hover:bg-secondary hover:text-foreground border-border'
          }`}
        >
          <span className="leading-none">
            {t(getOperatorI18nKey(op.value, contextType) as never)}
          </span>
          <span
            className={`inline-flex items-center font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none uppercase border ${
              currentOperator === op.value
                ? 'bg-brand text-primary-foreground border-brand'
                : (OPERATOR_COLORS[op.value] ?? 'bg-muted text-muted-foreground border-border')
            }`}
          >
            {getOperatorShortCode(op.value, contextType)}
          </span>
        </button>
      ))}
    </div>
  );
}
