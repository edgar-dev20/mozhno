import type { Meta, StoryObj } from '@storybook/react';
import { InlineDiffBar } from '@/app/components/InlineDiffBar';
import type { DiffChange } from '@/shared/diffUtils';

const CHANGES: DiffChange[] = [
  { field: 'name', label: 'Name', before: 'old-flag', after: 'new-flag', group: 'General' },
  {
    field: 'desc',
    label: 'Description',
    before: 'Old text',
    after: 'Updated description',
    group: 'General',
  },
  { field: 'pct', label: 'Percentage', before: '50%', after: '75%', group: 'Strategy' },
];

const meta: Meta<typeof InlineDiffBar> = {
  title: 'App/InlineDiffBar',
  component: InlineDiffBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InlineDiffBar>;

export const WithChanges: Story = { args: { changes: CHANGES } };
export const SingleChange: Story = { args: { changes: [CHANGES[0]] } };
export const Empty: Story = { args: { changes: [] } };
