import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { useState } from 'react';
import { OperatorSelector } from '@/app/components/OperatorSelector';
import type { OperatorDef } from '@/app/components/operators';

const STRING_OPS: OperatorDef[] = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not Equals' },
  { value: 'in', label: 'In', multi: true },
  { value: 'notIn', label: 'Not In', multi: true },
  { value: 'contains', label: 'Contains' },
];

const COMPARABLE_OPS: OperatorDef[] = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less or Equal' },
];

const meta: Meta<typeof OperatorSelector> = {
  title: 'App/Flags/OperatorSelector',
  component: OperatorSelector,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OperatorSelector>;

function StringOpsRender() {
  const [op, setOp] = useState('eq');
  return <OperatorSelector availableOps={STRING_OPS} currentOperator={op} onSelect={setOp} />;
}

function ComparableOpsRender() {
  const [op, setOp] = useState('gt');
  return <OperatorSelector availableOps={COMPARABLE_OPS} currentOperator={op} onSelect={setOp} />;
}

export const StringOps: Story = {
  render: StringOpsRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    const option = await screen.findByText('Contains');
    await expect(option).toBeVisible();
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('Contains');
  },
};
export const ComparableOps: Story = { render: ComparableOpsRender };
