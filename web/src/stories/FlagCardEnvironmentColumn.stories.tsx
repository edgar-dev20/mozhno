import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { FlagCardEnvironmentColumn } from '@/app/components/flags/FlagCardEnvironmentColumn';
import type { FlagView } from '@/app/hooks/flagTypes';

const MOCK_FLAG: FlagView = {
  key: 'new-checkout',
  name: 'New Checkout Flow',
  description: '',
  flagType: 'boolean',
  tags: [],
  flagId: 1,
  environments: {
    1: {
      enabled: true,
      percentage: 50,
      segmentIds: [],
      strategyId: null,
      contextDefinitionId: null,
      contextValuesJson: null,
      lastUsedAt: null,
    },
  },
  archived: false,
  createdAt: '2026-01-15T10:30:00Z',
  createdBy: 'Anna Lee',
  archivedBy: null,
  archivedAt: null,
};

const meta: Meta<typeof FlagCardEnvironmentColumn> = {
  title: 'App/Flags/FlagCardEnvironmentColumn',
  component: FlagCardEnvironmentColumn,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlagCardEnvironmentColumn>;

export const Production: Story = {
  args: {
    env: { id: 1, name: 'Production' },
    flag: MOCK_FLAG,
    segments: [],
    sparkBuckets: [],
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
  },
};

export const Staging: Story = {
  args: {
    env: { id: 2, name: 'Staging' },
    flag: MOCK_FLAG,
    segments: [],
    sparkBuckets: [],
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
  },
};
