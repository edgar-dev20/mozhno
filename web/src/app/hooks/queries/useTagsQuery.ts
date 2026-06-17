import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => api.tags.list(),
    staleTime: 30_000,
  });
}
