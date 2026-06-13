import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useSegmentsQuery() {
  return useQuery({
    queryKey: queryKeys.segments.all,
    queryFn: () => api.segments.list(),
    staleTime: 30_000,
  });
}
