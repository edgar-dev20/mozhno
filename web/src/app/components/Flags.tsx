import { useEffect, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Zap, Rocket, Archive } from '@/shared/icons';
import { SidePanel } from '@/app/components/SidePanel';
import { TipCard } from '@/app/components/TipCard';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { InlineDiffBar } from '@/app/components/InlineDiffBar';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { formatTimeConstraintValue } from '@/shared/format';
const FlagMetricsDialog = lazy(() =>
  import('@/app/components/FlagMetricsDialog').then((m) => ({ default: m.FlagMetricsDialog })),
);
import { SectionHeader, EmptyState, GradientButton, ErrorBox, adjustColor } from '@/shared';
import { FlagCardSkeletonList } from '@/app/components/skeletons';
import type { FlagTagValue } from '@/api';
import type { ConstraintGroup } from '@/app/components/flags/types';
import { useT } from '@/i18n';

import {
  useProjectQuery,
  useEnvironmentsQuery,
  useEnrichedFlagsQuery,
  useMetricsSparklineQuery,
} from '@/app/hooks/queries';
import {
  useFlagDelete,
  useFlagArchive,
  useFlagUnarchive,
  useFlagToggle,
} from '@/app/hooks/mutations';
import { useFlagFilters } from '@/app/hooks/useFlagFilters';
import { useFlagSave } from '@/app/components/flags/useFlagSave';
import { useFlagPanels } from '@/app/hooks/useFlagPanels';
import { FlagCreatePanel } from '@/app/components/flags/FlagCreatePanel';
import { FlagEditPanel } from '@/app/components/flags/FlagEditPanel';
import { FlagEnvironmentPanel } from '@/app/components/flags/FlagEnvironmentPanel';
import { createFormId, editFormId } from '@/app/components/flags/formIds';
import { FlagCard } from '@/app/components/flags/FlagCard';
import { ArchivedFlagsList } from '@/app/components/flags/ArchivedFlagsList';
import { FlagFiltersBar } from '@/app/components/flags/FlagFiltersBar';
import { SegmentIcon } from '@/app/components/SegmentIcon';
import type { CreateFlagFormValues, EditFlagFormValues } from '@/app/components/flags/schemas';
import type { DiffChange } from '@/shared/diffUtils';
import type { ReactNode } from 'react';
import { isConstraintValueValid } from '@/app/components/operators';

