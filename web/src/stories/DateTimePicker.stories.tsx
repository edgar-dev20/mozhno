import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from 'storybook/test';
import { useState, type ComponentProps } from 'react';
import { DateTimePicker } from '@/shared/components/DateTimePicker';

function Demo(props: Partial<ComponentProps<typeof DateTimePicker>>) {
  const [value, setValue] = useState('');
  return (
    <DateTimePicker
      value={value}
      onChange={setValue}
      placeholder="Select date and time"
      {...props}
    />
  );
}

const meta: Meta<typeof DateTimePicker> = {
  title: 'Shared/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Select date and time/i })).toBeInTheDocument();
  },
};
export const WithValue: Story = {
  render: () => <Demo value="2026-06-15T14:30:00" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /2026/ })).toBeInTheDocument();
  },
};
