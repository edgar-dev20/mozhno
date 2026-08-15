import * as Slider from '@radix-ui/react-slider';
import { useState, useCallback } from 'react';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Percent, Users, Settings, X } from '@/shared/icons';
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
import { ReachRules, type ReachSource, type ReachCondition } from '@/app/components/flags/ReachRules';
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

  const [glowKey, setGlowKey] = useState(0);

  const handleEnvRuleToggle = useCallback(
    (v: boolean) => {
      if (v) setGlowKey((k) => k + 1);
      onEnvRuleEnabledChange(v);
    },
    [onEnvRuleEnabledChange],
  );

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

  const toConditions = (sourceLines: SummaryLine[]): ReachCondition[] =>
    sourceLines.map((line) => ({
      field: line.field,
      operator: line.operator,
      contextType: line.contextType,
      values: line.values.filter((v) => v.trim() !== ''),
    }));

  // Every selected segment is a reach source (even without its own conditions),
  // plus a "custom" source when the env rule has additional conditions. Custom
  // is listed first, then segments in selection order. ReachRules collapses
  // conditions that share the same field + operator.
  const reachSources: ReachSource[] = [];
  const customLines = lines.filter((l) => l.source === 'custom');
  if (customLines.length > 0) {
    reachSources.push({
      key: 'custom',
      kind: 'custom',
      name: t('flags.customSource'),
      conditions: toConditions(customLines),
    });
  }
  for (const seg of selectedSegs) {
    reachSources.push({
      key: `seg-${seg.id}`,
      kind: 'segment',
      name: seg.name,
      color: seg.color,
      icon: seg.icon,
      conditions: toConditions(lines.filter((l) => l.source === seg.name)),
    });
  }
  return (    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-body-sm font-medium text-foreground">
            {t('flags.environmentTitle')}
            {envName ? ` ${envName}` : ''}
          </h4>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-caption font-medium text-muted-foreground/80">
            {envRuleEnabled ? t('common.enabled') : t('flags.off')}
          </span>
          <span key={`env-glow-${glowKey}`} className={glowKey > 0 ? 'animate-flag-on' : ''}>
            <Switch
              checked={envRuleEnabled}
              onCheckedChange={handleEnvRuleToggle}
            />
          </span>
        </div>
      </div>

      {hasSummary && (
        <div className="bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/5 dark:to-brand/[0.02] rounded-xl border border-brand/20 overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {envRulePercent === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-caption font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  {t('flags.summaryFlagOff')}
                </span>
              ) : envRuleEnabled ? (
                <span className="inline-flex items-center gap-1.5 text-caption font-semibold px-2 py-1 rounded-full bg-success/10 text-success dark:text-palette-success-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  {t('flags.summaryActive')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-caption font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground/80">
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
                  <span className="text-body-sm font-semibold text-muted-foreground">
                    {t('flags.flagOff')}
                  </span>
                ) : envRulePercent === 100 && !hasSegments && !hasConstraints ? (
                  <span className="text-body-sm font-semibold text-foreground/80">
                    {t('flags.summaryFullTraffic')}
                  </span>
                ) : (
                  <>
                    <span className="text-h1 font-bold text-brand">{envRulePercent}%</span>
                    <span className="text-body-sm text-muted-foreground ml-1.5">
                      {reachSources.length > 0 ? t('flags.summaryFromBelow') : t('flags.allUsers')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <Slider.Root
              value={[envRulePercent]}
              onValueChange={([v]) => onEnvRulePercentChange(v)}
              max={100}
              step={1}
              aria-label={t('flags.rolloutPercentage')}
              className="relative flex items-center select-none touch-none w-full h-5"
            >
              <Slider.Track className="bg-accent relative grow rounded-full h-2.5">
                <Slider.Range className="absolute bg-brand rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-6 h-6 bg-background border-2 border-brand rounded-full shadow-lg outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" />
            </Slider.Root>

            {reachSources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-caption font-semibold text-muted-foreground/80">
                  <Users size={11} />
                  {t('flags.summaryAudience')}
                </div>
                <ReachRules sources={reachSources} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-5 bg-secondary/50 rounded-xl border border-border space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-brand" />
            <label className="text-body-sm font-medium text-foreground/80">
              {t('flags.targetSegments')}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {segments.map((seg) => {
              const checked = envRuleSegments.includes(seg.id);
              const hasContext = (seg.context?.length ?? 0) > 0;
              const segColor = seg.color || '#1a6b60';
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
                  className={`group cursor-pointer flex flex-col p-3.5 rounded-lg transition-all border ${checked ? 'shadow-sm' : 'bg-input-background border-border hover:border-border hover:shadow-sm'}`}
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
                      <div className="text-body-sm font-semibold text-foreground/90">{seg.name}</div>
                      {seg.description && (
                        <div className="text-caption text-muted-foreground mt-0.5 line-clamp-1">
                          {seg.description}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <div
                        role="checkbox"
                        aria-checked={checked}
                        aria-label={seg.name}
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
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${checked ? '' : 'border-border'}`}
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
                            className="flex items-center gap-1.5 text-caption px-2.5 py-1.5 rounded-lg border"
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
            <p className="text-caption text-muted-foreground/80 mt-2 ml-1">
              {t('flags.noSegmentsSelected')}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-brand" />
              <label className="text-body-sm font-medium text-foreground/80">
                {t('flags.additionalConditions')}
              </label>
              <span className="inline-flex items-center text-caption px-1.5 py-1 rounded bg-brand/10 text-brand dark:text-palette-brand-800 font-medium leading-none">
                {t('flags.configurable')}
              </span>
            </div>
            <button
              onClick={addGroup}
              className="text-caption text-brand flex items-center gap-1 font-medium focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none rounded"
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
                      <p className="text-caption text-muted-foreground italic">
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
                                  className={`inline-flex items-center gap-1 px-2 py-1 text-caption font-mono rounded-md border ${
                                    inWhitelist
                                      ? 'bg-success/10 text-success dark:text-palette-success-700 border-success/20'
                                      : 'bg-warning/10 text-palette-warning-700 border-warning/30'
                                  }`}
                                >
                                  {v}
                                  <button
                                    onClick={() =>
                                      updateGroup({
                                        values: g.values.filter((_, j) => j !== i),
                                      })
                                    }
                                    aria-label={t('flags.removeTag', { tag: v })}
                                    className={`${inWhitelist ? 'text-success dark:text-palette-success-700' : 'text-palette-warning-700'} p-0.5 hover:text-destructive transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none rounded-sm`}
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
                                  const covered = renderCoveredChip(v, 'px-3 py-1.5 rounded-lg text-caption font-medium bg-muted/30 text-muted-foreground border border-border/40 cursor-not-allowed');
                                  if (covered) return covered;
                                  return (
                                    <button
                                      key={v}
                                      onClick={() =>
                                        updateGroup({ values: [...g.values, v] })
                                      }
                                      className="px-3 py-1.5 rounded-lg text-caption font-medium bg-secondary/80 text-foreground/70 hover:bg-secondary hover:text-foreground border border-border transition-all"
                                    >
                                      + {v}
                                    </button>
                                  );
                                })}
                            </div>
                            {segmentsCoveredNote}
                            {validVals.every((v) => g.values.includes(v) || segmentsCoveredValues.has(v)) && (
                              <p className="text-caption text-muted-foreground">
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
                                <p className="text-caption text-muted-foreground mb-1">
                                  {t('flags.whitelistSuggestions')}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {validVals
                                    .filter((v) => !g.values.includes(v))
                                    .map((v) => {
                                      const covered = renderCoveredChip(v, 'px-2 py-0.5 text-caption border border-muted rounded-md text-muted-foreground cursor-not-allowed');
                                      if (covered) return covered;
                                      return (
                                        <button
                                          key={v}
                                          onClick={() =>
                                            updateGroup({
                                              values: [...g.values, v],
                                            })
                                          }
                                          className="px-2 py-0.5 text-caption border border-brand/20 rounded-md text-brand hover:bg-brand/10 transition-colors"
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
                              const covered = !isSelected ? renderCoveredChip(v, 'px-3 py-1.5 rounded-lg text-caption font-medium bg-muted/30 text-muted-foreground border border-border/40 cursor-not-allowed') : null;
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
                                  aria-pressed={isSelected}
                                  className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-all border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
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
                            <p className="text-caption text-muted-foreground">
                              {t('flags.detailCard.value')}:{' '}
                              <span className={`font-semibold ${validVals.includes(g.values[0]) ? 'text-foreground/80' : 'text-palette-warning-700 dark:text-palette-warning-700'}`}>
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
                          aria-label={t('flags.detailCard.value')}
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
                          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all invalid:border-destructive dark:invalid:border-destructive"
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
                          <p className="text-caption text-muted-foreground ml-0.5">
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
              <div className="p-4 bg-input-background rounded-lg border border-dashed border-border dark:border-border text-center">
                <p className="text-caption text-muted-foreground">{t('flags.noConstraints')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-brand/5 dark:bg-brand/10 border border-brand/20 dark:border-brand/30 rounded-lg">
        <div className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
              <Settings size={12} className="text-primary-foreground" />
            </div>
          </div>
          <div>
            <h5 className="text-caption font-semibold text-brand dark:text-palette-brand-800 mb-1">
              {t('flags.howTargetingWorks')}
            </h5>
            <p className="text-caption text-brand dark:text-palette-brand-800">
              {t('flags.howTargetingWorksDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
