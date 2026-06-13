import { useQueryClient } from '@tanstack/react-query';

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  return {
    invalidateFlags: () =>
      queryClient.invalidateQueries({ queryKey: ['flags'] }),
    invalidateSegments: () =>
      queryClient.invalidateQueries({ queryKey: ['segments'] }),
    invalidateTags: () =>
      queryClient.invalidateQueries({ queryKey: ['tags'] }),
    invalidateContexts: () =>
      queryClient.invalidateQueries({ queryKey: ['contexts'] }),
    invalidateProjects: () =>
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
    invalidateEnvironments: () =>
      queryClient.invalidateQueries({ queryKey: ['environments'] }),
    invalidateEnriched: (projectId: number) =>
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] }),
    invalidateAll: () =>
      queryClient.invalidateQueries(),
  };
}
