import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { FlagCreatePanel } from '@/app/components/flags/FlagCreatePanel';

const meta: Meta<typeof FlagCreatePanel> = {
  title: 'App/Flags/FlagCreatePanel',
  component: FlagCreatePanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlagCreatePanel>;

export const Default: Story = { args: { allTags: [], onSave: fn() } };

export const WithTags: Story = {
  args: {
    allTags: [
      { id: 1, projectId: 1, name: 'frontend', description: '', color: '#3b82f6', createdAt: '2025-01-01T00:00:00Z' },
      { id: 2, projectId: 1, name: 'backend', description: '', color: '#10b981', createdAt: '2025-01-01T00:00:00Z' },
      { id: 3, projectId: 1, name: 'critical', description: '', color: '#ef4444', createdAt: '2025-01-01T00:00:00Z' },
    ],
    onSave: fn(),
  },
};
