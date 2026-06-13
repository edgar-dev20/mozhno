import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export function useFlagDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flagId: number) => api.flags.delete(flagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] });
    },
  });
}
