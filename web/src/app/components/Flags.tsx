import { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Plus, Zap, Archive } from '@/shared/icons';
import { TipCard } from '@/app/components/TipCard';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { ActivationConfirmDetails } from '@/app/components/flags/ActivationConfirmDetails';
const FlagMetricsDialog = lazy(() =>
  import('@/app/components/FlagMetricsDialog').then((m) => ({ default: m.FlagMetricsDialog })),
);
import { SectionHeader, GradientButton, getErrorMessage, Fab } from '@/shared';
import type { FlagTagValue } from '@/api';
import type { FlagView } from '@/app/hooks/flagTypes';
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
import { useFlagPanels } from '@/app/hooks/useFlagPanels';
import { FlagFiltersBar } from '@/app/components/flags/FlagFiltersBar';
import { ArchivedFlagsList } from '@/app/components/flags/ArchivedFlagsList';
import { FlagsList } from '@/app/components/flags/FlagsList';
import { FlagsSidePanel } from '@/app/components/flags/FlagsSidePanel';
import { useFlagDiff } from '@/app/components/flags/useFlagDiff';
import { useFlagSave } from '@/app/components/flags/useFlagSave';
import type { EnrichedFlagsData } from '@/app/hooks/queries/useEnrichedFlagsQuery';
import { useQueryClient } from '@tanstack/react-query';
import type { CreateFlagFormValues, EditFlagFormValues } from '@/app/components/flags/schemas';

