import { useReducer, useCallback } from 'react';
import { toast } from 'sonner';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { ConstraintGroup } from '@/app/components/flags/types';
import type { ContextDefinition } from '@/api';
import {
  parseConstraintEntries,
  groupConstraintEntries,
  flattenConstraintGroups,
} from '@/app/components/flags/parseConstraints';
import { getErrorMessage } from '@/shared/errorHandler';

export interface PanelEditingState {
  flag: FlagView | null;
  mode: 'create' | 'general' | 'environment';
  envId: number | null;
}

interface PanelState {
  panelOpen: boolean;
  editing: PanelEditingState;
  expandedKeys: Set<string>;
  generalDirty: boolean;
  activeGroupId: string | null;
  envRulePercent: number;
  envRuleSegments: number[];
  envRuleConstraints: ConstraintGroup[];
  envRuleEnabled: boolean;
  initialEnvRulePercent: number;
  initialEnvRuleSegments: number[];
  initialEnvRuleConstraints: ConstraintGroup[];
  initialEnvRuleEnabled: boolean;
  archiveOpen: boolean;
  deleteTarget: FlagView | null;
  deleting: boolean;
  archiveTarget: FlagView | null;
  archiving: boolean;
  metricsDialogOpen: boolean;
  metricsTarget: { flagId: number; flagName: string; envId: number } | null;
}

type PanelAction =
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_GENERAL'; flag: FlagView }
  | { type: 'OPEN_ENVIRONMENT'; flag: FlagView; envId: number; contexts: ContextDefinition[] }
  | { type: 'SET_PANEL_OPEN'; open: boolean }
  | { type: 'SET_EXPANDED_KEYS'; keys: Set<string> }
  | { type: 'TOGGLE_EXPANDED_KEY'; key: string }
  | { type: 'SET_GENERAL_DIRTY'; dirty: boolean }
  | { type: 'SET_ACTIVE_GROUP'; id: string | null }
  | { type: 'SET_ENV_PERCENT'; value: number }
  | { type: 'SET_ENV_SEGMENTS'; values: number[] }
  | { type: 'SET_ENV_CONSTRAINTS'; values: ConstraintGroup[] }
  | { type: 'SET_ENV_ENABLED'; value: boolean }
  | { type: 'SET_INITIAL_ENV_PERCENT'; value: number }
  | { type: 'SET_INITIAL_ENV_SEGMENTS'; values: number[] }
  | { type: 'SET_INITIAL_ENV_CONSTRAINTS'; values: ConstraintGroup[] }
  | { type: 'SET_INITIAL_ENV_ENABLED'; value: boolean }
  | { type: 'SET_ARCHIVE_OPEN'; open: boolean }
  | { type: 'SET_DELETE_TARGET'; target: FlagView | null }
  | { type: 'SET_DELETING'; value: boolean }
  | { type: 'SET_ARCHIVE_TARGET'; target: FlagView | null }
  | { type: 'SET_ARCHIVING'; value: boolean }
  | { type: 'SET_METRICS_OPEN'; open: boolean }
  | { type: 'SET_METRICS_TARGET'; target: { flagId: number; flagName: string; envId: number } | null }
  | { type: 'SET_EDITING'; editing: PanelEditingState }
  | { type: 'CLOSE_PANEL' }
  | { type: 'RESET_PANEL' };

const initialState: PanelState = {
  panelOpen: false,
  editing: { flag: null, mode: 'create', envId: null },
  expandedKeys: new Set<string>(),
  generalDirty: false,
  activeGroupId: null,
  envRulePercent: 100,
  envRuleSegments: [],
  envRuleConstraints: [],
  envRuleEnabled: false,
  initialEnvRulePercent: 100,
  initialEnvRuleSegments: [],
  initialEnvRuleConstraints: [],
  initialEnvRuleEnabled: false,
  archiveOpen: false,
  deleteTarget: null,
  deleting: false,
  archiveTarget: null,
  archiving: false,
  metricsDialogOpen: false,
  metricsTarget: null,
};

function buildInitialEnvConstraints(
  constraintGroups: ConstraintGroup[],
): ConstraintGroup[] {
  return constraintGroups.map((g) => ({ ...g, values: [...g.values] }));
}

