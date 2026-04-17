import * as Slider from '@radix-ui/react-slider';
import { Switch } from "@/app/components/ui/switch";
import { Plus, Percent, Users, Settings, X, Filter, Zap } from "@/shared/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { SegmentIcon } from "@/app/components/SegmentIcon";
import { getOperatorsForType, getDefaultOperator, OPERATOR_LABELS } from "@/app/components/operators";
import { useT } from '@/i18n';
import type { SegmentResponse, ContextDefinition } from "@/api";
import type { ConstraintEntry } from "@/app/components/flags/types";

interface FlagEnvironmentPanelProps {
  envRulePercent: number;
  onEnvRulePercentChange: (v: number) => void;
  envRuleSegments: number[];
  onEnvRuleSegmentsChange: (v: number[]) => void;
  envRuleConstraints: ConstraintEntry[];
  onEnvRuleConstraintsChange: (v: ConstraintEntry[]) => void;
  envRuleEnabled: boolean;
  onEnvRuleEnabledChange: (v: boolean) => void;
  segments: SegmentResponse[];
  contexts: ContextDefinition[];
}

export function FlagEnvironmentPanel({
  envRulePercent, onEnvRulePercentChange,
  envRuleSegments, onEnvRuleSegmentsChange,
  envRuleConstraints, onEnvRuleConstraintsChange,
  envRuleEnabled, onEnvRuleEnabledChange,
  segments, contexts,
}: FlagEnvironmentPanelProps) {
  const t = useT();

  const addConstraint = () => {
    const defaultCtx = contexts[0];
    const operator = getDefaultOperator(defaultCtx?.type);
    onEnvRuleConstraintsChange([...envRuleConstraints, { contextDefId: defaultCtx?.id ?? 0, operator, value: '' }]);
  };

  const removeConstraint = (idx: number) => {
    onEnvRuleConstraintsChange(envRuleConstraints.filter((_, i) => i !== idx));
  };

  const updateConstraint = (idx: number, field: keyof ConstraintEntry, val: string | number) => {
    onEnvRuleConstraintsChange(envRuleConstraints.map((c, i) => {
      if (i !== idx) return c;
      if (field === 'contextDefId') {
        const ctx = contexts.find(x => x.id === Number(val));
        return { ...c, contextDefId: Number(val), operator: getDefaultOperator(ctx?.type) };
      }
      return { ...c, [field]: val };
    }));
  };

  const hasSegments = envRuleSegments.length > 0;
  const hasConstraints = envRuleConstraints.length > 0;
  const selectedSegs = envRuleSegments.map(sid => segments.find(s => s.id === sid)).filter((s): s is SegmentResponse => !!s);

  interface SummaryLine { field: string; operator: string; values: string[]; source: string; }
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
        lines.push({ field, operator: c.operator ?? 'in', values: vals, source: seg.name });
      }
    }
  }
  for (const c of envRuleConstraints) {
    const ctxDef = contexts.find(cd => cd.id === c.contextDefId);
    const field = ctxDef?.name ?? t('flags.unknownField', { id: String(c.contextDefId) });
    const existing = lines.find(l => l.field === field && l.operator === c.operator);
    if (existing) {
      if (!existing.values.includes(c.value)) existing.values.push(c.value);
      if (existing.source !== 'custom') existing.source = existing.source + ' + custom';
    } else {
      lines.push({ field, operator: c.operator, values: [c.value], source: 'custom' });
    }
  }

  const hasSummary = envRulePercent !== 100 || hasSegments || hasConstraints;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">{t('flags.environmentTitle')}</h4>
          <p className="text-xs text-muted-foreground/80 mt-0.5">{t('flags.environmentDescription')}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-muted-foreground/80">{envRuleEnabled ? t('common.enabled') : t('flags.off')}</span>
          <Switch checked={envRuleEnabled} onCheckedChange={onEnvRuleEnabledChange} />
        </label>
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
            <Slider.Thumb className="block w-6 h-6 bg-white border-2 border-violet-600 dark:border-violet-500 rounded-full shadow-lg hover:bg-violet-50 dark:hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2" />
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
                  className={`group cursor-pointer flex flex-col p-3.5 rounded-xl transition-all border ${checked ? 'shadow-sm' : 'bg-input-bg border-border hover:border-border hover:shadow-sm'}`}
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
                        return (
                          <div key={ci} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border" style={{ backgroundColor: segColor + '0F', borderColor: segColor + '1A' }}>
                            <span className="font-semibold shrink-0" style={{ color: segColor }}>{ctxDef?.name ?? `#${c.contextDefinitionId}`}</span>
                            <span className="text-xs uppercase font-mono tracking-wider opacity-60" style={{ color: segColor }}>{c.operator ?? 'in'}</span>
                            <code className="font-mono break-all min-w-0 opacity-90" style={{ color: segColor }}>{c.contextValues}</code>
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
            <button onClick={addConstraint} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 font-medium"><Plus size={12} />{t('common.add')}</button>
          </div>
          <div className="space-y-2">
            {envRuleConstraints.map((c, ci) => (
              <div key={ci} className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t('flags.constraintCondition', { n: String(ci + 1) })}</span>
                  <button onClick={() => removeConstraint(ci)} className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"><X size={14} /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">{t('flags.attribute')}</label>
                    <Select value={String(c.contextDefId)} onValueChange={(v) => updateConstraint(ci, 'contextDefId', Number(v))}>
                      <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                      <SelectContent>{contexts.map(ctx => <SelectItem key={ctx.id} value={String(ctx.id)}>{ctx.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">{t('flags.condition')}</label>
                    <Select value={c.operator} onValueChange={(v) => updateConstraint(ci, 'operator', v)}>
                      <SelectTrigger size="sm" className="w-full text-xs [&>span]:text-xs rounded-md"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {getOperatorsForType(contexts.find(ctx => ctx.id === c.contextDefId)?.type).map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">{t('flags.valueLabel')}</label>
                    <input type="text" value={c.value} onChange={e => updateConstraint(ci, 'value', e.target.value)} placeholder={t('flags.valuePlaceholder')} className="w-full bg-secondary border border-border rounded-md px-2.5 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" />
                  </div>
                </div>
              </div>
            ))}
            {envRuleConstraints.length === 0 && <div className="p-4 bg-white dark:bg-neutral-950 rounded-lg border border-dashed border-border dark:border-neutral-700 text-center"><p className="text-xs text-muted-foreground">{t('flags.noConstraints')}</p></div>}
          </div>
        </div>
      </div>

      {hasSummary && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-violet-600 dark:text-violet-400" />
            <label className="text-sm font-medium text-foreground/80">{t('flags.summaryExpression')}</label>
            <span className="inline-flex items-center text-xs px-1.5 py-1 rounded bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium leading-none">{t('flags.tactic')}</span>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/5 dark:to-indigo-500/5 rounded-xl border border-violet-200 dark:border-violet-500/20 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 flex items-center justify-center">
                  <Percent size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-violet-700 dark:text-violet-300">{envRulePercent}%</span>
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
                    {lines.map((line, li) => (
                      <div key={li} className="flex items-center gap-2 text-xs bg-white/70 dark:bg-neutral-900/50 rounded-lg px-3 py-2 border border-violet-100 dark:border-violet-500/10">
                        <span className="font-semibold text-foreground/80 shrink-0">{line.field}</span>
                        <span className="inline-flex items-center font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-1 rounded shrink-0 leading-none">{OPERATOR_LABELS[line.operator] ?? line.operator}</span>
                        <code className="font-mono text-foreground/80 break-all min-w-0">
                          {line.values.length === 1 ? line.values[0] : `[${line.values.join(', ')}]`}
                        </code>
                        <span className="text-xs text-muted-foreground shrink-0 ml-auto" title={line.source}>← {line.source === 'custom' ? t('flags.customSource') : line.source}</span>
                      </div>
                    ))}
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