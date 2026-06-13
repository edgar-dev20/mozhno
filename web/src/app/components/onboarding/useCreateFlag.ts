import { useState, useCallback } from 'react';
import { api } from '@/api';
import { useT } from '@/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';

interface UseCreateFlagReturn {
  flagName: string;
  setFlagName: (v: string) => void;
  flagKey: string;
  setFlagKey: (v: string) => void;
  creatingFlag: boolean;
  flagError: string;
  flagCreated: boolean;
  handleCreateFlag: () => Promise<void>;
  resetFlag: () => void;
}

export function useCreateFlag(): UseCreateFlagReturn {
  const t = useT();
  const queryClient = useQueryClient();
  const [flagName, setFlagName] = useState('');
  const [flagKey, setFlagKey] = useState('');
  const [creatingFlag, setCreatingFlag] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [flagCreated, setFlagCreated] = useState(false);

  const handleCreateFlag = useCallback(async () => {
    if (!flagName.trim() || !flagKey.trim()) {
      setFlagError(t('onboarding.flagValidationError'));
      return;
    }
    setCreatingFlag(true);
    setFlagError('');
    try {
      const environments = await api.environments.list();
      const created = await api.flags.create({
        name: flagName.trim(),
        key: flagKey.trim(),
        flagType: 'RELEASE',
      });
      for (const env of environments) {
        await api.strategies.create(created.id, {
          environmentId: env.id,
          enabled: false,
          percentage: 100,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
      setFlagCreated(true);
    } catch (e) {
      setFlagError((e as Error).message || t('onboarding.flagCreateError'));
    } finally {
      setCreatingFlag(false);
    }
  }, [flagName, flagKey, t, queryClient]);

  const resetFlag = useCallback(() => {
    setFlagName('');
    setFlagKey('');
    setFlagCreated(false);
    setFlagError('');
    setCreatingFlag(false);
  }, []);

  return {
    flagName,
    setFlagName,
    flagKey,
    setFlagKey,
    creatingFlag,
    flagError,
    flagCreated,
    handleCreateFlag,
    resetFlag,
  };
}