function initEnvFromFlag(
  flag: FlagView,
  envId: number,
  contexts: ContextDefinition[],
): {
  envRulePercent: number;
  envRuleSegments: number[];
  envRuleConstraints: ConstraintGroup[];
  envRuleEnabled: boolean;
  initialEnvRulePercent: number;
  initialEnvRuleSegments: number[];
  initialEnvRuleConstraints: ConstraintGroup[];
  initialEnvRuleEnabled: boolean;
} {
  const es = flag.environments[envId] ?? {
    enabled: false,
    percentage: 100,
    segmentIds: [],
    strategyId: null,
    contextDefinitionId: null,
    contextValuesJson: null,
  };
  const constraints = parseConstraintEntries(
    es.contextValuesJson,
    es.contextDefinitionId,
    contexts,
  );
  const groups = groupConstraintEntries(constraints);
  return {
    envRulePercent: es.percentage ?? 100,
    envRuleSegments: es.segmentIds ?? [],
    envRuleConstraints: groups,
    envRuleEnabled: es.enabled ?? false,
    initialEnvRulePercent: es.percentage ?? 100,
    initialEnvRuleSegments: es.segmentIds ?? [],
    initialEnvRuleConstraints: buildInitialEnvConstraints(groups),
    initialEnvRuleEnabled: es.enabled ?? false,
  };
}

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'OPEN_CREATE':
      return {
        ...state,
        editing: { flag: null, mode: 'create', envId: null },
        generalDirty: false,
        panelOpen: true,
      };
    case 'OPEN_GENERAL':
      return {
        ...state,
        editing: { flag: action.flag, mode: 'general', envId: null },
        generalDirty: false,
        panelOpen: true,
      };
    case 'OPEN_ENVIRONMENT': {
      const envData = initEnvFromFlag(action.flag, action.envId, action.contexts);
      return {
        ...state,
        editing: { flag: action.flag, mode: 'environment', envId: action.envId },
        panelOpen: true,
        activeGroupId: null,
        ...envData,
      };
    }
    case 'SET_PANEL_OPEN':
      return { ...state, panelOpen: action.open };
    case 'SET_EXPANDED_KEYS':
      return { ...state, expandedKeys: action.keys };
    case 'TOGGLE_EXPANDED_KEY': {
      const next = new Set(state.expandedKeys);
      if (next.has(action.key)) next.delete(action.key);
      else next.add(action.key);
      return { ...state, expandedKeys: next };
    }
    case 'SET_GENERAL_DIRTY':
      return { ...state, generalDirty: action.dirty };
    case 'SET_ACTIVE_GROUP':
      return { ...state, activeGroupId: action.id };
    case 'SET_ENV_PERCENT':
      return { ...state, envRulePercent: action.value };
    case 'SET_ENV_SEGMENTS':
      return { ...state, envRuleSegments: action.values };
    case 'SET_ENV_CONSTRAINTS':
      return { ...state, envRuleConstraints: action.values };
    case 'SET_ENV_ENABLED':
      return { ...state, envRuleEnabled: action.value };
    case 'SET_INITIAL_ENV_PERCENT':
      return { ...state, initialEnvRulePercent: action.value };
    case 'SET_INITIAL_ENV_SEGMENTS':
      return { ...state, initialEnvRuleSegments: action.values };
    case 'SET_INITIAL_ENV_CONSTRAINTS':
      return { ...state, initialEnvRuleConstraints: action.values };
    case 'SET_INITIAL_ENV_ENABLED':
      return { ...state, initialEnvRuleEnabled: action.value };
    case 'SET_ARCHIVE_OPEN':
      return { ...state, archiveOpen: action.open };
    case 'SET_DELETE_TARGET':
      return { ...state, deleteTarget: action.target };
    case 'SET_DELETING':
      return { ...state, deleting: action.value };
    case 'SET_ARCHIVE_TARGET':
      return { ...state, archiveTarget: action.target };
    case 'SET_ARCHIVING':
      return { ...state, archiving: action.value };
    case 'SET_METRICS_OPEN':
      return { ...state, metricsDialogOpen: action.open };
    case 'SET_METRICS_TARGET':
      return { ...state, metricsTarget: action.target };
    case 'SET_EDITING':
      return { ...state, editing: action.editing };
    case 'CLOSE_PANEL':
      return { ...state, panelOpen: false, activeGroupId: null };
    case 'RESET_PANEL':
      return {
        ...state,
        panelOpen: false,
        editing: { flag: null, mode: 'create', envId: null },
        generalDirty: false,
        activeGroupId: null,
      };
    default:
      return state;
  }
}

