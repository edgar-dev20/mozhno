import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export function useStrategyCreate(flagId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { environmentId: number; enabled?: boolean; percentage?: number }) =>
      api.strategies.create(flagId, {
        environmentId: input.environmentId,
        enabled: input.enabled ?? false,
        percentage: input.percentage ?? 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
    },
  });
}
