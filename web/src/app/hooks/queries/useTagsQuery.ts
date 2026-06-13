import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function useTagsQuery() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => api.tags.list(),
    staleTime: 30_000,
  });
}
