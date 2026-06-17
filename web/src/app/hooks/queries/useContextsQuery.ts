import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useContextsQuery() {
  return useQuery({
    queryKey: queryKeys.contexts.all,
    queryFn: () => api.contexts.list(),
    staleTime: 30_000,
  });
}
