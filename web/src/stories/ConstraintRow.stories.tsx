import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from 'storybook/test';
import { ConstraintRow } from '@/app/components/ConstraintRow';
import type { ContextDefinition } from '@/api';

const SAMPLE_CONTEXTS: ContextDefinition[] = [
  {
    id: 1,
    name: 'Country',
    key: 'country',
    type: 'STRING',
    projectId: 1,
    createdBy: null,
    description: '',
    isStrict: false,
    validValues: [],
    createdAt: '',
  },
  {
    id: 2,
    name: 'Platform',
    key: 'platform',
    type: 'STRING',
    projectId: 1,
    createdBy: null,
    description: '',
    isStrict: false,
    validValues: [],
    createdAt: '',
  },
  {
    id: 3,
    name: 'Version',
    key: 'version',
    type: 'STRING',
    projectId: 1,
    createdBy: null,
    description: '',
    isStrict: false,
    validValues: [],
    createdAt: '',
  },
];

const meta: Meta<typeof ConstraintRow> = {
  title: 'App/Flags/ConstraintRow',
  component: ConstraintRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConstraintRow>;

export const Active: Story = {
  args: {
    id: 'c1',
    contextDefId: 1,
    operator: 'eq',
    valuesPreview: 'US, CA',
    contexts: SAMPLE_CONTEXTS,
    isActive: true,
    onToggle: fn(),
    onContextChange: fn(),
    onOperatorChange: fn(),
    onRemove: fn(),
    children: () => <span>Value editor placeholder</span>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
  },
};

export const Inactive: Story = {
  args: {
    id: 'c2',
    contextDefId: 2,
    operator: 'in',
    valuesPreview: 'ios, android',
    contexts: SAMPLE_CONTEXTS,
    isActive: false,
    onToggle: fn(),
    onContextChange: fn(),
    onOperatorChange: fn(),
    onRemove: fn(),
    children: () => <span>Value editor placeholder</span>,
  },
};

export const EmptyValue: Story = {
  args: {
    id: 'c3',
    contextDefId: 1,
    operator: 'gt',
    valuesPreview: '',
    contexts: SAMPLE_CONTEXTS,
    isActive: true,
    onToggle: fn(),
    onContextChange: fn(),
    onOperatorChange: fn(),
    onRemove: fn(),
    children: () => <span>Value editor placeholder</span>,
  },
};
