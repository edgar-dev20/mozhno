import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useOverviewQuery(projectId: number | null) {
  return useQuery({
    queryKey: queryKeys.overview.all,
    queryFn: () => api.overview.get(),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}
