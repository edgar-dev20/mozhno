import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return {
    invalidateFlags: () => queryClient.invalidateQueries({ queryKey: queryKeys.flags.all }),
    invalidateSegments: () => queryClient.invalidateQueries({ queryKey: queryKeys.segments.all }),
    invalidateTags: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags.all }),
    invalidateContexts: () => queryClient.invalidateQueries({ queryKey: queryKeys.contexts.all }),
    invalidateProjects: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    invalidateEnvironments: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.all }),
    invalidateEnriched: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
