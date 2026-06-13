import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBox } from '@/shared/components/ErrorBox';

const meta: Meta<typeof ErrorBox> = {
  title: 'Shared/ErrorBox',
  component: ErrorBox,
  tags: ['autodocs'],
  args: { children: 'Something went wrong.' },
};

export default meta;
type Story = StoryObj<typeof ErrorBox>;

export const Default: Story = {};
export const LongError: Story = {
  args: {
    children: 'A very long error message with details about what went wrong and how to fix it.',
  },
};
