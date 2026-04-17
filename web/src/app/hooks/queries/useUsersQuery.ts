import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function useUsersQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
    enabled,
    staleTime: 5 * 60_000,
  });
}
