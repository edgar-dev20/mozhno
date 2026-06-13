import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export function useFlagUnarchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagId: number) => api.flags.unarchive(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
    },
  });
}
