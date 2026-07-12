import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from 'storybook/test';
import { EmptyState } from '@/shared/components/EmptyState';
import { Rocket } from '@/shared/icons';

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    icon: <Rocket size={24} className="text-brand" />,
    title: 'Nothing here',
    description: 'There are no items to display.',
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const WithAction: Story = {
  args: { buttonLabel: 'Create', onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Create' });
    await userEvent.click(button);
    await expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};
