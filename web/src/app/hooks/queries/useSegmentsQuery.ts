import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function useSegmentsQuery() {
  return useQuery({
    queryKey: ['segments'],
    queryFn: () => api.segments.list(),
    staleTime: 30_000,
  });
}