export function Flags() {
  const { data: project, isLoading: projectLoading } = useProjectQuery();
  const t = useT();
  const projectId = project?.id ?? null;
  const { data: environments = [] } = useEnvironmentsQuery();
  const { data: enrichedData, isLoading: flagsLoading } = useEnrichedFlagsQuery(projectId);

  const flags = enrichedData?.flags ?? [];
  const segments = enrichedData?.segments ?? [];
  const tags = enrichedData?.tags ?? [];
  const contexts = enrichedData?.contexts ?? [];

  const loading = projectLoading || flagsLoading;

  const deleteFlag = useFlagDelete();
  const archiveFlag = useFlagArchive();
  const unarchiveFlag = useFlagUnarchive();
  const toggleFlagMutation = useFlagToggle();

  const { data: sparklineData = new Map() } = useMetricsSparklineQuery(
    environments.length,
    flags.length,
  );

  const {
    filtered,
    archivedFlags,
    visibleFlags,
    hasMoreFlags,
    showMoreFlags,
    showAllFlags,
    selectedTagTypeFilter,
    setSelectedTagTypeFilter,
    selectedTagValueFilter,
    setSelectedTagValueFilter,
    flagTypeFilter,
    setFlagTypeFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    uniqueTagValues,
  } = useFlagFilters(flags, enrichedData?.totalItems);

  const {
    panelOpen,
    setPanelOpen,
    editing,
    setEditing,
    expandedKeys,
    setExpandedKeys,
    generalDirty,
    setGeneralDirty,
    activeGroupId,
    setActiveGroupId,
    envRulePercent,
    setEnvRulePercent,
    envRuleSegments,
    setEnvRuleSegments,
    envRuleConstraints,
    setEnvRuleConstraints,
    envRuleEnabled,
    setEnvRuleEnabled,
    initialEnvRulePercent,
    initialEnvRuleSegments,
    initialEnvRuleConstraints,
    initialEnvRuleEnabled,
    setInitialEnvRulePercent,
    setInitialEnvRuleSegments,
    setInitialEnvRuleConstraints,
    setInitialEnvRuleEnabled,
    isEnvDirty,
    archiveOpen,
    setArchiveOpen,
    deleteTarget,
    setDeleteTarget,
    deleting,
    archiveTarget,
    setArchiveTarget,
    archiving,
    metricsDialogOpen,
    setMetricsDialogOpen,
    metricsTarget,
    setMetricsTarget,
    openCreate,
    openGeneral,
    openEnvironment,
    doDelete,
    doArchive,
    doUnarchive,
    doToggleFlag,
    flattenConstraintGroups: flattenConstraints,
  } = useFlagPanels(
    projectId,
    contexts,
    deleteFlag,
    archiveFlag,
    unarchiveFlag,
    toggleFlagMutation,
  );

  const handleAfterSave = useCallback(
    (saved?: {
      key: string;
      name: string;
      description: string;
      flagType: string;
      tags: FlagTagValue[];
    }) => {
      if (editing.mode === 'create') {
        setPanelOpen(false);
      } else if (editing.mode === 'environment') {
        setInitialEnvRulePercent(envRulePercent);
        setInitialEnvRuleSegments([...envRuleSegments]);
        setInitialEnvRuleConstraints(
          envRuleConstraints.map((g) => ({ ...g, values: [...g.values] })),
        );
        setInitialEnvRuleEnabled(envRuleEnabled);
      } else if (editing.mode === 'general' && editing.flag && saved) {
        setEditing({
          flag: {
            ...editing.flag,
            name: saved.name,
            key: saved.key,
            description: saved.description,
            flagType: saved.flagType,
            tags: saved.tags,
          },
          mode: 'general',
          envId: null,
        });
      }
    },
    [
      editing.mode,
      editing.flag,
      envRulePercent,
      envRuleSegments,
      envRuleConstraints,
      envRuleEnabled,
      setInitialEnvRulePercent,
      setInitialEnvRuleSegments,
      setInitialEnvRuleConstraints,
      setInitialEnvRuleEnabled,
      setPanelOpen,
      setEditing,
    ],
  );

  const { save, showDiff, confirmDiff, closeDiff, saving, error, diffOpen, diffChanges } =
    useFlagSave({
      projectId: projectId ?? 0,
      environments,
      onSaveSuccess: handleAfterSave,
    });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!panelOpen) {
      setActiveGroupId(null);
    }
  }, [panelOpen, setActiveGroupId]);

  useEffect(() => {
    const targetKey = searchParams.get('open');
    if (targetKey && flags.length > 0 && !expandedKeys.has(targetKey)) {
      setExpandedKeys((prev) => new Set([...prev, targetKey]));
      const el = document.getElementById(`flag-card-${targetKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setExpandedKeys is stable; expandedKeys intentional guard
  }, [flags, searchParams]);

  const handleCreateSave = (data: CreateFlagFormValues, tags: FlagTagValue[]) => {
    save({
      mode: 'create',
      data: {
        name: data.name,
        key: data.key,
        description: data.description ?? '',
        flagType: data.flagType,
        tags,
      },
    });
  };

  const handleGeneralSave = (data: EditFlagFormValues, tags: FlagTagValue[]) => {
    if (!editing.flag) return;

    const changes: DiffChange[] = [];

    if (editing.flag.name !== data.name) {
      changes.push({
        field: 'name',
        label: t('flags.diffLabelName'),
        before: editing.flag.name,
        after: data.name,
        group: t('flags.diffGroupMain'),
      });
    }

    if (editing.flag.description !== (data.description ?? '')) {
      changes.push({
        field: 'description',
        label: t('flags.diffLabelDescription'),
        before: editing.flag.description,
        after: data.description ?? '',
        group: t('flags.diffGroupMain'),
      });
    }

    if (editing.flag.flagType !== data.flagType) {
      const typeLabel = (ft: string) =>
        ft === 'RELEASE' ? t('flags.release') : t('flags.killswitch');
      changes.push({
        field: 'flagType',
        label: t('flags.diffLabelType'),
        before: typeLabel(editing.flag.flagType),
        after: typeLabel(data.flagType),
        group: t('flags.diffGroupMain'),
      });
    }

    if (JSON.stringify(editing.flag.tags ?? []) !== JSON.stringify(tags)) {
      const makeTagNode = (tv: FlagTagValue): ReactNode => (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white shadow-sm leading-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${tv.tagColor}, ${adjustColor(tv.tagColor, 20)})`,
            }}
          >
            {tv.tagName}
          </span>
          <span>{tv.value || '∅'}</span>
        </span>
      );

      const oldMap = new Map((editing.flag.tags ?? []).map((t) => [t.tagId, t]));
      const newMap = new Map(tags.map((t) => [t.tagId, t]));

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
            before: oldTv.value || '∅',
            after: newTv.value || '∅',
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

    const config = {
      mode: 'general' as const,
      data: {
        flag: editing.flag,
        name: data.name,
        key: editing.flag.key,
        description: data.description ?? '',
        flagType: data.flagType,
        tags,
      },
    };

    if (changes.length > 0) {
      showDiff(changes, config);
    } else {
      save(config);
    }
  };

  const handleEnvironmentSave = () => {
    if (!projectId || !editing.flag || !editing.envId) return;

    const makeSegNode = (segId: number) => {
      const seg = segments.find((s) => s.id === segId);
      const segName = seg?.name ?? `Сегмент #${segId}`;
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
    };

    const renderGroupNode = (g: ConstraintGroup): ReactNode => {
      const ctx = contexts.find((cd) => cd.id === g.contextDefId);
      const attr = ctx?.name ?? `#${g.contextDefId}`;
      const vals =
        g.values.length > 0
          ? (ctx?.type === 'time' ? g.values.map(formatTimeConstraintValue) : g.values).join(', ')
          : '∅';
      return (
        <span className="inline-flex items-center gap-1.5 text-xs flex-wrap">
          <span className="font-semibold text-foreground/80">{attr}</span>
          <OperatorBadge operator={g.operator} contextType={ctx?.type} />
          <code className="font-mono text-foreground/80 break-all">{vals}</code>
        </span>
      );
    };

    const groupKey = (g: ConstraintGroup) => `${g.contextDefId}|${g.operator}`;

    const changes: DiffChange[] = [];

    if (initialEnvRuleEnabled !== envRuleEnabled) {
      changes.push({
        field: 'enabled',
        label: t('flags.diffLabelEnabled'),
        before: initialEnvRuleEnabled ? t('common.yes') : t('common.no'),
        after: envRuleEnabled ? t('common.yes') : t('common.no'),
        group: t('flags.diffGroupStrategy'),
      });
    }

    if (initialEnvRulePercent !== envRulePercent) {
      changes.push({
        field: 'percentage',
        label: t('flags.diffLabelPercentage'),
        before: `${initialEnvRulePercent}%`,
        after: `${envRulePercent}%`,
        group: t('flags.diffGroupStrategy'),
      });
    }

    if (JSON.stringify(initialEnvRuleSegments) !== JSON.stringify(envRuleSegments)) {
      const added = envRuleSegments.filter((id) => !initialEnvRuleSegments.includes(id));
      const removed = initialEnvRuleSegments.filter((id) => !envRuleSegments.includes(id));

      for (const id of removed) {
        changes.push({
          field: `seg-removed-${id}`,
          label: t('flags.diffSegmentRemoved'),
          group: t('flags.diffGroupSegments'),
          before: makeSegNode(id),
          after: '',
        });
      }
      for (const id of added) {
        changes.push({
          field: `seg-added-${id}`,
          label: t('flags.diffSegmentAdded'),
          group: t('flags.diffGroupSegments'),
          before: '',
          after: makeSegNode(id),
        });
      }
    }

    const oldGroupMap = new Map<string, ConstraintGroup>();
    for (const g of initialEnvRuleConstraints) {
      if (g.contextDefId === 0) continue;
      oldGroupMap.set(groupKey(g), g);
    }
    const newGroupMap = new Map<string, ConstraintGroup>();
    for (const g of envRuleConstraints) {
      if (g.contextDefId === 0) continue;
      newGroupMap.set(groupKey(g), g);
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
          after: renderGroupNode(newG),
        });
      } else if (oldG && !newG) {
        changes.push({
          field: `con-removed-${conIdx}`,
          label: t('flags.diffConstraintRemoved'),
          group: t('flags.diffGroupConstraints'),
          before: renderGroupNode(oldG),
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
            before: renderGroupNode(oldG),
            after: renderGroupNode(newG),
          });
        }
      }
    }

    const flatInitialConstraints = flattenConstraints(initialEnvRuleConstraints);
    const flatCurrentConstraints = flattenConstraints(envRuleConstraints);

    const config = {
      mode: 'environment' as const,
      data: {
        flag: editing.flag,
        envId: editing.envId,
        enabled: envRuleEnabled,
        percentage: envRulePercent,
        segmentIds: envRuleSegments,
        constraints: flatCurrentConstraints,
        initialEnabled: initialEnvRuleEnabled,
        initialPercentage: initialEnvRulePercent,
        initialSegments: initialEnvRuleSegments,
        initialConstraints: flatInitialConstraints,
      },
    };

    if (changes.length > 0) {
      showDiff(changes, config);
    } else {
      save(config);
    }
  };

  const sidePanelTitle =
    editing.mode === 'create'
      ? t('flags.createTitle')
      : editing.mode === 'general'
        ? t('flags.generalSettings')
        : `${t('flags.environmentTitle')} ${environments.find((e) => e.id === editing.envId)?.name ?? ''}`;

  const sidePanelDescription =
    editing.mode === 'create'
      ? t('flags.createDescription')
      : editing.mode === 'general'
        ? t('flags.generalDescription')
        : t('flags.environmentDescription');

  const activeFormId =
    editing.mode === 'create' ? createFormId : editing.mode === 'general' ? editFormId : undefined;

  const saveLabel = t('common.saveChanges');
  const hasInvalidConstraints = envRuleConstraints.some((g) => {
    if (g.contextDefId === 0) return false;
    const ctx = contexts.find((c) => c.id === g.contextDefId);
    return !isConstraintValueValid(ctx?.type, g.values[0] ?? '', g.operator);
  });
  const saveDisabled =
    saving ||
    (editing.mode === 'environment' && !isEnvDirty) ||
    (editing.mode === 'general' && !generalDirty) ||
    hasInvalidConstraints;

  const closePanel = useCallback(() => {
    setActiveGroupId(null);
    setPanelOpen(false);
  }, [setActiveGroupId, setPanelOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title={t('flags.title')} description={t('flags.description')} />
        <GradientButton onClick={openCreate} icon={<Plus size={18} />}>
          {t('flags.create')}
        </GradientButton>
      </div>

      <FlagFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        flagTypeFilter={flagTypeFilter}
        onFlagTypeFilterChange={setFlagTypeFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        tags={tags}
        selectedTagTypeFilter={selectedTagTypeFilter}
        onTagTypeFilterChange={setSelectedTagTypeFilter}
        selectedTagValueFilter={selectedTagValueFilter}
        onTagValueFilterChange={setSelectedTagValueFilter}
        uniqueTagValues={uniqueTagValues}
      />

      <TipCard
        text={t('flags.hygieneTip')}
        label={t('flags.hygieneLabel')}
        icon={<Zap />}
        storageKey="flags"
      />

      <div className="space-y-3">
        {loading ? (
          <FlagCardSkeletonList count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Rocket size={28} className="text-brand" />}
            title={t('flags.noFlags')}
            description={t('flags.noFlagsDescription')}
            buttonLabel={t('flags.create')}
            onAction={openCreate}
          />
        ) : (
          <>
            {visibleFlags.map((flag) => (
              <FlagCard
                key={flag.key}
                flag={flag}
                expanded={expandedKeys.has(flag.key)}
                onToggleExpand={() => {
                  const next = new Set(expandedKeys);
                  if (expandedKeys.has(flag.key)) next.delete(flag.key);
                  else next.add(flag.key);
                  setExpandedKeys(next);
                }}
                onOpenGeneral={openGeneral}
                onOpenEnvironment={openEnvironment}
                onToggleFlag={doToggleFlag}
                onMetricsClick={(flagId, flagName, envId) => {
                  setMetricsTarget({ flagId, flagName, envId });
                  setMetricsDialogOpen(true);
                }}
                environments={environments}
                segments={segments}
                tags={tags}
                sparklineData={sparklineData}
              />
            ))}
            {hasMoreFlags && (
              <div className="flex items-center justify-center gap-3 pt-3 pb-1">
                <GradientButton variant="secondary" onClick={showMoreFlags}>
                  {t('flags.showMore')} ({filtered.length - visibleFlags.length})
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  onClick={showAllFlags}
                  className="bg-brand/10 border-brand/20 text-brand hover:bg-brand/20"
                >
                  {t('flags.showAll')} ({filtered.length})
                </GradientButton>
              </div>
            )}
          </>
        )}
      </div>

      {archivedFlags.length > 0 && (
        <div className="flex justify-center pt-2">
          <GradientButton
            variant="muted"
            onClick={() => setArchiveOpen(!archiveOpen)}
            icon={<Archive size={16} />}
          >
            {t('flags.archiveSection')} ({archivedFlags.length})
          </GradientButton>
        </div>
      )}

      {archiveOpen && (
        <ArchivedFlagsList flags={archivedFlags} onUnarchive={doUnarchive} tags={tags} />
      )}

      <Suspense fallback={null}>
        <FlagMetricsDialog
          open={metricsDialogOpen}
          onOpenChange={setMetricsDialogOpen}
          flagId={metricsTarget?.flagId ?? 0}
          flagName={metricsTarget?.flagName ?? ''}
          environments={environments}
          defaultEnvId={metricsTarget?.envId}
        />
      </Suspense>

      <SidePanel
        open={panelOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePanel();
            return;
          }
          setPanelOpen(true);
        }}
        title={sidePanelTitle}
        description={sidePanelDescription}
        diffSlot={diffOpen ? <InlineDiffBar changes={diffChanges} /> : undefined}
        onDiffDismiss={diffOpen ? closeDiff : undefined}
        footer={
          diffOpen ? (
            <>
              <GradientButton variant="ghost" onClick={closeDiff}>
                {t('common.cancel')}
              </GradientButton>
              <GradientButton
                onClick={confirmDiff}
                disabled={hasInvalidConstraints}
                loading={saving}
              >
                {t('common.applyChanges')}
              </GradientButton>
            </>
          ) : (
            <>
              <GradientButton variant="ghost" onClick={closePanel}>
                {t('common.cancel')}
              </GradientButton>
              {editing.mode === 'create' || editing.mode === 'general' ? (
                <GradientButton
                  type="submit"
                  form={activeFormId}
                  disabled={saveDisabled}
                  loading={saving}
                >
                  {saveLabel}
                </GradientButton>
              ) : (
                <GradientButton
                  onClick={handleEnvironmentSave}
                  disabled={saveDisabled}
                  loading={saving}
                >
                  {saveLabel}
                </GradientButton>
              )}
            </>
          )
        }
      >
        <div className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}

          {editing.mode === 'create' && (
            <FlagCreatePanel allTags={tags} onSave={handleCreateSave} />
          )}

          {editing.mode === 'general' && editing.flag && (
            <FlagEditPanel
              flag={editing.flag}
              allTags={tags}
              onSave={handleGeneralSave}
              onArchive={() => setArchiveTarget(editing.flag!)}
              onUnarchive={() => doUnarchive(editing.flag!)}
              onDelete={() => setDeleteTarget(editing.flag!)}
              onDirtyChange={setGeneralDirty}
            />
          )}

          {editing.mode === 'environment' && (
            <FlagEnvironmentPanel
              envRulePercent={envRulePercent}
              onEnvRulePercentChange={setEnvRulePercent}
              envRuleSegments={envRuleSegments}
              onEnvRuleSegmentsChange={setEnvRuleSegments}
              envRuleConstraintGroups={envRuleConstraints}
              onEnvRuleConstraintGroupsChange={setEnvRuleConstraints}
              envRuleEnabled={envRuleEnabled}
              onEnvRuleEnabledChange={setEnvRuleEnabled}
              segments={segments}
              contexts={contexts}
              activeGroupId={activeGroupId}
              onActiveGroupIdChange={setActiveGroupId}
              envName={environments.find((e) => e.id === editing.envId)?.name}
            />
          )}
        </div>
      </SidePanel>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t('flags.deleteConfirm')}
        description={`${t('flags.namePlaceholder')} «${deleteTarget?.name ?? ''}» ${t('flags.deleteDescription')}`}
        confirmLabel={t('common.delete')}
        onConfirm={doDelete}
        loading={deleting}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
        title={t('flags.archiveConfirm')}
        description={`${t('flags.namePlaceholder')} «${archiveTarget?.name ?? ''}» ${t('flags.archiveDescription')}`}
        confirmLabel={t('flags.archiveBtn')}
        variant="default"
        onConfirm={doArchive}
        loading={archiving}
      />
    </div>
  );
}
