import type { Meta, StoryObj } from '@storybook/react';
import { ColorBar } from '@/shared/components/ColorBar';

const meta: Meta<typeof ColorBar> = {
  title: 'Shared/ColorBar',
  component: ColorBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ColorBar>;

export const Gradient: Story = {
  args: { color: 'from-brand to-primary' },
};

export const SingleColor: Story = {
  args: { color: 'bg-success' },
};

export const Warning: Story = {
  args: { color: 'bg-warning' },
};
