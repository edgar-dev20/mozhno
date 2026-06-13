import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useFlagUnarchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagId: number) => api.flags.unarchive(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
    },
  });
}
