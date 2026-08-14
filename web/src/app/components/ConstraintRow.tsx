import { useCallback } from 'react';
import { ChevronRight, Trash2 } from '@/shared/icons';
import { getOperatorsForType } from '@/app/components/operators';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { OperatorSelector } from '@/app/components/OperatorSelector';
import { ContextType } from '@/app/components/contextTypes';
import { isMultiOperator } from '@/app/components/operatorsMeta';
import { useT } from '@/i18n';
import { formatTimeConstraintValue } from '@/shared/format';
import type { ContextDefinition } from '@/api';

interface ConstraintRowProps {
  id: string;
  contextDefId: number;
  operator: string;
  valuesPreview: string;
  contexts: ContextDefinition[];
  isActive: boolean;
  onToggle: () => void;
  onContextChange: (contextDefId: number) => void;
  onOperatorChange: (op: string) => void;
  onRemove: () => void;
  children: (contextType: string) => React.ReactNode;
}

export function ConstraintRow({
  id,
  contextDefId,
  operator,
  valuesPreview,
  contexts,
  isActive,
  onToggle,
  onContextChange,
  onOperatorChange,
  onRemove,
  children,
}: ConstraintRowProps) {
  const t = useT();
  const hasContext = contextDefId !== 0;
  const ctxDef = hasContext ? (Array.isArray(contexts) ? contexts.find((c) => c.id === contextDefId) : undefined) : undefined;
  const contextType = ctxDef?.type;
  const availableOps = getOperatorsForType(contextType);
  const isMulti = isMultiOperator(operator);
  const displayValues =
    contextType === ContextType.TIME && valuesPreview !== '∅'
      ? valuesPreview
          .split(', ')
          .map((v) => formatTimeConstraintValue(v))
          .join(', ')
      : valuesPreview;

  const handleContextChange = useCallback(
    (ctxId: number) => {
      onContextChange(ctxId);
    },
    [onContextChange],
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`${id}-body`}
        className={`group cursor-pointer w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
          isActive
            ? 'bg-brand/10 dark:bg-brand/8 border-brand/30 dark:border-brand/30 shadow-sm rounded-b-none'
            : 'bg-input-background border-border hover:border-brand/30 dark:hover:border-brand/20 hover:shadow-sm'
        }`}
      >
        <span className="shrink-0 text-caption font-semibold text-foreground/80 min-w-0 truncate">
          {contextDefId === 0
            ? t('flags.noContext')
            : (ctxDef?.name ?? t('flags.unknownField', { id: String(contextDefId) }))}
        </span>
        <OperatorBadge operator={operator} contextType={contextType} />
        <span className="flex-1 min-w-0 text-caption text-foreground/80 truncate">
          {displayValues}
        </span>
        <span
          className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-brand rotate-90' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`}
        >
          <ChevronRight size={14} />
        </span>
      </button>

      {isActive && (
        <div
          id={`${id}-body`}
          className="bg-accent dark:bg-brand/3 border border-t-0 border-brand/30 dark:border-brand/30 rounded-b-lg px-3.5 py-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="space-y-2">
            <label className="text-caption font-semibold text-muted-foreground/80">
              {t('flags.detailCard.context')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {contexts.map((ctx) => (
                <button
                  key={ctx.id}
                  type="button"
                  aria-pressed={hasContext && contextDefId === ctx.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextChange(ctx.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-all border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                    hasContext && contextDefId === ctx.id
                      ? 'bg-brand/10 text-brand dark:text-palette-brand-800 border-brand/20'
                      : 'bg-secondary/80 text-foreground/70 hover:bg-secondary hover:text-foreground border-border'
                  }`}
                >
                  {ctx.name}
                </button>
              ))}
            </div>
          </div>

          {hasContext && (
            <div className="space-y-2">
              <label className="text-caption font-semibold text-muted-foreground/80">
                {t('flags.detailCard.operator')}
              </label>
              <OperatorSelector
                availableOps={availableOps}
                currentOperator={operator}
                onSelect={onOperatorChange}
                contextType={contextType}
              />
            </div>
          )}

          {hasContext && (
            <div className="space-y-2">
              <label className="text-caption font-semibold text-muted-foreground/80">
                {isMulti ? t('flags.detailCard.values') : t('flags.detailCard.value')}
              </label>
              {children(ctxDef?.type ?? ContextType.STRING)}
            </div>
          )}

          {hasContext && (
            <div className="space-y-2">
              <label className="text-caption font-semibold text-muted-foreground/80">
                {t('flags.detailCard.preview')}
              </label>
              <div className="px-2.5 py-1.5 bg-brand/5 rounded-lg border border-brand/10">
                <div className="flex items-center gap-1.5 text-caption">
                  <span className="font-semibold text-foreground/80">{ctxDef?.name ?? '?'}</span>
                  <OperatorBadge operator={operator} contextType={contextType} />
                  <span className={`break-all min-w-0 text-foreground/80`}>{displayValues}</span>
                </div>
              </div>
            </div>
          )}

          {!hasContext && (
            <div className="p-4 bg-warning/10 rounded-xl border border-warning/20 text-center">
              <p className="text-caption text-palette-warning-700 dark:text-palette-warning-700">{t('flags.detailCard.selectContext')}</p>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-caption font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              {t('flags.detailCard.removeCondition')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="inline-flex items-center px-4 py-2 text-caption font-semibold text-primary-foreground rounded-lg transition-colors"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--color-gradient-start), var(--color-gradient-end))',
              }}
            >
              {t('flags.detailCard.done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
