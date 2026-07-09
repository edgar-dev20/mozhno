import { useMemo } from 'react';
import { parseConstraintEntries } from '@/app/components/flags/parseConstraints';
import { isMultiOperator, Operator } from '@/app/components/operatorsMeta';
import { Filter } from '@/shared/icons';
import { ReachRules, type ReachSource } from '@/app/components/flags/ReachRules';
import { useT } from '@/i18n';
import type { SegmentResponse, ContextDefinition } from '@/api';

interface ActivationConfirmDetailsProps {
  percentage: number;
  segmentIds: number[];
  contextDefinitionId: number | null;
  contextValuesJson: string | null;
  segments: SegmentResponse[];
  contexts: ContextDefinition[];
}

/**
 * Reach-focused summary shown before enabling a flag in an environment that
 * requires activation approval: rollout ring + the reach rules (segments and
 * custom conditions) rendered with the shared {@link ReachRules} so it stays in
 * sync with the environment detail panel.
 */
export function ActivationConfirmDetails({
  percentage,
  segmentIds,
  contextDefinitionId,
  contextValuesJson,
  segments,
  contexts,
}: ActivationConfirmDetailsProps) {
  const t = useT();
  const pct = Math.max(0, Math.min(100, percentage ?? 100));

  const sources = useMemo<ReachSource[]>(() => {
    const result: ReachSource[] = [];

    const customEntries = parseConstraintEntries(contextValuesJson, contextDefinitionId, contexts);
    if (customEntries.length > 0) {
      result.push({
        key: 'custom',
        kind: 'custom',
        name: t('flags.customSource'),
        conditions: customEntries.map((e) => {
          const ctx = contexts.find((c) => c.id === e.contextDefId);
          const raw = String(e.value ?? '');
          const values = isMultiOperator(e.operator)
            ? raw.split(',').map((v) => v.trim()).filter(Boolean)
            : raw
              ? [raw]
              : [];
          return {
            field: ctx?.name ?? ctx?.key ?? t('flags.activateContext'),
            operator: e.operator,
            contextType: ctx?.type,
            values,
          };
        }),
      });
    }

    for (const id of segmentIds) {
      const seg = segments.find((s) => s.id === id);
      if (!seg) continue;
      result.push({
        key: `seg-${seg.id}`,
        kind: 'segment',
        name: seg.name,
        color: seg.color,
        icon: seg.icon,
        conditions: (seg.context ?? []).map((c) => {
          const ctx = contexts.find((cd) => cd.id === c.contextDefinitionId);
          return {
            field: ctx?.name ?? t('flags.activateContext'),
            operator: c.operator ?? Operator.IN,
            contextType: ctx?.type,
            values: (c.contextValues ?? '').split(',').map((v) => v.trim()).filter(Boolean),
          };
        }),
      });
    }

    return result;
  }, [contextValuesJson, contextDefinitionId, contexts, segmentIds, segments, t]);

  const hasSources = sources.length > 0;
  const isEveryone = pct >= 100 && !hasSources;
  const ringDim = 64;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/50 p-3.5">
        <div className="relative shrink-0" style={{ width: ringDim, height: ringDim }}>
          <svg viewBox="0 0 36 36" width={ringDim} height={ringDim} aria-hidden>
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-muted)" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${pct} 100`}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-body-sm font-bold tabular-nums">
            {pct}%
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-body-sm font-semibold text-foreground">
            {isEveryone
              ? t('flags.activateReachEveryone')
              : t('flags.activateReachPercent', { pct: String(pct) })}
          </div>
          {!isEveryone && (
            <div className="text-caption text-muted-foreground mt-0.5">
              {hasSources ? t('flags.activateReachRules') : t('flags.activateReachAll')}
            </div>
          )}
        </div>
      </div>

      {hasSources && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter size={11} className="text-muted-foreground/70" />
            <span className="text-caption font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {t('flags.activateRules')} · {sources.length}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="max-h-[42vh] overflow-y-auto -mr-1 pr-1">
            <ReachRules sources={sources} />
          </div>
        </div>
      )}
    </div>
  );
}
