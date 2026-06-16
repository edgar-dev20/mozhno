import * as Slider from '@radix-ui/react-slider';
import { Switch } from "@/app/components/ui/switch";
import { Plus, Percent, Users, Settings, Filter, Zap } from "@/shared/icons";
import { SegmentIcon } from "@/app/components/SegmentIcon";
import { MultiValueChips } from "@/app/components/flags/MultiValueChips";
import { getDefaultOperator, getInputPlaceholder, getInputPattern, getInputHint, getInputMode, getInlineValidationError } from "@/app/components/operators";
import { OperatorBadge } from "@/app/components/OperatorBadge";
import { ConstraintRow } from "@/app/components/ConstraintRow";
import { DateTimePicker } from "@/shared/components/DateTimePicker";
import { formatTimeConstraintValue } from '@/shared/format';
import { useT } from '@/i18n';
import type { SegmentResponse, ContextDefinition } from "@/api";
import type { ConstraintGroup } from "@/app/components/flags/types";

interface FlagEnvironmentPanelProps {
  envRulePercent: number;
  onEnvRulePercentChange: (v: number) => void;
  envRuleSegments: number[];
  onEnvRuleSegmentsChange: (v: number[]) => void;
  envRuleConstraintGroups: ConstraintGroup[];
  onEnvRuleConstraintGroupsChange: (v: ConstraintGroup[]) => void;
  envRuleEnabled: boolean;
  onEnvRuleEnabledChange: (v: boolean) => void;
  segments: SegmentResponse[];
  contexts: ContextDefinition[];
  activeGroupId: string | null;
  onActiveGroupIdChange: (id: string | null) => void;
}

function newGroupId(): string {
  return `g_${Math.random().toString(36).slice(2, 7)}_${Math.random().toString(36).slice(2, 5)}`;
}

