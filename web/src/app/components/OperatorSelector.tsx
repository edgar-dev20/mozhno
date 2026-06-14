import type { OperatorDef } from "@/app/components/operators";
import { getOperatorShortCode, getOperatorI18nKey, OPERATOR_COLORS } from "@/app/components/operators";
import { useT } from '@/i18n';

interface OperatorSelectorProps {
  availableOps: OperatorDef[];
  currentOperator: string;
  onSelect: (op: string) => void;
}

export function OperatorSelector({ availableOps, currentOperator, onSelect }: OperatorSelectorProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {availableOps.map((op) => (
        <button
          key={op.value}
          onClick={(e) => { e.stopPropagation(); onSelect(op.value); }}
          className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all flex flex-col items-center gap-1.5 ${
            currentOperator === op.value
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-secondary/60 text-foreground/70 hover:bg-secondary hover:text-foreground border border-border'
          }`}
        >
          <span className="leading-none">{t(getOperatorI18nKey(op.value) as never)}</span>
          <span className={`inline-flex items-center font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none uppercase border ${
            currentOperator === op.value
              ? 'bg-primary text-primary-foreground border-primary'
              : OPERATOR_COLORS[op.value] ?? 'bg-muted text-muted-foreground border-border'
          }`}>
            {getOperatorShortCode(op.value)}
          </span>
        </button>
      ))}
    </div>
  );
}