export function Flags() {
  const { data: project, isLoading: projectLoading } = useProjectQuery();
  const t = useT();
  const queryClient = useQueryClient();
  const projectId = project?.id ?? null;

  const { data: environments = [] } = useEnvironmentsQuery();
  const { data: enrichedData, isLoading: flagsLoading } = useEnrichedFlagsQuery(projectId);

  const flags = useMemo(() => enrichedData?.flags ?? [], [enrichedData?.flags]);
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
    editing,
    expandedKeys,
    generalDirty,
    activeGroupId,
    envRulePercent,
    envRuleSegments,
    envRuleConstraints,
    envRuleEnabled,
    initialEnvRulePercent,
    initialEnvRuleSegments,
    initialEnvRuleConstraints,
    initialEnvRuleEnabled,
    isEnvDirty,
    archiveOpen,
    deleteTarget,
    deleting,
    archiveTarget,
    archiving,
    metricsDialogOpen,
    metricsTarget,
    openCreate,
    openGeneral,
    openEnvironment,
    doDelete,
    doArchive,
    doUnarchive,
    doToggleFlag,
    setPanelOpen,
    setExpandedKeys,
    setGeneralDirty,
    setActiveGroupId,
    setEnvRulePercent,
    setEnvRuleSegments,
    setEnvRuleConstraints,
    setEnvRuleEnabled,
    setInitialEnvRulePercent,
    setInitialEnvRuleSegments,
    setInitialEnvRuleConstraints,
    setInitialEnvRuleEnabled,
    setArchiveOpen,
    setDeleteTarget,
    setArchiveTarget,
    setMetricsDialogOpen,
    setMetricsTarget,
    setEditing,
    closePanel,
    flattenConstraintGroups,
  } = useFlagPanels(
    projectId,
    contexts,
    deleteFlag,
    archiveFlag,
    unarchiveFlag,
    toggleFlagMutation,
  );

  const { computeGeneralDiff, computeEnvironmentDiff } = useFlagDiff(
    t as (key: string, params?: Record<string, string>) => string,
    segments,
    contexts,
  );

  const handleAfterSave = useCallback(
    (saved?: { key: string; name: string; description: string; flagType: string; tags: FlagTagValue[] }) => {
      if (editing.mode === 'create') {
        closePanel();
      } else if (editing.mode === 'environment') {
        setInitialEnvRulePercent(envRulePercent);
        setInitialEnvRuleSegments([...envRuleSegments]);
        setInitialEnvRuleConstraints(envRuleConstraints.map((g) => ({ ...g, values: [...g.values] })));
        setInitialEnvRuleEnabled(envRuleEnabled);
        if (editing.flag && editing.envId != null) {
          const queryData = queryClient.getQueryData<EnrichedFlagsData>(['flags', 'enriched']);
          const freshFlag = queryData?.flags?.find((f) => f.key === editing.flag!.key);
          if (freshFlag) {
            setEditing({ flag: freshFlag, mode: 'environment', envId: editing.envId });
          }
        }
      } else if (editing.mode === 'general' && editing.flag && saved) {
        setEditing({
          flag: { ...editing.flag, name: saved.name, key: saved.key, description: saved.description, flagType: saved.flagType, tags: saved.tags },
          mode: 'general',
          envId: null,
        });
      }
    },
    [editing.mode, editing.flag, editing.envId, envRulePercent, envRuleSegments, envRuleConstraints, envRuleEnabled, closePanel, queryClient, setEditing, setInitialEnvRulePercent, setInitialEnvRuleSegments, setInitialEnvRuleConstraints, setInitialEnvRuleEnabled],
  );

  const { save, showDiff, confirmDiff, closeDiff, saving, error, diffOpen, diffChanges } =
    useFlagSave({ projectId: projectId ?? 0, environments, onSaveSuccess: handleAfterSave });

  const handleCreateSave = useCallback(
    (data: CreateFlagFormValues, tags: FlagTagValue[]) => {
      save({ mode: 'create', data: { name: data.name, key: data.key, description: data.description ?? '', flagType: data.flagType, tags } });
    },
    [save],
  );

  const handleGeneralSave = useCallback(
    (data: EditFlagFormValues, tags: FlagTagValue[]) => {
      if (!editing.flag) return;
      const changes = computeGeneralDiff({
        flag: editing.flag,
        data: { name: data.name, description: data.description ?? '', flagType: data.flagType },
        tags,
      });
      const config = {
        mode: 'general' as const,
        data: { flag: editing.flag, name: data.name, key: editing.flag.key, description: data.description ?? '', flagType: data.flagType, tags },
      };
      if (changes.length > 0) {
        showDiff(changes, config);
      } else {
        save(config);
      }
    },
    [editing.flag, computeGeneralDiff, showDiff, save],
  );

  const handleEnvironmentSave = useCallback(() => {
    try {
    if (!projectId || !editing.flag || !editing.envId) return;
    const changes = computeEnvironmentDiff({
      current: {
        enabled: envRuleEnabled,
        percentage: envRulePercent,
        segments: envRuleSegments,
        constraints: envRuleConstraints,
      },
      initial: {
        enabled: initialEnvRuleEnabled,
        percentage: initialEnvRulePercent,
        segments: initialEnvRuleSegments,
        constraints: initialEnvRuleConstraints,
      },
    });
    const config = {
      mode: 'environment' as const,
      data: {
        flag: editing.flag,
        envId: editing.envId,
        enabled: envRuleEnabled,
        percentage: envRulePercent,
        segmentIds: envRuleSegments,
        constraints: flattenConstraintGroups(envRuleConstraints),
        initialEnabled: initialEnvRuleEnabled,
        initialPercentage: initialEnvRulePercent,
        initialSegments: initialEnvRuleSegments,
        initialConstraints: flattenConstraintGroups(initialEnvRuleConstraints),
      },
    };
    if (changes.length > 0) {
      showDiff(changes, config);
    } else {
      save(config);
    }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, [
    projectId, editing.flag, editing.envId,
    envRuleEnabled, envRulePercent, envRuleSegments, envRuleConstraints,
    initialEnvRuleEnabled, initialEnvRulePercent, initialEnvRuleSegments, initialEnvRuleConstraints,
    computeEnvironmentDiff, showDiff, save, flattenConstraintGroups,
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const createHandledRef = useRef(false);

  useEffect(() => {
    if (!panelOpen) setActiveGroupId(null);
  }, [panelOpen, setActiveGroupId]);

  useEffect(() => {
    if (createHandledRef.current) return;
    if (searchParams.get('new') === '1') {
      createHandledRef.current = true;
      openCreate();
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, openCreate]);

  useEffect(() => {
    const targetKey = searchParams.get('open');
    if (targetKey && flags.length > 0 && !expandedKeys.has(targetKey)) {
      setExpandedKeys(new Set([...expandedKeys, targetKey]));
      document.getElementById(`flag-card-${targetKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [flags, searchParams, expandedKeys, setExpandedKeys]);

  const handleMetricsClick = useCallback(
    (flagId: number, flagName: string, envId: number) => {
      setMetricsTarget({ flagId, flagName, envId });
      setMetricsDialogOpen(true);
    },
    [setMetricsDialogOpen, setMetricsTarget],
  );

  const [pendingToggle, setPendingToggle] = useState<{ flag: FlagView; envId: number } | null>(null);

  const handleToggleFlag = useCallback(
    (flag: FlagView, envId: number) => {
      const es = flag.environments[envId];
      if (es && !es.enabled) {
        const env = environments.find((e) => e.id === envId);
        if (env?.requireActivationApproval) {
          setPendingToggle({ flag, envId });
          return;
        }
      }
      doToggleFlag(flag, envId);
    },
    [environments, doToggleFlag],
  );

  const handleToggleExpand = useCallback((key: string) => {
    const next = new Set(expandedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedKeys(next);
  }, [expandedKeys, setExpandedKeys]);

  const pendingEnv = pendingToggle
    ? environments.find((e) => e.id === pendingToggle.envId)
    : undefined;
  const pendingEs = pendingToggle
    ? pendingToggle.flag.environments[pendingToggle.envId]
    : undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title={t('flags.title')} description={t('flags.description')} />
        <div className="hidden sm:block">
          <GradientButton onClick={openCreate} icon={<Plus size={18} />}>
            {t('flags.create')}
          </GradientButton>
        </div>
      </div>

      <FlagFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        flagTypeFilter={flagTypeFilter}
        onFlagTypeFilterChange={setFlagTypeFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        tags={tags}
        selectedTagTypeFilter={selectedTagTypeFilter}
        onTagTypeFilterChange={setSelectedTagTypeFilter}
        selectedTagValueFilter={selectedTagValueFilter}
        onTagValueFilterChange={setSelectedTagValueFilter}
        uniqueTagValues={uniqueTagValues}
      />

      <TipCard text={t('flags.hygieneTip')} label={t('flags.hygieneLabel')} icon={<Zap />} storageKey="flags" />

      <FlagsList
        loading={loading}
        empty={!loading && filtered.length === 0}
        visibleFlags={visibleFlags}
        expandedKeys={expandedKeys}
        onToggleExpand={handleToggleExpand}
        onOpenGeneral={openGeneral}
        onOpenEnvironment={openEnvironment}
        onToggleFlag={handleToggleFlag}
        onMetricsClick={handleMetricsClick}
        onCreateClick={openCreate}
        environments={environments}
        segments={segments}
        tags={tags}
        sparklineData={sparklineData}
        hasMoreFlags={hasMoreFlags}
        totalFiltered={filtered.length}
        onShowMore={showMoreFlags}
        onShowAll={showAllFlags}
      />

      {archivedFlags.length > 0 && (
        <div className="flex justify-center pt-2">
          <GradientButton variant="muted" onClick={() => setArchiveOpen(!archiveOpen)} icon={<Archive size={16} />}>
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

      <FlagsSidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onClose={closePanel}
        editing={editing}
        generalDirty={generalDirty}
        envRulePercent={envRulePercent}
        envRuleSegments={envRuleSegments}
        envRuleConstraints={envRuleConstraints}
        envRuleEnabled={envRuleEnabled}
        isEnvDirty={isEnvDirty}
        activeGroupId={activeGroupId}
        saving={saving}
        error={error}
        diffOpen={diffOpen}
        diffChanges={diffChanges}
        onDiffDismiss={closeDiff}
        onConfirmDiff={confirmDiff}
        environments={environments}
        segments={segments}
        contexts={contexts}
        allTags={tags}
        onSaveCreate={handleCreateSave}
        onSaveGeneral={handleGeneralSave}
        onSaveEnvironment={handleEnvironmentSave}
        onSetEnvRulePercent={setEnvRulePercent}
        onSetEnvRuleSegments={setEnvRuleSegments}
        onSetEnvRuleConstraints={setEnvRuleConstraints}
        onSetEnvRuleEnabled={setEnvRuleEnabled}
        onSetActiveGroupId={setActiveGroupId}
        onSetGeneralDirty={setGeneralDirty}
        onArchive={() => setArchiveTarget(editing.flag!)}
        onUnarchive={() => editing.flag && doUnarchive(editing.flag)}
        onDelete={() => setDeleteTarget(editing.flag!)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t('flags.deleteConfirm')}
        description={`${t('flags.namePlaceholder')} \u00AB${deleteTarget?.name ?? ''}\u00BB ${t('flags.deleteDescription')}`}
        confirmLabel={t('common.delete')}
        confirmPhrase={deleteTarget?.name}
        onConfirm={doDelete}
        loading={deleting}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => { if (!open) setArchiveTarget(null); }}
        title={t('flags.archiveConfirm')}
        description={`${t('flags.namePlaceholder')} \u00AB${archiveTarget?.name ?? ''}\u00BB ${t('flags.archiveDescription')}`}
        confirmLabel={t('flags.archiveBtn')}
        variant="default"
        onConfirm={doArchive}
        loading={archiving}
      />

      <ConfirmDialog
        open={!!pendingToggle}
        onOpenChange={(open) => { if (!open) setPendingToggle(null); }}
        title={t('flags.activateConfirm', {
          flag: pendingToggle?.flag.name ?? '',
          env: pendingEnv?.name ?? '',
        })}
        description={t('flags.activateDescription')}
        confirmLabel={t('flags.activateConfirmBtn')}
        variant="default"
        onConfirm={() => {
          if (!pendingToggle) return;
          const { flag, envId } = pendingToggle;
          setPendingToggle(null);
          doToggleFlag(flag, envId);
        }}
      >
        {pendingEs && (
          <ActivationConfirmDetails
            percentage={pendingEs.percentage}
            segmentIds={pendingEs.segmentIds ?? []}
            contextDefinitionId={pendingEs.contextDefinitionId}
            contextValuesJson={pendingEs.contextValuesJson}
            segments={segments}
            contexts={contexts}
          />
        )}
      </ConfirmDialog>

      <Fab onClick={openCreate} label={t('flags.create')} />
    </div>
  );
}
