import type { FlagTagValue, SegmentResponse, Tag as TagType, ContextDefinition } from '@/api';
import type { FlagView } from '@/app/hooks/flagTypes';

export interface ConstraintEntry {
  contextDefId: number;
  operator: string;
  value: string;
}

export interface ConstraintGroup {
  id: string;
  contextDefId: number;
  operator: string;
  values: string[];
}

export interface EditingState {
  flag: FlagView | null;
  mode: 'create' | 'general' | 'environment';
  envId: number | null;
}

export interface CreateFormData {
  name: string;
  key: string;
  description: string;
  flagType: string;
  tags: FlagTagValue[];
}

export interface GeneralFormData {
  name: string;
  key: string;
  description: string;
  flagType: string;
  tags: FlagTagValue[];
}

export interface EnvironmentFormState {
  percent: number;
  segments: number[];
  constraints: ConstraintEntry[];
  enabled: boolean;
  initialPercent: number;
  initialSegments: number[];
  initialConstraints: ConstraintEntry[];
  initialEnabled: boolean;
}

export interface FlagCardProps {
  flag: FlagView;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenGeneral: (flag: FlagView) => void;
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  environments: { id: number; name: string }[];
  segments: SegmentResponse[];
  tags: TagType[];
  contexts: ContextDefinition[];
  sparklineData: Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
}

export interface FlagFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  flagTypeFilter: string | null;
  onFlagTypeFilterChange: (t: string | null) => void;
  dateFrom: string;
  dateTo: string;
  onDateChange: (from: string, to: string) => void;
  sortBy: 'name' | 'createdAt';
  onSortByChange: (s: 'name' | 'createdAt') => void;
  tags: TagType[];
  selectedTagTypeFilter: number | null;
  onTagTypeFilterChange: (id: number | null) => void;
  selectedTagValueFilter: string | null;
  onTagValueFilterChange: (v: string | null) => void;
  uniqueTagValues: (typeId: number) => string[];
}

export interface ArchivedFlagsListProps {
  flags: FlagView[];
  open: boolean;
  onToggle: () => void;
  onUnarchive: (flag: FlagView) => void;
  tags: TagType[];
}
