import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import type { FlagView } from '@/app/hooks/flagTypes';
import type {
  SegmentResponse,
  Tag as TagType,
  ContextDefinition,
  EnrichedFlagResponse,
} from '@/api';

function createFlagView(f: {
  key: string;
  name: string;
  description: string;
  flagType: string;
  id: number;
  tags: { tagId: number; tagName: string; tagColor: string; value: string }[];
  archived: boolean;
  createdAt: string | null;
  createdBy: string | null;
  archivedBy: string | null;
  archivedAt: string | null;
}): FlagView {
  return {
    key: f.key,
    name: f.name,
    description: f.description ?? '',
    flagType: f.flagType,
    tags: f.tags ?? [],
    flagId: f.id,
    environments: {},
    archived: f.archived,
    createdAt: f.createdAt ?? null,
    createdBy: f.createdBy ?? null,
    archivedBy: f.archivedBy ?? null,
    archivedAt: f.archivedAt ?? null,
  };
}

function transformEnrichedResponse(enriched: EnrichedFlagResponse[]): FlagView[] {
  return enriched.map((e) => {
    const fv = createFlagView(e);
    for (const envState of e.environments) {
      fv.environments[envState.environmentId] = {
        enabled: envState.enabled,
        percentage: envState.percentage,
        segmentIds: envState.segmentIds,
        strategyId: envState.strategyId,
        contextDefinitionId: envState.contextDefinitionId,
        contextValuesJson: envState.contextValuesJson,
        lastUsedAt: envState.lastUsedAt,
      };
    }
    return fv;
  });
}

async function legacyEnrichment(): Promise<{
  flags: FlagView[];
  segments: SegmentResponse[];
  tags: TagType[];
  contexts: ContextDefinition[];
}> {
  const [base, segs, tg, ctx, envs] = await Promise.all([
    api.flags.list(undefined, true),
    api.segments.list(),
    api.tags.list(),
    api.contexts.list(),
    api.environments.list(),
  ]);

  if (base.length === 0) {
    return { flags: [], segments: segs, tags: tg, contexts: ctx };
  }

  const byKey = new Map<string, FlagView>();
  for (const f of base) {
    if (!byKey.has(f.key)) {
      byKey.set(f.key, createFlagView(f));
    }
  }

  const envResults = await Promise.all(
    envs.map((env) => api.flags.list(env.id).then((flags) => ({ envId: env.id, flags }))),
  );

  for (const { envId, flags: envFlags } of envResults) {
    for (const f of envFlags) {
      const v = byKey.get(f.key) ?? byKey.set(f.key, createFlagView(f)).get(f.key)!;
      v.environments[envId] = {
        enabled: f.enabled,
        percentage: f.percentage ?? 100,
        segmentIds: f.segmentIds ?? [],
        strategyId: f.strategyId ?? null,
        contextDefinitionId: f.contextDefinitionId ?? null,
        contextValuesJson: f.contextValuesJson ?? null,
        lastUsedAt: f.lastUsedAt ?? null,
      };
    }
  }

  return {
    flags: Array.from(byKey.values()),
    segments: segs,
    tags: tg,
    contexts: ctx,
  };
}

export interface EnrichedFlagsData {
  flags: FlagView[];
  segments: SegmentResponse[];
  tags: TagType[];
  contexts: ContextDefinition[];
  totalItems?: number;
  totalPages?: number;
}

export function useEnrichedFlagsQuery(projectId: number | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['flags', 'enriched'],
    queryFn: async (): Promise<EnrichedFlagsData> => {
      if (!projectId) {
        return { flags: [], segments: [], tags: [], contexts: [] };
      }

      try {
        const data = await api.flags.listEnriched(0, 500);

        queryClient.setQueryData(['segments', projectId], data.segments);
        queryClient.setQueryData(['tags', projectId], data.tags);
        queryClient.setQueryData(['contexts', projectId], data.contexts);
        queryClient.setQueryData(['environments', projectId], data.environments);

        return {
          flags: transformEnrichedResponse(data.flags),
          segments: data.segments,
          tags: data.tags,
          contexts: data.contexts,
          totalItems: data.totalItems,
          totalPages: data.totalPages,
        };
      } catch {
        return legacyEnrichment();
      }
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });
}
