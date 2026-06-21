import { useRef } from 'react';
import { X, Trash2 } from '@/shared/icons';
import { MultiValueChips } from '@/app/components/flags/MultiValueChips';
import { ContextType } from '@/app/components/contextTypes';
import { isMultiOperator } from '@/app/components/operatorsMeta';
import {
  getOperatorsForType,
  getInputPlaceholder,
  getInputPattern,
  getInputHint,
  getInputMode,
  getInlineValidationError,
} from '@/app/components/operators';
import { OperatorSelector } from '@/app/components/OperatorSelector';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { DateTimePicker } from '@/shared/components/DateTimePicker';
import { formatTimeConstraintValue } from '@/shared/format';
import { useT } from '@/i18n';
import type { ConstraintGroup } from '@/app/components/flags/types';
import type { ContextDefinition } from '@/api';

interface DetailCardProps {
  group: ConstraintGroup | null;
  contexts: ContextDefinition[];
  onChange: (group: ConstraintGroup) => void;
  onRemove: () => void;
  onClose: () => void;
}

const CARD_TRANSITION =
  'transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms cubic-bezier(0.16,1,0.3,1)';

export function DetailCard({
  group,
  contexts,
  onChange,
  onRemove,
  onClose,
}: DetailCardProps) {
  const t = useT();
  const cardRef = useRef<HTMLDivElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  const hasContext = group !== null && group.contextDefId !== 0;
  const isMulti = isMultiOperator(group?.operator ?? '');
  const ctxDef = hasContext ? (Array.isArray(contexts) ? contexts.find((c) => c.id === group?.contextDefId) : undefined) : undefined;
  const contextType = ctxDef?.type;

  const isOpen = group !== null;
  const shouldRender = group !== null;

  const handleTransitionEnd = () => {};

  const previewValues = group?.values.length
    ? group.values.length === 1
      ? contextType === ContextType.TIME
        ? formatTimeConstraintValue(group.values[0])
        : group.values[0]
      : group.values.length <= 3
        ? `(${(contextType === 'time' ? group.values.map(formatTimeConstraintValue) : group.values).join(', ')})`
        : `(${(contextType === 'time' ? group.values.slice(0, 3).map(formatTimeConstraintValue) : group.values.slice(0, 3)).join(', ')}, +${group.values.length - 3})`
    : '∅';

  const cardStyle: React.CSSProperties = {
    transition: CARD_TRANSITION,
    transform: isOpen ? 'translateX(calc(-100% - 3.5rem))' : 'translateX(0)',
    boxShadow: isOpen ? '-8px 6px 40px rgba(0,0,0,0.12)' : 'none',
    pointerEvents: shouldRender ? 'auto' : 'none',
  };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      onTransitionEnd={handleTransitionEnd}
      className="fixed top-[68px] right-4 w-[520px] max-h-[calc(100vh-80px)] z-[46] bg-card border border-border rounded-2xl flex flex-col overflow-hidden"
    >
      {!group ? (
        <div className="flex-1" />
      ) : (
        <div className="flex flex-col h-full animate-in fade-in duration-300 delay-100 fill-mode-forwards">
          <div className="flex-shrink-0 px-5 py-4 border-b border-border flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{t('flags.detailCard.title')}</h4>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                {t('flags.detailCard.context')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {contexts.map((ctx) => (
                  <button
                    key={ctx.id}
                    onClick={() => handleContextChange(ctx.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      hasContext && group.contextDefId === ctx.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary/80 text-foreground/70 hover:bg-secondary hover:text-foreground border border-border'
                    }`}
                  >
                    {ctx.name}
                  </button>
                ))}
              </div>
            </div>

            {hasContext && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  {t('flags.detailCard.operator')}
                </label>
                <OperatorSelector
                  availableOps={getOperatorsForType(contextType)}
                  currentOperator={group.operator}
                  onSelect={handleOperatorChange}
                  contextType={contextType}
                />
              </div>
            )}

            {hasContext && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  {isMulti ? t('flags.detailCard.values') : t('flags.detailCard.value')}
                </label>
                {isMulti ? (
                  <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                    <MultiValueChips
                      key={group.id}
                      values={group.values}
                      onChange={(vals) => onChange({ ...group, values: vals })}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {ctxDef?.type === ContextType.TIME ? (
                      <DateTimePicker
                        value={group.values[0] ?? ''}
                        onChange={(iso) => onChange({ ...group, values: iso ? [iso] : [] })}
                        placeholder={t('flags.valuePlaceholder')}
                      />
                    ) : (
                      <input
                        ref={singleInputRef}
                        type="text"
                        inputMode={
                          getInputMode(
                            ctxDef?.type,
                          ) as React.HTMLAttributes<HTMLInputElement>['inputMode']
                        }
                        pattern={getInputPattern(ctxDef?.type)}
                        placeholder={
                          getInputPlaceholder(ctxDef?.type) || t('flags.valuePlaceholder')
                        }
                        value={group.values[0] ?? ''}
                        onChange={(e) => onChange({ ...group, values: [e.target.value] })}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          input.setCustomValidity(
                            getInlineValidationError(ctxDef?.type, input.value.trim()),
                          );
                        }}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-red-400 dark:invalid:border-red-500"
                      />
                    )}
                    {ctxDef?.type && ctxDef.type !== ContextType.STRING && ctxDef.type !== ContextType.TIME && (
                      <p className="text-[11px] text-muted-foreground/60 ml-0.5">
                        {getInputHint(ctxDef.type)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {hasContext && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  {t('flags.detailCard.preview')}
                </label>
                <div className="p-2.5 bg-brand/5 rounded-lg border border-brand/10">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-foreground/80">{ctxDef?.name ?? '?'}</span>
                    <OperatorBadge operator={group.operator} contextType={contextType} />
                    <code
                      className={`break-all min-w-0 ${contextType === ContextType.TIME ? 'text-foreground/80' : 'font-mono text-foreground/80'}`}
                    >
                      {previewValues}
                    </code>
                  </div>
                </div>
              </div>
            )}
            {!hasContext && group && (
              <div className="p-4 bg-warning/5 rounded-xl border border-warning/10 text-center">
                <p className="text-xs text-warning">{t('flags.detailCard.selectContext')}</p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 px-5 py-4 border-t border-border flex justify-between gap-3 bg-secondary/30">
            <button
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              {t('flags.detailCard.removeCondition')}
            </button>
            <button
              onClick={canDone ? onClose : undefined}
              disabled={!canDone}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
