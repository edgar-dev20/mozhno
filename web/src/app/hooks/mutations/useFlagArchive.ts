import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export function useFlagArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagId: number) => api.flags.archive(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
    },
  });
}
