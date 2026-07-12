import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from 'storybook/test';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

function RadioDemo({
  defaultValue,
  disabled = false,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <RadioGroup defaultValue={defaultValue} disabled={disabled} className="grid gap-3">
      {['Option A', 'Option B', 'Option C'].map((opt) => (
        <div key={opt} className="flex items-center gap-2">
          <RadioGroupItem value={opt} id={opt} />
          <Label htmlFor={opt}>{opt}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export const Default: Story = {
  render: () => <RadioDemo />,
};

export const WithSelection: Story = {
  render: () => <RadioDemo defaultValue="Option B" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const b = canvas.getByLabelText('Option B');
    await expect(b).toBeChecked();
  },
};

export const SelectOption: Story = {
  render: () => <RadioDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const a = canvas.getByLabelText('Option A');
    await expect(a).not.toBeChecked();
    await userEvent.click(a);
    await expect(a).toBeChecked();
  },
};

export const Disabled: Story = {
  render: () => <RadioDemo disabled />,
};
