import type { DiffChange } from '@/shared/diffUtils';
import type { FlagTagValue, SegmentResponse, ContextDefinition } from '@/api';
import type { ConstraintGroup } from '@/app/components/flags/types';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { ReactNode } from 'react';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { SegmentIcon } from '@/app/components/SegmentIcon';
import { ContextType } from '@/app/components/contextTypes';
import { formatTimeConstraintValue } from '@/shared/format';

export interface DiffContext {
  t: (key: string, params?: Record<string, string>) => string;
  segments: SegmentResponse[];
  contexts: ContextDefinition[];
}

export function makeTagNode(tv: FlagTagValue): ReactNode {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white shadow-sm leading-none dark:brightness-[.85] dark:saturate-[.7]"
        style={{
          background: tv.tagColor,
        }}
      >
        {tv.tagName}
      </span>
      <span>{tv.value || '\u2205'}</span>
    </span>
  );
}

export function makeSegmentNode(
  segId: number,
  segments: SegmentResponse[],
): ReactNode {
  const seg = Array.isArray(segments) ? segments.find((s) => s.id === segId) : undefined;
  const segName = seg?.name ?? `Segment #${segId}`;
  const segColor = seg?.color ?? '#6b7280';
  const segIcon = seg?.icon ?? 'Users';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded text-white shrink-0"
        style={{ backgroundColor: segColor }}
      >
        <SegmentIcon name={segIcon} size={9} />
      </span>
      <span style={{ color: segColor }} className="font-medium">
        {segName}
      </span>
    </span>
  );
}

export function renderConstraintGroupNode(
  g: ConstraintGroup,
  contexts: ContextDefinition[],
): ReactNode {
  const ctx = Array.isArray(contexts) ? contexts.find((cd) => cd.id === g.contextDefId) : undefined;
  const attr = ctx?.name ?? `#${g.contextDefId}`;
  const vals =
    g.values.length > 0
      ? (ctx?.type === ContextType.TIME ? g.values.map(formatTimeConstraintValue) : g.values).join(', ')
      : '\u2205';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs flex-wrap">
      <span className="font-semibold text-foreground/80">{attr}</span>
      <OperatorBadge operator={g.operator} contextType={ctx?.type} />
      <code className="font-mono text-foreground/80 break-all">{vals}</code>
    </span>
  );
}

export function groupConstraintKey(g: ConstraintGroup): string {
  return `${g.contextDefId}|${g.operator}`;
}

export function buildGeneralFlagDiff(
  flag: FlagView,
  data: { name: string; description: string; flagType: string },
  tags: FlagTagValue[],
  ctx: DiffContext,
): DiffChange[] {
  const { t } = ctx;
  const changes: DiffChange[] = [];

  if (flag.name !== data.name) {
    changes.push({
      field: 'name',
      label: t('flags.diffLabelName'),
      before: flag.name,
      after: data.name,
      group: t('flags.diffGroupMain'),
    });
  }

  if (flag.description !== (data.description ?? '')) {
    changes.push({
      field: 'description',
      label: t('flags.diffLabelDescription'),
      before: flag.description,
      after: data.description ?? '',
      group: t('flags.diffGroupMain'),
    });
  }

  if (flag.flagType !== data.flagType) {
    const typeLabel = (ft: string) =>
      ft === 'RELEASE' ? t('flags.release') : t('flags.killswitch');
    changes.push({
      field: 'flagType',
      label: t('flags.diffLabelType'),
      before: typeLabel(flag.flagType),
      after: typeLabel(data.flagType),
      group: t('flags.diffGroupMain'),
    });
  }

  const oldTags = flag.tags ?? [];
  if (JSON.stringify(oldTags) !== JSON.stringify(tags)) {
    const oldMap = new Map(oldTags.map((tv) => [tv.tagId, tv]));
    const newMap = new Map(tags.map((tv) => [tv.tagId, tv]));

    for (const [tagId, oldTv] of oldMap) {
      const newTv = newMap.get(tagId);
      if (!newTv) {
        changes.push({
          field: `tag-removed-${tagId}`,
          label: t('flags.diffTagRemoved', { name: oldTv.tagName }),
          group: t('flags.diffGroupTags'),
          before: makeTagNode(oldTv),
          after: '',
        });
      } else if (oldTv.value !== newTv.value) {
        changes.push({
          field: `tag-${tagId}`,
          label: t('flags.diffTagModified', { name: oldTv.tagName }),
          group: t('flags.diffGroupTags'),
          before: oldTv.value || '\u2205',
          after: newTv.value || '\u2205',
        });
      }
    }

    for (const [tagId, newTv] of newMap) {
      if (!oldMap.has(tagId)) {
        changes.push({
          field: `tag-added-${tagId}`,
          label: t('flags.diffTagAdded', { name: newTv.tagName }),
          group: t('flags.diffGroupTags'),
          before: '',
          after: makeTagNode(newTv),
        });
      }
    }
  }

  return changes;
}

