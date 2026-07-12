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
      { tagId: 1, tagName: 'frontend', tagColor: '#3b82f6', value: '' },
      { tagId: 2, tagName: 'backend', tagColor: '#10b981', value: '' },
      { tagId: 3, tagName: 'critical', tagColor: '#ef4444', value: '' },
    ],
    onSave: fn(),
  },
};
