import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useUsersQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => api.users.list(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