export function buildEnvironmentDiff(
  current: {
    enabled: boolean;
    percentage: number;
    segments: number[];
    constraints: ConstraintGroup[];
  },
  initial: {
    enabled: boolean;
    percentage: number;
    segments: number[];
    constraints: ConstraintGroup[];
  },
  ctx: DiffContext,
): DiffChange[] {
  const { t, segments, contexts } = ctx;
  const changes: DiffChange[] = [];

  if (initial.enabled !== current.enabled) {
    changes.push({
      field: 'enabled',
      label: t('flags.diffLabelEnabled'),
      before: initial.enabled ? t('common.yes') : t('common.no'),
      after: current.enabled ? t('common.yes') : t('common.no'),
      group: t('flags.diffGroupStrategy'),
    });
  }

  if (initial.percentage !== current.percentage) {
    changes.push({
      field: 'percentage',
      label: t('flags.diffLabelPercentage'),
      before: `${initial.percentage}%`,
      after: `${current.percentage}%`,
      group: t('flags.diffGroupStrategy'),
    });
  }

  if (JSON.stringify(initial.segments) !== JSON.stringify(current.segments)) {
    const added = current.segments.filter((id) => !initial.segments.includes(id));
    const removed = initial.segments.filter((id) => !current.segments.includes(id));

    for (const id of removed) {
      changes.push({
        field: `seg-removed-${id}`,
        label: t('flags.diffSegmentRemoved'),
        group: t('flags.diffGroupSegments'),
        before: makeSegmentNode(id, segments),
        after: '',
      });
    }

    for (const id of added) {
      changes.push({
        field: `seg-added-${id}`,
        label: t('flags.diffSegmentAdded'),
        group: t('flags.diffGroupSegments'),
        before: '',
        after: makeSegmentNode(id, segments),
      });
    }
  }

  const oldGroupMap = new Map<string, ConstraintGroup>();
  for (const g of initial.constraints) {
    if (g.contextDefId === 0) continue;
    oldGroupMap.set(groupConstraintKey(g), g);
  }

  const newGroupMap = new Map<string, ConstraintGroup>();
  for (const g of current.constraints) {
    if (g.contextDefId === 0) continue;
    newGroupMap.set(groupConstraintKey(g), g);
  }

  const allKeys = new Set([...oldGroupMap.keys(), ...newGroupMap.keys()]);
  let conIdx = 0;

  for (const key of allKeys) {
    conIdx++;
    const oldG = oldGroupMap.get(key);
    const newG = newGroupMap.get(key);

    if (!oldG && newG) {
      changes.push({
        field: `con-added-${conIdx}`,
        label: t('flags.diffConstraintAdded'),
        group: t('flags.diffGroupConstraints'),
        before: '',
        after: renderConstraintGroupNode(newG, contexts),
      });
    } else if (oldG && !newG) {
      changes.push({
        field: `con-removed-${conIdx}`,
        label: t('flags.diffConstraintRemoved'),
        group: t('flags.diffGroupConstraints'),
        before: renderConstraintGroupNode(oldG, contexts),
        after: '',
      });
    } else if (oldG && newG) {
      const oldVals = JSON.stringify(oldG.values);
      const newVals = JSON.stringify(newG.values);
      if (oldVals !== newVals) {
        changes.push({
          field: `con-changed-${conIdx}`,
          label: t('flags.diffConstraintValuesChanged'),
          group: t('flags.diffGroupConstraints'),
          before: renderConstraintGroupNode(oldG, contexts),
          after: renderConstraintGroupNode(newG, contexts),
        });
      }
    }
  }

  return changes;
}
