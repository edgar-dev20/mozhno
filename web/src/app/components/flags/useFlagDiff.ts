import { useCallback, useMemo } from 'react';
import type { DiffChange } from '@/shared/diffUtils';
import type { FlagTagValue, SegmentResponse, ContextDefinition } from '@/api';
import type { ConstraintGroup } from '@/app/components/flags/types';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { EditFlagFormValues } from '@/app/components/flags/schemas';
import {
  buildGeneralFlagDiff,
  buildEnvironmentDiff,
  type DiffContext,
} from '@/app/components/flags/FlagsDiffBuilder';

interface FlagDiffInput {
  flag: FlagView;
  data: { name: string; description: string; flagType: string };
  tags: FlagTagValue[];
}

interface EnvDiffInput {
  current: {
    enabled: boolean;
    percentage: number;
    segments: number[];
    constraints: ConstraintGroup[];
  };
  initial: {
    enabled: boolean;
    percentage: number;
    segments: number[];
    constraints: ConstraintGroup[];
  };
}

export function useFlagDiff(
  t: (key: string, params?: Record<string, string>) => string,
  segments: SegmentResponse[],
  contexts: ContextDefinition[],
) {
  const diffCtx: DiffContext = useMemo(() => ({ t, segments, contexts }), [t, segments, contexts]);

  const computeGeneralDiff = useCallback(
    (input: FlagDiffInput): DiffChange[] =>
      buildGeneralFlagDiff(input.flag, input.data, input.tags, diffCtx),
    [diffCtx],
  );

  const computeEnvironmentDiff = useCallback(
    (input: EnvDiffInput): DiffChange[] =>
      buildEnvironmentDiff(input.current, input.initial, diffCtx),
    [diffCtx],
  );

  return { computeGeneralDiff, computeEnvironmentDiff };
}
