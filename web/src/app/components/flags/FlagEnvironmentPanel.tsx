import * as Slider from '@radix-ui/react-slider';
import { Fragment } from 'react';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Percent, Users, Settings, Filter, X } from '@/shared/icons';
import { SegmentIcon } from '@/app/components/SegmentIcon';
import { ColorIcon } from '@/shared';
import { isMultiOperator } from '@/app/components/operatorsMeta';
import { MultiValueChips } from '@/app/components/flags/MultiValueChips';
import { ContextType } from '@/app/components/contextTypes';
import {
  getDefaultOperator,
  getInputPlaceholder,
  getInputPattern,
  getInputHint,
  getInputMode,
  getInlineValidationError,
} from '@/app/components/operators';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { ConstraintRow } from '@/app/components/ConstraintRow';
import { Operator } from '@/app/components/operatorsMeta';
import { DateTimePicker } from '@/shared/components/DateTimePicker';
import { formatTimeConstraintValue } from '@/shared/format';
import { useT } from '@/i18n';
import type { SegmentResponse, ContextDefinition } from '@/api';
import type { ConstraintGroup } from '@/app/components/flags/types';

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
  envName?: string;
}

export function FlagEnvironmentPanel({
  envRulePercent,
  onEnvRulePercentChange,
  envRuleSegments,
  onEnvRuleSegmentsChange,
  envRuleConstraintGroups,
  onEnvRuleConstraintGroupsChange,
  envRuleEnabled,
  onEnvRuleEnabledChange,
  segments,
  contexts,
  activeGroupId,
  onActiveGroupIdChange,
  envName,
}: FlagEnvironmentPanelProps) {
  const t = useT();

  function newGroupId(): string {
    return `g_${Math.random().toString(36).slice(2, 7)}_${Math.random().toString(36).slice(2, 5)}`;
  }

  const addGroup = () => {
    onEnvRuleConstraintGroupsChange([
      ...envRuleConstraintGroups,
      {
        id: newGroupId(),
        contextDefId: 0,
        operator: Operator.IN,
        values: [],
      },
    ]);
  };

  const hasSegments = envRuleSegments.length > 0;
  const hasConstraints = envRuleConstraintGroups.length > 0;
  const selectedSegs = envRuleSegments
    .map((sid) => Array.isArray(segments) ? segments.find((s) => s.id === sid) : undefined)
    .filter((s): s is SegmentResponse => !!s);

  interface SummaryLine {
    field: string;
    operator: string;
    values: string[];
    source: string;
    contextType?: string;
  }
  const lines: SummaryLine[] = [];
  for (const seg of selectedSegs) {
    for (const c of seg.context ?? []) {
      const ctxDef = Array.isArray(contexts) ? contexts.find((cd) => cd.id === c.contextDefinitionId) : undefined;
      const field = ctxDef?.name ?? t('flags.unknownField', { id: String(c.contextDefinitionId) });
      const vals = (c.contextValues ?? '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      lines.push({
        field,
        operator: c.operator ?? Operator.IN,
        values: vals,
        source: seg.name,
        contextType: ctxDef?.type,
      });
    }
  }
  for (const g of envRuleConstraintGroups) {
    if (g.contextDefId === 0) continue;
    const ctxDef = contexts.find((cd) => cd.id === g.contextDefId);
    const field = ctxDef?.name ?? t('flags.unknownField', { id: String(g.contextDefId) });
    lines.push({
      field,
      operator: g.operator,
      values: g.values.filter((v) => v.trim() !== ''),
      source: 'custom',
      contextType: ctxDef?.type,
    });
  }

  const hasSummary = true;

  const formatValues = (values: string[]): string => {
    const filtered = values.filter((v) => v.trim() !== '');
    if (filtered.length === 0) return '∅';
    if (filtered.length === 1) return filtered[0];
    const display = filtered.slice(0, 3).join(', ');
    return filtered.length > 3 ? `[${display}, +${filtered.length - 3}]` : `[${display}]`;
  };

  const sourceGroups = new Map<string, SummaryLine[]>();
  for (const line of lines) {
    if (!sourceGroups.has(line.source)) sourceGroups.set(line.source, []);
    sourceGroups.get(line.source)!.push(line);
  }

  const sourceOrder = new Map<string, number>();
  sourceOrder.set('custom', 0);
  selectedSegs.forEach((s, i) => sourceOrder.set(s.name, i + 1));

  const sortedSources = Array.from(sourceGroups.keys()).sort(
    (a, b) => (sourceOrder.get(a) ?? 99) - (sourceOrder.get(b) ?? 99),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">
            {t('flags.environmentTitle')}
            {envName ? ` ${envName}` : ''}
          </h4>
          <p className="text-xs text-muted-foreground/80 mt-0.5">
            {t('flags.environmentDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-medium text-muted-foreground/80">
            {envRuleEnabled ? t('common.enabled') : t('flags.off')}
          </span>
          <Switch
            checked={envRuleEnabled}
            onCheckedChange={onEnvRuleEnabledChange}
            className="!bg-switch-background data-[state=checked]:!bg-brand dark:data-[state=checked]:!bg-brand"
          />
        </div>
      </div>

      {hasSummary && (
        <div className="bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/5 dark:to-brand/[0.02] rounded-xl border border-brand/20 overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {envRulePercent === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  {t('flags.summaryFlagOff')}
                </span>
              ) : envRuleEnabled ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-success/10 text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  {t('flags.summaryActive')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  {t('flags.summaryManuallyDisabled')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                <Percent size={16} className="text-brand" />
              </div>
              <div>
                {envRulePercent === 0 ? (
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t('flags.flagOff')}
                  </span>
                ) : envRulePercent === 100 && !hasSegments && !hasConstraints ? (
                  <span className="text-sm font-semibold text-foreground/80">
                    {t('flags.summaryFullTraffic')}
                  </span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-brand">{envRulePercent}%</span>
                    <span className="text-sm text-muted-foreground ml-1.5">
                      {hasSegments
                        ? `${t('flags.summaryFromSegments')} ${selectedSegs.map((s) => s.name).join(', ')}`
                        : t('flags.of') + ' ' + t('flags.allUsers')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {sourceGroups.size > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                  <Filter size={10} />
                  {t('flags.summaryUnderConditions')}
                </div>
                <div className="space-y-2">
                  {sortedSources.map((source, si) => {
                    const sourceLines = sourceGroups.get(source)!;
                    const isSegment = source !== 'custom';
                    const seg = isSegment ? selectedSegs.find((s) => s.name === source) : null;
                    const groupByKey = new Map<string, SummaryLine[]>();
                    for (const line of sourceLines) {
                      const key = line.field + '|' + line.operator;
                      if (!groupByKey.has(key)) groupByKey.set(key, []);
                      groupByKey.get(key)!.push(line);
                    }
                    return (
                      <Fragment key={si}>
                        {si > 0 && (
                          <div className="flex items-center gap-2 py-0.5">
                            <div className="flex-1 h-px bg-amber-500/20" />
                            <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider px-1">
                              OR
                            </span>
                            <div className="flex-1 h-px bg-amber-500/20" />
                          </div>
                        )}
                        <div className="bg-input-background/70 rounded-lg border border-brand/10 overflow-hidden">
                          <div className="px-3 py-2 bg-brand/5 border-b border-brand/10 flex items-center gap-2">
                            {seg && (
                              <ColorIcon
                                size="xs"
                                color={seg.color ?? '#6b7280'}
                                icon={<SegmentIcon name={seg.icon ?? 'Users'} size={9} />}
                                darkDim={false}
                              />
                            )}
                            <span className="text-xs font-semibold text-brand">
                              {source === 'custom' ? t('flags.customSource') : source}
                            </span>
                          </div>
                          <div className="px-3 py-2 space-y-1.5">
                            {Array.from(groupByKey.entries()).map(([_key, keyLines], fi) => {
                              const line = keyLines[0];
                              const isTimeType = line.contextType === ContextType.TIME;
                              const allValues = keyLines.flatMap((l) => l.values).filter((v) => v.trim() !== '');
                              const displayValues = isTimeType
                                ? allValues.map((v) => formatTimeConstraintValue(v))
                                : allValues;
                              return (
                                <div key={fi} className="space-y-1.5">
                                  {fi > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-px bg-brand/15" />
                                      <span className="text-[10px] font-bold text-brand/60 uppercase tracking-wider px-1">
                                        AND
                                      </span>
                                      <div className="flex-1 h-px bg-brand/15" />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="font-semibold text-foreground/80">{line.field}</span>
                                    <OperatorBadge operator={line.operator} contextType={line.contextType} />
                                    <span className="break-all min-w-0 text-foreground/80">
                                      {displayValues.length === 1
                                        ? displayValues[0]
                                        : displayValues.length <= 3
                                          ? `[${displayValues.join(', ')}]`
                                          : `[${displayValues.slice(0, 3).join(', ')}, +${displayValues.length - 3}]`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasSegments && !hasConstraints && envRulePercent !== 100 && envRulePercent !== 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <Filter size={12} />
                {t('flags.noConditionsGlobal')}
              </div>
            )}

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-brand/10">
              {selectedSegs.length > 0 && (
                <span>
                  {t('flags.summaryStatsSegments')}:{' '}
                  <strong className="text-foreground/80">{selectedSegs.length}</strong>
                  {selectedSegs.length > 1 && (
                    <span className="text-brand/70 font-medium"> {t('flags.summaryLogicOrSegments')}</span>
                  )}
                </span>
              )}
              {sourceGroups.size > 0 && (
                <span>
                  {t('flags.summaryStatsConditions')}:{' '}
                  <strong className="text-foreground/80">{sourceGroups.size}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-5 bg-secondary/50 rounded-xl border border-border space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <Percent size={14} className="text-brand" />
              {t('flags.rolloutPercentage')}
            </label>
            <span className="text-lg font-bold text-brand">{envRulePercent}%</span>
          </div>
          <Slider.Root
            value={[envRulePercent]}
            onValueChange={([v]) => onEnvRulePercentChange(v)}
            max={100}
            step={1}
            className="relative flex items-center select-none touch-none w-full h-5"
          >
            <Slider.Track className="bg-accent relative grow rounded-full h-2.5">
              <Slider.Range className="absolute bg-brand rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-6 h-6 bg-white border-2 border-brand rounded-full shadow-lg focus:outline-none" />
          </Slider.Root>
          <p className="text-xs text-muted-foreground/80">
            {envRulePercent === 100
              ? t('flags.fullRollout')
              : envRulePercent === 0
                ? t('flags.flagOff')
                : t('flags.percentUsers', { percent: String(envRulePercent) })}
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-brand" />
            <label className="text-sm font-medium text-foreground/80">
              {t('flags.targetSegments')}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {segments.map((seg) => {
              const checked = envRuleSegments.includes(seg.id);
              const hasContext = (seg.context?.length ?? 0) > 0;
              const segColor = seg.color || '#3b82f6';
              return (
                <div
                  key={seg.id}
                  onClick={() =>
                    onEnvRuleSegmentsChange(
                      checked
                        ? envRuleSegments.filter((id) => id !== seg.id)
                        : [...envRuleSegments, seg.id],
                    )
                  }
                  className={`group cursor-pointer flex flex-col p-3.5 rounded-lg transition-all border ${checked ? 'shadow-sm' : 'bg-input-bg border-border hover:border-border hover:shadow-sm'}`}
                  style={
                    checked
                      ? { backgroundColor: segColor + '0D', borderColor: segColor + '40' }
                      : undefined
                  }
                >
                  <div className="flex gap-3">
                    <ColorIcon
                      variant="gradient"
                      size="md"
                      color={segColor}
                      icon={<SegmentIcon name={seg.icon || 'Users'} size={16} />}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground/90">{seg.name}</div>
                      {seg.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {seg.description}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <div
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            onEnvRuleSegmentsChange(
                              checked
                                ? envRuleSegments.filter((id) => id !== seg.id)
                                : [...envRuleSegments, seg.id],
                            );
                          }
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border-2 ${checked ? '' : 'border-border'}`}
                        style={
                          checked ? { backgroundColor: segColor, borderColor: segColor } : undefined
                        }
                      >
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  {checked && hasContext && (
                    <div className="mt-2.5 space-y-1">
                      {seg.context!.map((c, ci) => {
                        const ctxDef = Array.isArray(contexts) ? contexts.find((cd) => cd.id === c.contextDefinitionId) : undefined;
                        const sCtxType = ctxDef?.type;
                        const sDisplayValues =
                          sCtxType === ContextType.TIME
                            ? (c.contextValues ?? '')
                                .split(',')
                                .map((v) => formatTimeConstraintValue(v.trim()))
                                .join(', ')
                            : c.contextValues;
                        return (
                          <div
                            key={ci}
                            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border"
                            style={{
                              backgroundColor: segColor + '0F',
                              borderColor: segColor + '1A',
                            }}
                          >
                            <span className="font-semibold shrink-0" style={{ color: segColor }}>
                              {ctxDef?.name ?? `#${c.contextDefinitionId}`}
                            </span>
                            <OperatorBadge
                              operator={c.operator ?? Operator.IN}
                              contextType={sCtxType}
                              className="opacity-60"
                            />
                            <span
                              className="break-all min-w-0 opacity-90"
                              style={{ color: segColor }}
                            >
                              {sDisplayValues}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {envRuleSegments.length === 0 && (
            <p className="text-xs text-muted-foreground/80 mt-2 ml-1">
              {t('flags.noSegmentsSelected')}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-brand" />
              <label className="text-sm font-medium text-foreground/80">
                {t('flags.additionalConditions')}
              </label>
              <span className="inline-flex items-center text-xs px-1.5 py-1 rounded bg-brand/10 text-brand font-medium leading-none">
                {t('flags.configurable')}
              </span>
            </div>
            <button
              onClick={addGroup}
              className="text-xs text-brand hover:text-brand/70 flex items-center gap-1 font-medium"
            >
              <Plus size={12} />
              {t('common.add')}
            </button>
          </div>
          <div className="space-y-1.5">
            {envRuleConstraintGroups.map((g) => {
              const isActive = activeGroupId === g.id;
              const isMulti = isMultiOperator(g.operator);

              const updateGroup = (upd: Partial<ConstraintGroup>) => {
                onEnvRuleConstraintGroupsChange(
                  envRuleConstraintGroups.map((c) => (c.id === g.id ? { ...c, ...upd } : c)),
                );
              };

              const handleToggle = () => onActiveGroupIdChange(isActive ? null : g.id);

              const handleRemove = () => {
                onEnvRuleConstraintGroupsChange(
                  envRuleConstraintGroups.filter((c) => c.id !== g.id),
                );
                if (isActive) onActiveGroupIdChange(null);
              };

              const handleContextChange = (ctxId: number) => {
                const ctx = Array.isArray(contexts) ? contexts.find((c) => c.id === ctxId) : undefined;
                updateGroup({ contextDefId: ctxId, operator: getDefaultOperator(ctx?.type) });
              };

              const handleOperatorChange = (op: string) => {
                const newIsMulti = isMultiOperator(op);
                const values = !newIsMulti && g.values.length > 1 ? [g.values[0]] : g.values;
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
                  {(contextType) => {
                    const ctx = Array.isArray(contexts) ? contexts.find((c) => c.id === g.contextDefId) : undefined;
                    const validVals = ctx?.validValues ?? [];
                    const strict = ctx?.isStrict ?? false;
                    const hasWhitelist = validVals.length > 0;

                    const segmentsCoveredValues = new Map<string, string>();
                    for (const seg of selectedSegs) {
                      for (const c of seg.context ?? []) {
                        if (c.contextDefinitionId === g.contextDefId) {
                          const vals = (c.contextValues ?? '').split(',').map((v) => v.trim()).filter(Boolean);
                          for (const v of vals) {
                            if (!segmentsCoveredValues.has(v)) {
                              segmentsCoveredValues.set(v, seg.name);
                            }
                          }
                        }
                      }
                    }
                    const hasSegmentsCovered = segmentsCoveredValues.size > 0;

                    const segmentsCoveredNote = hasSegmentsCovered ? (
                      <p className="text-[11px] text-muted-foreground/60 italic">
                        {t('flags.segmentsCoveredValuesNote')}
                      </p>
                    ) : null;

                    const renderCoveredChip = (v: string, spanCls: string) => {
                      const coveredBy = segmentsCoveredValues.get(v);
                      if (!coveredBy) return null;
                      return (
                        <span
                          key={v}
                          className={spanCls}
                          title={`${t('flags.coveredBySegment', { segment: coveredBy })}`}
                        >
                          {v}
                        </span>
                      );
                    };

                    if (isMulti) {
                      if (strict && hasWhitelist) {
                        return (
                          <div className="p-3 bg-secondary/50 rounded-xl border border-border space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {g.values.map((v, i) => {
                                const inWhitelist = !hasWhitelist || validVals.includes(v);
                                return (
                                <span
                                  key={i}
                                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-md border ${
                                    inWhitelist
                                      ? 'bg-success/10 text-success border-success/20'
                                      : 'bg-warning/10 text-warning border-warning/30'
                                  }`}
                                >
                                  {v}
                                  <button
                                    onClick={() =>
                                      updateGroup({
                                        values: g.values.filter((_, j) => j !== i),
                                      })
                                    }
                                    className={`${inWhitelist ? 'text-emerald-500' : 'text-amber-500'} hover:text-red-500 transition-colors`}
                                  >
                                    <X size={11} />
                                  </button>
                                </span>
                                );
                              })}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {validVals
                                .filter((v) => !g.values.includes(v))
                                .map((v) => {
                                  const covered = renderCoveredChip(v, 'px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground/50 border border-border/40 cursor-not-allowed');
                                  if (covered) return covered;
                                  return (
                                    <button
                                      key={v}
                                      onClick={() =>
                                        updateGroup({ values: [...g.values, v] })
                                      }
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/80 text-foreground/70 hover:bg-secondary hover:text-foreground border border-border transition-all"
                                    >
                                      + {v}
                                    </button>
                                  );
                                })}
                            </div>
                            {segmentsCoveredNote}
                            {validVals.every((v) => g.values.includes(v) || segmentsCoveredValues.has(v)) && (
                              <p className="text-[11px] text-muted-foreground">
                                {t('flags.whitelistAllSelected')}
                              </p>
                            )}
                          </div>
                        );
                      }
                      if (hasWhitelist) {
                        return (
                          <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                            <MultiValueChips
                              values={g.values}
                              onChange={(vals) => updateGroup({ values: vals })}
                              autoFocus
                              validValues={validVals}
                            />
                            {validVals.some((v) => !g.values.includes(v) && !segmentsCoveredValues.has(v)) && (
                              <div className="mt-2">
                                <p className="text-[11px] text-muted-foreground mb-1">
                                  {t('flags.whitelistSuggestions')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {validVals
                                    .filter((v) => !g.values.includes(v))
                                    .map((v) => {
                                      const covered = renderCoveredChip(v, 'px-2 py-0.5 text-xs border border-muted rounded-md text-muted-foreground/50 cursor-not-allowed');
                                      if (covered) return covered;
                                      return (
                                        <button
                                          key={v}
                                          onClick={() =>
                                            updateGroup({
                                              values: [...g.values, v],
                                            })
                                          }
                                          className="px-2 py-0.5 text-xs border border-brand/20 rounded-md text-brand hover:bg-brand/10 transition-colors"
                                        >
                                          + {v}
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                            {segmentsCoveredNote && (
                              <div className="mt-1.5">{segmentsCoveredNote}</div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                          <MultiValueChips
                            values={g.values}
                            onChange={(vals) => updateGroup({ values: vals })}
                            autoFocus
                          />
                        </div>
                      );
                    }

                    if (contextType === ContextType.TIME) {
                      return (
                        <div className="space-y-1.5">
                          <DateTimePicker
                            value={g.values[0] ?? ''}
                            onChange={(iso) => updateGroup({ values: iso ? [iso] : [] })}
                            placeholder={t('flags.valuePlaceholder')}
                          />
                        </div>
                      );
                    }

                    if (strict && hasWhitelist) {
                      return (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {validVals.map((v) => {
                              const isSelected = g.values.includes(v);
                              const covered = !isSelected ? renderCoveredChip(v, 'px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground/50 border border-border/40 cursor-not-allowed') : null;
                              if (covered) return covered;
                              return (
                                <button
                                  key={v}
                                  onClick={() => {
                                    if (isSelected) {
                                      updateGroup({ values: g.values.filter((x) => x !== v) });
                                    } else {
                                      updateGroup({ values: [v] });
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    isSelected
                                      ? 'bg-brand/10 text-brand border-brand/20'
                                      : 'bg-secondary/80 text-foreground/70 hover:bg-secondary hover:text-foreground border-border'
                                  }`}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                          {segmentsCoveredNote}
                          {g.values.length > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              {t('flags.detailCard.value')}:{' '}
                              <span className={`font-semibold ${validVals.includes(g.values[0]) ? 'text-foreground/80' : 'text-warning'}`}>
                                {g.values[0]}
                                {!validVals.includes(g.values[0]) && ' (not in whitelist)'}
                              </span>
                            </p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          inputMode={
                            getInputMode(
                              contextType,
                            ) as React.HTMLAttributes<HTMLInputElement>['inputMode']
                          }
                          pattern={getInputPattern(contextType)}
                          placeholder={
                            getInputPlaceholder(contextType) || t('flags.valuePlaceholder')
                          }
                          value={g.values[0] ?? ''}
                          onChange={(e) => updateGroup({ values: [e.target.value] })}
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.setCustomValidity(
                              getInlineValidationError(contextType, input.value.trim()),
                            );
                          }}
                          list={hasWhitelist ? `wl-${g.id}` : undefined}
                          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-red-400 dark:invalid:border-red-500"
                          autoFocus
                        />
                        {hasWhitelist && (
                          <datalist id={`wl-${g.id}`}>
                            {validVals.map((v) => (
                              <option key={v} value={v} />
                            ))}
                          </datalist>
                        )}
                        {contextType !== ContextType.STRING && contextType !== ContextType.TIME && (
                          <p className="text-[11px] text-muted-foreground/60 ml-0.5">
                            {getInputHint(contextType)}
                          </p>
                        )}
                      </div>
                    );
                  }}
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

      <div className="p-4 bg-brand/5 dark:bg-brand/10 border border-brand/20 dark:border-brand/30 rounded-lg">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
              <Settings size={12} className="text-white" />
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-brand dark:text-brand-light mb-1">
              {t('flags.howTargetingWorks')}
            </h5>
            <p className="text-xs text-brand/80 dark:text-brand-light/80">
              {t('flags.howTargetingWorksDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
