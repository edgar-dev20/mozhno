import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useProjectQuery() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const projects = await api.projects.list();
      if (projects.length === 0) return null;
      return projects[0];
    },
    staleTime: 5 * 60_000,
  });
}