export function FlagEnvironmentPanel({
  envRulePercent, onEnvRulePercentChange,
  envRuleSegments, onEnvRuleSegmentsChange,
  envRuleConstraintGroups, onEnvRuleConstraintGroupsChange,
  envRuleEnabled, onEnvRuleEnabledChange,
  segments, contexts,
  activeGroupId, onActiveGroupIdChange,
}: FlagEnvironmentPanelProps) {
  const t = useT();

  const addGroup = () => {
    onEnvRuleConstraintGroupsChange([
      ...envRuleConstraintGroups,
      {
        id: newGroupId(),
        contextDefId: 0,
        operator: 'in',
        values: [],
      },
    ]);
  };

  const hasSegments = envRuleSegments.length > 0;
  const hasConstraints = envRuleConstraintGroups.length > 0;
  const selectedSegs = envRuleSegments.map(sid => segments.find(s => s.id === sid)).filter((s): s is SegmentResponse => !!s);

  interface SummaryLine { field: string; operator: string; values: string[]; source: string; contextType?: string; }
  const lines: SummaryLine[] = [];
  for (const seg of selectedSegs) {
    for (const c of (seg.context ?? [])) {
      const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
      const field = ctxDef?.name ?? t('flags.unknownField', { id: String(c.contextDefinitionId) });
      const vals = (c.contextValues ?? '').split(',').map(v => v.trim()).filter(Boolean);
      const existing = lines.find(l => l.field === field && l.operator === (c.operator ?? 'in'));
      if (existing) {
        for (const v of vals) { if (!existing.values.includes(v)) existing.values.push(v); }
      } else {
        lines.push({ field, operator: c.operator ?? 'in', values: vals, source: seg.name, contextType: ctxDef?.type });
      }
    }
  }
  for (const g of envRuleConstraintGroups) {
    if (g.contextDefId === 0) continue;
    const ctxDef = contexts.find(cd => cd.id === g.contextDefId);
    const field = ctxDef?.name ?? t('flags.unknownField', { id: String(g.contextDefId) });
    const existing = lines.find(l => l.field === field && l.operator === g.operator);
    if (existing) {
      for (const v of g.values) { if (!existing.values.includes(v)) existing.values.push(v); }
      if (existing.source !== 'custom') existing.source = existing.source + ' + custom';
    } else {
      lines.push({ field, operator: g.operator, values: [...g.values], source: 'custom', contextType: ctxDef?.type });
    }
  }

  const hasSummary = envRulePercent !== 100 || hasSegments || hasConstraints;

  const formatValues = (values: string[]): string => {
    if (values.length === 0) return '∅';
    if (values.length === 1) return values[0];
    const display = values.slice(0, 3).join(', ');
    return values.length > 3 ? `[${display}, ...]` : `[${display}]`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">{t('flags.environmentTitle')}</h4>
          <p className="text-xs text-muted-foreground/80 mt-0.5">{t('flags.environmentDescription')}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-medium text-muted-foreground/80">{envRuleEnabled ? t('common.enabled') : t('flags.off')}</span>
          <Switch
            checked={envRuleEnabled}
            onCheckedChange={onEnvRuleEnabledChange}
            className="!bg-switch-background data-[state=checked]:!bg-indigo-600 dark:data-[state=checked]:!bg-indigo-500"
          />
        </div>
      </div>

      <div className="p-5 bg-secondary/50 rounded-xl border border-border space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <Percent size={14} className="text-indigo-600 dark:text-indigo-400" />{t('flags.rolloutPercentage')}
            </label>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{envRulePercent}%</span>
          </div>
          <Slider.Root value={[envRulePercent]} onValueChange={([v]) => onEnvRulePercentChange(v)} max={100} step={1} className="relative flex items-center select-none touch-none w-full h-5">
            <Slider.Track className="bg-accent relative grow rounded-full h-2.5">
              <Slider.Range className="absolute bg-indigo-600 dark:bg-indigo-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-white border-2 border-brand rounded-full shadow-lg focus:outline-none" />
          </Slider.Root>
          <p className="text-xs text-muted-foreground/80">
            {envRulePercent === 100 ? t('flags.fullRollout') : envRulePercent === 0 ? t('flags.flagOff') : t('flags.percentUsers', { percent: String(envRulePercent) })}
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
            <label className="text-sm font-medium text-foreground/80">{t('flags.targetSegments')}</label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {segments.map(seg => {
              const checked = envRuleSegments.includes(seg.id);
              const hasContext = (seg.context?.length ?? 0) > 0;
              const segColor = seg.color || '#3b82f6';
              return (
                <div
                  key={seg.id}
                  onClick={() => onEnvRuleSegmentsChange(checked ? envRuleSegments.filter(id => id !== seg.id) : [...envRuleSegments, seg.id])}
                  className={`group cursor-pointer flex flex-col p-3.5 rounded-lg transition-all border ${checked ? 'shadow-sm' : 'bg-input-bg border-border hover:border-border hover:shadow-sm'}`}
                  style={checked ? { backgroundColor: segColor + '0D', borderColor: segColor + '40' } : undefined}
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5" style={{ backgroundColor: segColor }}>
                      <SegmentIcon name={seg.icon || 'Users'} size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground/90">{seg.name}</div>
                      {seg.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{seg.description}</div>}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <div role="checkbox" aria-checked={checked} tabIndex={0} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onEnvRuleSegmentsChange(checked ? envRuleSegments.filter(id => id !== seg.id) : [...envRuleSegments, seg.id]); } }} className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border-2 ${checked ? '' : 'border-border'}`} style={checked ? { backgroundColor: segColor, borderColor: segColor } : undefined}>
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                      {checked && hasContext && (
                        <div className="mt-2.5 space-y-1">
                          {seg.context!.map((c, ci) => {
                            const ctxDef = contexts.find(cd => cd.id === c.contextDefinitionId);
                            const sCtxType = ctxDef?.type;
                            const sDisplayValues = sCtxType === 'time'
                              ? (c.contextValues ?? '').split(',').map(v => formatTimeConstraintValue(v.trim())).join(', ')
                              : c.contextValues;
                            return (
                          <div key={ci} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border" style={{ backgroundColor: segColor + '0F', borderColor: segColor + '1A' }}>
                            <span className="font-semibold shrink-0" style={{ color: segColor }}>{ctxDef?.name ?? `#${c.contextDefinitionId}`}</span>
                            <OperatorBadge operator={c.operator ?? 'in'} contextType={sCtxType} className="opacity-60" />
                            <span className="break-all min-w-0 opacity-90" style={{ color: segColor }}>{sDisplayValues}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                </div>
              );
            })}
          </div>
          {envRuleSegments.length === 0 && <p className="text-xs text-muted-foreground/80 mt-2 ml-1">{t('flags.noSegmentsSelected')}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
              <label className="text-sm font-medium text-foreground/80">{t('flags.additionalConditions')}</label>
              <span className="inline-flex items-center text-xs px-1.5 py-1 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium leading-none">{t('flags.configurable')}</span>
            </div>
            <button onClick={addGroup} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"><Plus size={12} />{t('common.add')}</button>
          </div>
          <div className="space-y-1.5">
            {envRuleConstraintGroups.map((g) => {
              const isActive = activeGroupId === g.id;
              const isMulti = g.operator === 'in' || g.operator === 'not_in';

              const updateGroup = (upd: Partial<ConstraintGroup>) => {
                onEnvRuleConstraintGroupsChange(
                  envRuleConstraintGroups.map(c => c.id === g.id ? { ...c, ...upd } : c),
                );
              };

              const handleToggle = () => onActiveGroupIdChange(isActive ? null : g.id);

              const handleRemove = () => {
                onEnvRuleConstraintGroupsChange(
                  envRuleConstraintGroups.filter(c => c.id !== g.id),
                );
                if (isActive) onActiveGroupIdChange(null);
              };

              const handleContextChange = (ctxId: number) => {
                const ctx = contexts.find(c => c.id === ctxId);
                updateGroup({ contextDefId: ctxId, operator: getDefaultOperator(ctx?.type) });
              };

              const handleOperatorChange = (op: string) => {
                const newIsMulti = op === 'in' || op === 'not_in';
                const values = (!newIsMulti && g.values.length > 1)
                  ? [g.values[0]]
                  : g.values;
                updateGroup({ operator: op, values });
              };

              return (
                <ConstraintRow
                  key={g.id}
                  id={g.id}
                  contextDefId={g.contextDefId}
                  operator={g.operator}
                  valuesPreview={formatValues(g.values)}
                  contexts={contexts}
                  isActive={isActive}
                  onToggle={handleToggle}
                  onContextChange={handleContextChange}
                  onOperatorChange={handleOperatorChange}
                  onRemove={handleRemove}
                >
                  {(contextType) => isMulti ? (
                    <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                      <MultiValueChips
                        values={g.values}
                        onChange={(vals) => updateGroup({ values: vals })}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {contextType === 'time' ? (
                        <DateTimePicker
                          value={g.values[0] ?? ''}
                          onChange={(iso) => updateGroup({ values: iso ? [iso] : [] })}
                          placeholder={t('flags.valuePlaceholder')}
                        />
                      ) : (
                        <input
                          type="text"
                          inputMode={getInputMode(contextType) as React.HTMLAttributes<HTMLInputElement>['inputMode']}
                          pattern={getInputPattern(contextType)}
                          placeholder={getInputPlaceholder(contextType) || t('flags.valuePlaceholder')}
                          value={g.values[0] ?? ''}
                          onChange={(e) => updateGroup({ values: [e.target.value] })}
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.setCustomValidity(getInlineValidationError(contextType, input.value.trim()));
                          }}
                          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-red-400 dark:invalid:border-red-500"
                          autoFocus
                        />
                      )}
                      {contextType !== 'string' && contextType !== 'time' && (
                        <p className="text-[11px] text-muted-foreground/60 ml-0.5">{getInputHint(contextType)}</p>
                      )}
                    </div>
                  )}
                </ConstraintRow>
              );
            })}
            {envRuleConstraintGroups.length === 0 && (
              <div className="p-4 bg-input-background rounded-lg border border-dashed border-border dark:border-neutral-700 text-center">
                <p className="text-xs text-muted-foreground">{t('flags.noConstraints')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasSummary && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-brand" />
            <label className="text-sm font-medium text-foreground/80">{t('flags.summaryExpression')}</label>
            <span className="inline-flex items-center text-xs px-1.5 py-1 rounded bg-brand/10 text-brand font-medium leading-none">{t('flags.tactic')}</span>
          </div>
          <div className="bg-gradient-to-br from-brand/10 to-indigo-50 dark:from-brand/5 dark:to-indigo-500/5 rounded-xl border border-brand/20 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                  <Percent size={16} className="text-brand" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-brand">{envRulePercent}%</span>
                  <span className="text-sm text-muted-foreground ml-1.5">{t('flags.of')} {hasSegments ? selectedSegs.map(s => s.name).join(', ') : t('flags.allUsers')}</span>
                </div>
              </div>
              {lines.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    <Filter size={10} />
                    {t('flags.and')}
                  </div>
                  <div className="space-y-1.5">
                    {lines.map((line, li) => {
                      const isTimeType = line.contextType === 'time';
                      const displayValues = isTimeType
                        ? line.values.map(v => formatTimeConstraintValue(v))
                        : line.values;
                      return (
                        <div key={li} className="flex items-center gap-1.5 text-[11px] bg-input-background/70 rounded-lg p-2.5 border border-brand/10">
                          <span className="font-semibold text-foreground/80 shrink-0">{line.field}</span>
                          <OperatorBadge operator={line.operator} contextType={line.contextType} />
                          <span className={`break-all min-w-0 text-foreground/80`}>
                            {displayValues.length === 1
                              ? displayValues[0]
                              : displayValues.length <= 3
                                ? `[${displayValues.join(', ')}]`
                                : `[${displayValues.slice(0, 3).join(', ')}, +${displayValues.length - 3}]`
                            }
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0 ml-auto" title={line.source}>← {line.source === 'custom' ? t('flags.customSource') : line.source}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {!hasSegments && !hasConstraints && envRulePercent !== 100 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                  <Filter size={12} />
                  {t('flags.noConditionsGlobal')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Settings size={12} className="text-white" />
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">{t('flags.howTargetingWorks')}</h5>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">{t('flags.howTargetingWorksDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
