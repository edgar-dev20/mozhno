import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function useEnvironmentsQuery() {
  return useQuery({
    queryKey: ['environments'],
    queryFn: () => api.environments.list(),
    staleTime: 5 * 60_000,
  });
}
