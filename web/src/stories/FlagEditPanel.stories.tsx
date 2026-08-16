import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { FlagEditPanel } from '@/app/components/flags/FlagEditPanel';
import type { FlagView } from '@/app/hooks/flagTypes';

const MOCK_FLAG: FlagView = {
  key: 'new-checkout',
  name: 'New Checkout',
  description: 'Checkout flow',
  flagType: 'boolean',
  tags: [{ tagId: 1, tagName: 'frontend', tagColor: '', value: '' }],
  flagId: 1,
  environments: {},
  archived: false,
  createdAt: null,
  createdBy: null,
  archivedBy: null,
  archivedAt: null,
};

const meta: Meta<typeof FlagEditPanel> = {
  title: 'App/Flags/FlagEditPanel',
  component: FlagEditPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlagEditPanel>;

export const Default: Story = {
  args: {
    flag: MOCK_FLAG,
    allTags: [],
    onSave: fn(),
    onArchive: fn(),
    onUnarchive: fn(),
    onDelete: fn(),
  },
};

export const WithTags: Story = {
  args: {
    flag: MOCK_FLAG,
    allTags: [
      { id: 1, projectId: 1, name: 'frontend', description: '', color: '#3b82f6', createdAt: '2025-01-01T00:00:00Z' },
      { id: 2, projectId: 1, name: 'checkout', description: '', color: '#8b5cf6', createdAt: '2025-01-01T00:00:00Z' },
    ],
    onSave: fn(),
    onArchive: fn(),
    onUnarchive: fn(),
    onDelete: fn(),
  },
};

export const Archived: Story = {
  args: {
    flag: {
      ...MOCK_FLAG,
      archived: true,
      archivedBy: 'Anna Lee',
      archivedAt: '2026-03-10T08:00:00Z',
    },
    allTags: [],
    onSave: fn(),
    onArchive: fn(),
    onUnarchive: fn(),
    onDelete: fn(),
  },
};
