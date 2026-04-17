import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function useContextsQuery() {
  return useQuery({
    queryKey: ['contexts'],
    queryFn: () => api.contexts.list(),
    staleTime: 30_000,
  });
}
