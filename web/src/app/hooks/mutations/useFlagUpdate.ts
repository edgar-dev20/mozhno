import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type FlagRequest } from '@/api';

export interface UpdateFlagInput {
  flagId: number;
  name: string;
  key: string;
  description: string;
  flagType: string;
  tags: { tagId: number; value: string }[];
}

export function useFlagUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateFlagInput) => {
      const req: FlagRequest = {
        name: input.name,
        key: input.key,
        description: input.description || undefined,
        flagType: input.flagType,
        tags: input.tags.length > 0 ? input.tags : undefined,
      };
      return api.flags.update(input.flagId, req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
    },
  });
}
