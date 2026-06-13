import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { ConstraintEntry } from '@/app/components/flags/types';
import type { ContextDefinition } from '@/api';
import { parseConstraintEntries } from '@/app/components/flags/parseConstraints';
import { getErrorMessage } from '@/shared/errorHandler';

export interface PanelEditingState {
  flag: FlagView | null;
  mode: 'create' | 'general' | 'environment';
  envId: number | null;
}

export function useFlagPanels(
  projectId: number | null,
  contexts: ContextDefinition[],
  deleteFlag: { mutateAsync: (flagId: number) => Promise<unknown> },
  archiveFlag: { mutateAsync: (flagId: number) => Promise<unknown> },
  unarchiveFlag: { mutateAsync: (flagId: number) => Promise<unknown> },
  toggleFlagMutation: { mutateAsync: (input: {
    flagId: number;
    envId: number;
    enabled: boolean;
    percentage: number;
    segmentIds: number[];
    contextDefinitionId: number | null;
    contextValuesJson: string | null;
  }) => Promise<unknown> },
) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<PanelEditingState>({ flag: null, mode: 'create', envId: null });
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const [generalDirty, setGeneralDirty] = useState(false);
  const [envRulePercent, setEnvRulePercent] = useState(100);
  const [envRuleSegments, setEnvRuleSegments] = useState<number[]>([]);
  const [envRuleConstraints, setEnvRuleConstraints] = useState<ConstraintEntry[]>([]);
  const [envRuleEnabled, setEnvRuleEnabled] = useState(false);
  const [initialEnvRulePercent, setInitialEnvRulePercent] = useState(100);
  const [initialEnvRuleSegments, setInitialEnvRuleSegments] = useState<number[]>([]);
  const [initialEnvRuleConstraints, setInitialEnvRuleConstraints] = useState<ConstraintEntry[]>([]);
  const [initialEnvRuleEnabled, setInitialEnvRuleEnabled] = useState(false);

  const isEnvDirty =
    envRulePercent !== initialEnvRulePercent ||
    JSON.stringify(envRuleSegments) !== JSON.stringify(initialEnvRuleSegments) ||
    JSON.stringify(envRuleConstraints) !== JSON.stringify(initialEnvRuleConstraints) ||
    envRuleEnabled !== initialEnvRuleEnabled;

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlagView | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<FlagView | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [metricsTarget, setMetricsTarget] = useState<{
    flagId: number;
    flagName: string;
    envId: number;
  } | null>(null);

  const openCreate = useCallback(() => {
    setEditing({ flag: null, mode: 'create', envId: null });
    setGeneralDirty(false);
    setPanelOpen(true);
  }, []);

  const openGeneral = useCallback((flag: FlagView) => {
    setEditing({ flag, mode: 'general', envId: null });
    setGeneralDirty(false);
    setPanelOpen(true);
  }, []);

  const openEnvironment = useCallback((flag: FlagView, envId: number) => {
    setEditing({ flag, mode: 'environment', envId });
    setPanelOpen(true);
    const es = flag.environments[envId] ?? {
      enabled: false,
      percentage: 100,
      segmentIds: [],
      strategyId: null,
      contextDefinitionId: null,
      contextValuesJson: null,
    };
    const constraints = parseConstraintEntries(es.contextValuesJson, es.contextDefinitionId, contexts);
    setEnvRulePercent(es.percentage ?? 100);
    setEnvRuleSegments(es.segmentIds ?? []);
    setEnvRuleConstraints(constraints.map(c => ({ ...c })));
    setEnvRuleEnabled(es.enabled ?? false);
    setInitialEnvRulePercent(es.percentage ?? 100);
    setInitialEnvRuleSegments(es.segmentIds ?? []);
    setInitialEnvRuleConstraints(constraints.map(c => ({ ...c })));
    setInitialEnvRuleEnabled(es.enabled ?? false);
  }, [contexts]);

  const doDelete = useCallback(async () => {
    if (!projectId || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFlag.mutateAsync(deleteTarget.flagId);
      setDeleteTarget(null);
      setPanelOpen(false);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }, [projectId, deleteTarget, deleteFlag]);

  const doArchive = useCallback(async () => {
    if (!projectId || !archiveTarget) return;
    setArchiving(true);
    try {
      await archiveFlag.mutateAsync(archiveTarget.flagId);
      setArchiveTarget(null);
      setPanelOpen(false);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setArchiving(false);
    }
  }, [projectId, archiveTarget, archiveFlag]);

  const doUnarchive = useCallback(async (flag: FlagView) => {
    if (!projectId) return;
    try {
      await unarchiveFlag.mutateAsync(flag.flagId);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    }
  }, [projectId, unarchiveFlag]);

  const doToggleFlag = useCallback(async (flag: FlagView, envId: number) => {
    if (!projectId) return;
    const es = flag.environments[envId];
    if (!es) return;
    await toggleFlagMutation.mutateAsync({
      flagId: flag.flagId,
      envId,
      enabled: !es.enabled,
      percentage: es.percentage,
      segmentIds: es.segmentIds,
      contextDefinitionId: es.contextDefinitionId,
      contextValuesJson: es.contextValuesJson,
    });
  }, [projectId, toggleFlagMutation]);

  const resetPanel = useCallback(() => {
    setPanelOpen(false);
    setEditing({ flag: null, mode: 'create', envId: null });
    setGeneralDirty(false);
  }, []);

  return {
    panelOpen,
    setPanelOpen,
    editing,
    setEditing,
    expandedKeys,
    setExpandedKeys,
    generalDirty,
    setGeneralDirty,
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
    resetPanel,
  };
}