export function useFlagPanels(
  projectId: number | null,
  contexts: ContextDefinition[],
  deleteFlag: { mutateAsync: (flagId: number) => Promise<unknown> },
  archiveFlag: { mutateAsync: (flagId: number) => Promise<unknown> },
  unarchiveFlag: { mutateAsync: (flagId: number) => Promise<unknown> },
  toggleFlagMutation: {
    mutateAsync: (input: {
      flagId: number;
      envId: number;
      enabled: boolean;
      percentage: number;
      segmentIds: number[];
      contextDefinitionId: number | null;
      contextValuesJson: string | null;
    }) => Promise<unknown>;
  },
) {
  const [state, dispatch] = useReducer(panelReducer, initialState);

  const isEnvDirty =
    state.envRulePercent !== state.initialEnvRulePercent ||
    JSON.stringify(state.envRuleSegments) !== JSON.stringify(state.initialEnvRuleSegments) ||
    JSON.stringify(state.envRuleConstraints) !==
      JSON.stringify(state.initialEnvRuleConstraints) ||
    state.envRuleEnabled !== state.initialEnvRuleEnabled;

  const openCreate = useCallback(() => dispatch({ type: 'OPEN_CREATE' }), []);

  const openGeneral = useCallback(
    (flag: FlagView) => dispatch({ type: 'OPEN_GENERAL', flag }),
    [],
  );

  const openEnvironment = useCallback(
    (flag: FlagView, envId: number) =>
      dispatch({ type: 'OPEN_ENVIRONMENT', flag, envId, contexts }),
    [contexts],
  );

  const setPanelOpen = useCallback((open: boolean) => dispatch({ type: 'SET_PANEL_OPEN', open }), []);
  const setExpandedKeys = useCallback(
    (keys: Set<string>) => dispatch({ type: 'SET_EXPANDED_KEYS', keys }),
    [],
  );
  const setGeneralDirty = useCallback(
    (dirty: boolean) => dispatch({ type: 'SET_GENERAL_DIRTY', dirty }),
    [],
  );
  const setActiveGroupId = useCallback(
    (id: string | null) => dispatch({ type: 'SET_ACTIVE_GROUP', id }),
    [],
  );
  const setEnvRulePercent = useCallback(
    (value: number) => dispatch({ type: 'SET_ENV_PERCENT', value }),
    [],
  );
  const setEnvRuleSegments = useCallback(
    (values: number[]) => dispatch({ type: 'SET_ENV_SEGMENTS', values }),
    [],
  );
  const setEnvRuleConstraints = useCallback(
    (values: ConstraintGroup[]) => dispatch({ type: 'SET_ENV_CONSTRAINTS', values }),
    [],
  );
  const setEnvRuleEnabled = useCallback(
    (value: boolean) => dispatch({ type: 'SET_ENV_ENABLED', value }),
    [],
  );
  const setInitialEnvRulePercent = useCallback(
    (value: number) => dispatch({ type: 'SET_INITIAL_ENV_PERCENT', value }),
    [],
  );
  const setInitialEnvRuleSegments = useCallback(
    (values: number[]) => dispatch({ type: 'SET_INITIAL_ENV_SEGMENTS', values }),
    [],
  );
  const setInitialEnvRuleConstraints = useCallback(
    (values: ConstraintGroup[]) => dispatch({ type: 'SET_INITIAL_ENV_CONSTRAINTS', values }),
    [],
  );
  const setInitialEnvRuleEnabled = useCallback(
    (value: boolean) => dispatch({ type: 'SET_INITIAL_ENV_ENABLED', value }),
    [],
  );
  const setArchiveOpen = useCallback(
    (open: boolean) => dispatch({ type: 'SET_ARCHIVE_OPEN', open }),
    [],
  );
  const setDeleteTarget = useCallback(
    (target: FlagView | null) => dispatch({ type: 'SET_DELETE_TARGET', target }),
    [],
  );
  const setArchiveTarget = useCallback(
    (target: FlagView | null) => dispatch({ type: 'SET_ARCHIVE_TARGET', target }),
    [],
  );
  const setMetricsDialogOpen = useCallback(
    (open: boolean) => dispatch({ type: 'SET_METRICS_OPEN', open }),
    [],
  );
  const setMetricsTarget = useCallback(
    (target: { flagId: number; flagName: string; envId: number } | null) =>
      dispatch({ type: 'SET_METRICS_TARGET', target }),
    [],
  );
  const setEditing = useCallback(
    (editing: PanelEditingState) => dispatch({ type: 'SET_EDITING', editing }),
    [],
  );

  const closePanel = useCallback(() => dispatch({ type: 'CLOSE_PANEL' }), []);
  const resetPanel = useCallback(() => dispatch({ type: 'RESET_PANEL' }), []);

  const doDelete = useCallback(async () => {
    if (!projectId || !state.deleteTarget) return;
    dispatch({ type: 'SET_DELETING', value: true });
    try {
      await deleteFlag.mutateAsync(state.deleteTarget.flagId);
      dispatch({ type: 'SET_DELETE_TARGET', target: null });
      dispatch({ type: 'CLOSE_PANEL' });
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      dispatch({ type: 'SET_DELETING', value: false });
    }
  }, [projectId, state.deleteTarget, deleteFlag]);

  const doArchive = useCallback(async () => {
    if (!projectId || !state.archiveTarget) return;
    dispatch({ type: 'SET_ARCHIVING', value: true });
    try {
      await archiveFlag.mutateAsync(state.archiveTarget.flagId);
      dispatch({ type: 'SET_ARCHIVE_TARGET', target: null });
      dispatch({ type: 'CLOSE_PANEL' });
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      dispatch({ type: 'SET_ARCHIVING', value: false });
    }
  }, [projectId, state.archiveTarget, archiveFlag]);

  const doUnarchive = useCallback(
    async (flag: FlagView) => {
      if (!projectId) return;
      try {
        await unarchiveFlag.mutateAsync(flag.flagId);
      } catch (e: unknown) {
        toast.error(getErrorMessage(e));
      }
    },
    [projectId, unarchiveFlag],
  );

  const doToggleFlag = useCallback(
    async (flag: FlagView, envId: number) => {
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
    },
    [projectId, toggleFlagMutation],
  );

  return {
    ...state,
    isEnvDirty,
    openCreate,
    openGeneral,
    openEnvironment,
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
    resetPanel,
    doDelete,
    doArchive,
    doUnarchive,
    doToggleFlag,
    flattenConstraintGroups,
  };
}
