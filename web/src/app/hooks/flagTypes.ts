import type { FlagTagValue } from '@/api';

export interface EnvState {
  enabled: boolean;
  percentage: number;
  segmentIds: number[];
  strategyId: number | null;
  contextDefinitionId: number | null;
  contextValuesJson: string | null;
  lastUsedAt: string | null;
}

export interface FlagView {
  key: string;
  name: string;
  description: string;
  flagType: string;
  tags: FlagTagValue[];
  flagId: number;
  environments: Record<number, EnvState>;
  archived: boolean;
  createdAt: string | null;
  createdBy: string | null;
  archivedBy: string | null;
  archivedAt: string | null;
}
