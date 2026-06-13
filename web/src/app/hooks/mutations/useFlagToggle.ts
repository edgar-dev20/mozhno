import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { api, type StrategyRequest } from '@/api';

interface ToggleFlagInput {
  flagId: number;
  envId: number;
  enabled: boolean;
  percentage: number;
  segmentIds: number[];
  contextDefinitionId: number | null;
  contextValuesJson: string | null;
}

export function useFlagToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ToggleFlagInput) => {
      const req: StrategyRequest = {
        environmentId: input.envId,
        enabled: input.enabled,
        percentage: input.percentage,
        segmentIds: input.segmentIds.length > 0 ? input.segmentIds : undefined,
        contextDefinitionId: input.contextDefinitionId ?? undefined,
        contextValuesJson: input.contextValuesJson ?? undefined,
      };
      return api.strategies.upsert(input.flagId, req);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.flags.enriched });

      const prev = queryClient.getQueryData(queryKeys.flags.enriched);

      queryClient.setQueryData(
        queryKeys.flags.enriched,
        (
          old:
            | { flags: { flagId: number; environments: Record<number, { enabled: boolean }> }[] }
            | undefined,
        ) => {
          if (!old) return old;
          return {
            ...old,
            flags: old.flags.map((f) =>
              f.flagId === input.flagId
                ? {
                    ...f,
                    environments: {
                      ...f.environments,
                      [input.envId]: {
                        ...f.environments[input.envId],
                        enabled: input.enabled,
                      },
                    },
                  }
                : f,
            ),
          };
        },
      );

      return { prev };
    },
    onError: (_err, _input, context) => {
      if (context?.prev) {
        queryClient.setQueryData(queryKeys.flags.enriched, context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
    },
  });
}
