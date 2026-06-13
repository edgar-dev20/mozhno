import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useEnvironmentsQuery() {
  return useQuery({
    queryKey: queryKeys.environments.all,
    queryFn: () => api.environments.list(),
    staleTime: 5 * 60_000,
  });
}
