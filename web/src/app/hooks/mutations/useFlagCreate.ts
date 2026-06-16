import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type FlagRequest } from '@/api';

export interface CreateFlagInput {
  name: string;
  key: string;
  description: string;
  flagType: string;
  tags: { tagId: number; value: string }[];
}

export function useFlagCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFlagInput) => {
      const req: FlagRequest = {
        name: input.name,
        key: input.key,
        description: input.description || undefined,
        flagType: input.flagType,
        tags: input.tags.length > 0 ? input.tags : undefined,
      };
      return api.flags.create(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags', 'enriched'] });
    },
  });
}
