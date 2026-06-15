import { useState, useRef, useEffect } from 'react';
import { X, Trash2 } from "@/shared/icons";
import { MultiValueChips } from "@/app/components/flags/MultiValueChips";
import { getOperatorsForType, getDefaultOperator, getOperatorShortCode, getInputPlaceholder, getInputPattern, getInputHint, getInputMode } from "@/app/components/operators";
import { OperatorSelector } from "@/app/components/OperatorSelector";
import { useT } from '@/i18n';
import type { ConstraintGroup } from "@/app/components/flags/types";
import type { ContextDefinition } from "@/api";

interface DetailCardProps {
  group: ConstraintGroup | null;
  contexts: ContextDefinition[];
  initialGroup: ConstraintGroup | null;
  onChange: (group: ConstraintGroup) => void;
  onRemove: () => void;
  onClose: () => void;
}

const CARD_TRANSITION = 'transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms cubic-bezier(0.16,1,0.3,1)';

export function DetailCard({ group, contexts, initialGroup, onChange, onRemove, onClose }: DetailCardProps) {
  const t = useT();
  const cardRef = useRef<HTMLDivElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [focusedKey, setFocusedKey] = useState(0);

  const hasContext = group !== null && group.contextDefId !== 0;
  const isMulti = group?.operator === 'in' || group?.operator === 'not_in';
  const ctxDef = hasContext ? contexts.find(c => c.id === group?.contextDefId) : undefined;

  useEffect(() => {
    if (group) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => {
        setIsOpen(true);
        if (!isMulti) {
          singleInputRef.current?.focus();
        }
      });
      return () => cancelAnimationFrame(raf);
    } else if (shouldRender) {
      setIsOpen(false);
    }
  }, [group, shouldRender, isMulti]);

  const handleTransitionEnd = () => {
    if (!isOpen && !group) {
      setShouldRender(false);
    }
  };

  useEffect(() => {
    if (!group) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [group, onClose]);

  const isDirty =
    group !== null &&
    initialGroup !== null &&
    (group.contextDefId !== initialGroup.contextDefId ||
     group.operator !== initialGroup.operator ||
     JSON.stringify(group.values) !== JSON.stringify(initialGroup.values));

  const isEmpty = !group || group.contextDefId === 0 || group.values.length === 0;
  const canDone = isDirty || !isEmpty;

  if (!shouldRender && !group) return null;

  const handleContextChange = (contextDefId: number) => {
    if (!group) return;
    setFocusedKey(k => k + 1);
    const ctx = contexts.find(c => c.id === contextDefId);
    onChange({ ...group, contextDefId, operator: getDefaultOperator(ctx?.type) });
  };

  const handleOperatorChange = (op: string) => {
    if (!group) return;
    if (op !== group.operator) {
      const newIsMulti = op === 'in' || op === 'not_in';
      const values = (!newIsMulti && group.values.length > 1)
        ? [group.values[0]]
        : group.values;
      onChange({ ...group, operator: op, values });
    }
  };

  const previewOp = getOperatorShortCode(group?.operator ?? '');
  const previewValues = group?.values.length
    ? group.values.length === 1
      ? group.values[0]
      : group.values.length <= 3
        ? `(${group.values.join(', ')})`
        : `(${group.values.slice(0, 3).join(', ')}, +${group.values.length - 3})`
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
                    availableOps={getOperatorsForType(ctxDef?.type)}
                    currentOperator={group.operator}
                    onSelect={handleOperatorChange}
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
                        key={`multi-${focusedKey}`}
                        values={group.values}
                        onChange={(vals) => onChange({ ...group, values: vals })}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        ref={singleInputRef}
                        type="text"
                        inputMode={getInputMode(ctxDef?.type) as React.HTMLAttributes<HTMLInputElement>['inputMode']}
                        pattern={getInputPattern(ctxDef?.type)}
                        placeholder={getInputPlaceholder(ctxDef?.type) || t('flags.valuePlaceholder')}
                        value={group.values[0] ?? ''}
                        onChange={(e) => onChange({ ...group, values: [e.target.value] })}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const v = input.value.trim();
                          if (!v) { input.setCustomValidity(''); return; }
                          if (ctxDef?.type === 'number' && isNaN(Number(v))) input.setCustomValidity('invalid');
                          else if (ctxDef?.type === 'time' && !/^\d{2}:\d{2}$/.test(v)) input.setCustomValidity('invalid');
                          else if (ctxDef?.type === 'semver' && !/^\d+\.\d+\.\d+(-.*)?$/.test(v)) input.setCustomValidity('invalid');
                          else input.setCustomValidity('');
                        }}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-red-400 dark:invalid:border-red-500"
                      />
                      {ctxDef?.type && ctxDef.type !== 'string' && (
                        <p className="text-[11px] text-muted-foreground/60 ml-0.5">{getInputHint(ctxDef.type)}</p>
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
                  <div className="p-3 bg-brand/5 rounded-xl border border-brand/10">
                    <code className="text-sm font-mono text-brand break-all">
                      context['{ctxDef?.name ?? '?'}'] {previewOp} {previewValues}
                    </code>
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
                  backgroundImage: 'linear-gradient(to right, var(--color-gradient-start), var(--color-gradient-end))',
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
