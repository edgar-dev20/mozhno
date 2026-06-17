import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, FlagRequest, FlagTagValue } from '@/api';
import type { FlagView, EnvState } from '@/app/hooks/flagTypes';
import type { ConstraintEntry } from '@/app/components/flags/types';
import type { DiffChange } from '@/shared/diffUtils';
import { getErrorMessage } from '@/shared/errorHandler';
import type { EnrichedFlagsData } from '@/app/hooks/queries/useEnrichedFlagsQuery';

interface SaveDeps {
  projectId: number;
  environments: { id: number; name: string }[];
  onSaveSuccess?: (saved?: {
    key: string;
    name: string;
    description: string;
    flagType: string;
    tags: FlagTagValue[];
  }) => void;
}

interface CreateSaveData {
  name: string;
  key: string;
  description: string;
  flagType: string;
  tags: FlagTagValue[];
}

interface GeneralSaveData {
  flag: FlagView;
  name: string;
  key: string;
  description: string;
  flagType: string;
  tags: FlagTagValue[];
}

interface EnvironmentSaveData {
  flag: FlagView;
  envId: number;
  enabled: boolean;
  percentage: number;
  segmentIds: number[];
  constraints: ConstraintEntry[];
  initialEnabled: boolean;
  initialPercentage: number;
  initialSegments: number[];
  initialConstraints: ConstraintEntry[];
}

type SaveConfig =
  | { mode: 'create'; data: CreateSaveData }
  | { mode: 'general'; data: GeneralSaveData }
  | { mode: 'environment'; data: EnvironmentSaveData };

export function useFlagSave(deps: SaveDeps) {
  const { projectId, environments, onSaveSuccess } = deps;
  const queryClient = useQueryClient();

  const invalidateFlags = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] }),
    [queryClient],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);
  const pendingConfig = useRef<SaveConfig | null>(null);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  onSaveSuccessRef.current = onSaveSuccess;

  const executeSaveImpl = useCallback(
    async (config: SaveConfig) => {
      setError('');
      setSaving(true);
      try {
        if (config.mode === 'create') {
          const { name, key, description, flagType, tags } = config.data;
          const tagsPayload = tags.map((t) => ({ tagId: t.tagId, value: t.value }));
          const created = await api.flags.create({
            name,
            key,
            description,
            flagType,
            tags: tagsPayload.length > 0 ? tagsPayload : undefined,
          });
          for (const env of environments) {
            await api.strategies.create(created.id, {
              environmentId: env.id,
              enabled: false,
              percentage: 100,
            });
          }

          const newEnvStates: Record<number, EnvState> = {};
          for (const env of environments) {
            newEnvStates[env.id] = {
              enabled: false,
              percentage: 100,
              segmentIds: [],
              strategyId: null,
              contextDefinitionId: null,
              contextValuesJson: null,
              lastUsedAt: null,
            };
          }

          const newFlag: FlagView = {
            key: created.key,
            name: created.name,
            description: created.description ?? '',
            flagType: created.flagType,
            tags: created.tags ?? [],
            flagId: created.id,
            environments: newEnvStates,
            archived: created.archived ?? false,
            createdAt: created.createdAt ?? null,
            createdBy: created.createdBy ?? null,
            archivedBy: created.archivedBy ?? null,
            archivedAt: created.archivedAt ?? null,
          };

          queryClient.setQueryData<EnrichedFlagsData>(['flags', 'enriched'], (old) => {
            if (!old) return old;
            return {
              ...old,
              flags: [newFlag, ...old.flags],
              totalItems: (old.totalItems ?? 0) + 1,
            };
          });

          invalidateFlags();
          onSaveSuccessRef.current?.();
        } else if (config.mode === 'general') {
          const { flag, name, key, description, flagType, tags } = config.data;
          const tagsPayload = tags.map((t) => ({ tagId: t.tagId, value: t.value }));
          const req = {
            name,
            key,
            description,
            flagType,
            tags: tagsPayload.length > 0 ? tagsPayload : undefined,
          } as FlagRequest;
          const envFlags = await api.flags.list(Object.keys(flag.environments).map(Number)[0]);
          const match = envFlags.find((f) => f.key === flag.key);
          if (match) await api.flags.update(match.id, req);
          queryClient.setQueryData<EnrichedFlagsData>(['flags', 'enriched'], (old) => {
            if (!old) return old;
            return {
              ...old,
              flags: old.flags.map((f) =>
                f.key === flag.key
                  ? {
                      ...f,
                      name,
                      key,
                      description: description ?? '',
                      flagType,
                      tags,
                    }
                  : f,
              ),
            };
          });

          invalidateFlags();
          onSaveSuccessRef.current?.({ key, name, description, flagType, tags });
        } else if (config.mode === 'environment') {
          const { flag, envId, enabled, percentage, segmentIds, constraints } = config.data;
          const envFlags = await api.flags.list(envId);
          const envFlag = envFlags.find((f) => f.key === flag.key);
          if (!envFlag) {
            setError('Flag not found in environment. Please refresh the page.');
            setSaving(false);
            return;
          }
          let contextDefId: number | undefined;
          let contextValuesJson: string | undefined;
          if (constraints.length > 0) {
            contextDefId = constraints[0].contextDefId;
            contextValuesJson = JSON.stringify(
              constraints.map((c) => ({ cd: c.contextDefId, op: c.operator, val: c.value })),
            );
          }
          await api.strategies.upsert(envFlag.id, {
            environmentId: envId,
            enabled,
            percentage,
            segmentIds: segmentIds.length > 0 ? segmentIds : undefined,
            contextDefinitionId: contextDefId,
            contextValuesJson,
          });
          queryClient.setQueryData<EnrichedFlagsData>(['flags', 'enriched'], (old) => {
            if (!old) return old;
            return {
              ...old,
              flags: old.flags.map((f) =>
                f.key === flag.key
                  ? {
                      ...f,
                      environments: {
                        ...f.environments,
                        [envId]: {
                          enabled,
                          percentage,
                          segmentIds,
                          strategyId: f.environments[envId]?.strategyId ?? null,
                          contextDefinitionId: contextDefId ?? null,
                          contextValuesJson: contextValuesJson ?? null,
                          lastUsedAt: f.environments[envId]?.lastUsedAt ?? null,
                        },
                      },
                    }
                  : f,
              ),
            };
          });

          invalidateFlags();
          onSaveSuccessRef.current?.();
        }
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      } finally {
        setSaving(false);
      }
    },
    [projectId, environments, invalidateFlags, queryClient],
  );

  const save = useCallback(
    (config: SaveConfig) => {
      executeSaveImpl(config);
    },
    [executeSaveImpl],
  );

  const showDiff = useCallback((changes: DiffChange[], config: SaveConfig) => {
    pendingConfig.current = config;
    setDiffChanges(changes);
    setDiffOpen(true);
  }, []);

  const confirmDiff = useCallback(() => {
    setDiffOpen(false);
    if (pendingConfig.current) {
      executeSaveImpl(pendingConfig.current);
    }
  }, [executeSaveImpl]);

  const closeDiff = useCallback(() => {
    setDiffOpen(false);
    pendingConfig.current = null;
  }, []);

  return {
    save,
    showDiff,
    confirmDiff,
    closeDiff,
    saving,
    error,
    diffOpen,
    diffChanges,
  };
}
