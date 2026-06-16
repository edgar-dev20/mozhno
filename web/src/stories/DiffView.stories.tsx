import type { Meta, StoryObj } from '@storybook/react';
import { DiffView } from '@/app/components/DiffView';
import type { DiffChange } from '@/shared/diffUtils';

const meta: Meta<typeof DiffView> = {
  title: 'Components/DiffView',
  component: DiffView,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DiffView>;

const sampleChanges: DiffChange[] = [
  { field: 'name', label: 'Name', before: 'Old flag', after: 'New flag', group: 'General' },
  { field: 'description', label: 'Description', before: 'Old description', after: 'New description', group: 'General' },
  { field: 'percentage', label: 'Rollout percentage', before: '50%', after: '75%', group: 'Strategy' },
  { field: 'constraint-1', label: 'Targeting rule', before: 'country IN ["US"]', after: 'country IN ["US", "CA"]', group: 'Constraints' },
  { field: 'constraint-2', label: 'Targeting rule (removed)', before: 'platform IN ["ios"]', after: '', group: 'Constraints' },
  { field: 'constraint-3', label: 'Targeting rule (added)', before: '', after: 'version >= "2.0"', group: 'Constraints' },
];

export const WithGroups: Story = { args: { changes: sampleChanges } };

export const SingleChange: Story = {
  args: {
    changes: [sampleChanges[0]],
  },
};

export const Empty: Story = { args: { changes: [] } };
