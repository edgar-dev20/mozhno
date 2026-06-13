import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type StrategyRequest } from '@/api';

interface UpsertStrategyInput {
  flagId: number;
  environmentId: number;
  enabled: boolean;
  percentage: number;
  segmentIds: number[];
  contextDefinitionId: number | null;
  contextValuesJson: string | null;
}

export function useStrategyUpsert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertStrategyInput) => {
      const req: StrategyRequest = {
        environmentId: input.environmentId,
        enabled: input.enabled,
        percentage: input.percentage,
        segmentIds: input.segmentIds.length > 0 ? input.segmentIds : undefined,
        contextDefinitionId: input.contextDefinitionId ?? undefined,
        contextValuesJson: input.contextValuesJson ?? undefined,
      };
      return api.strategies.upsert(input.flagId, req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
    },
  });
}
