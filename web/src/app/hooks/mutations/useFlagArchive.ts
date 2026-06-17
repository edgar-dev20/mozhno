import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

export function useFlagArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagId: number) => api.flags.archive(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flags.enriched });
    },
  });
}
