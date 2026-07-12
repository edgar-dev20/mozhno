import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from 'storybook/test';
import { Fab } from '@/shared/components/Fab';

const meta: Meta<typeof Fab> = {
  title: 'Shared/Fab',
  component: Fab,
  tags: ['autodocs'],
  args: { label: 'Create flag', onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof Fab>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Create flag' });
    await expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const LongLabel: Story = {
  args: { label: 'Create new feature flag with advanced targeting' },
};

export const WithCustomAction: Story = {
  args: {
    label: 'Add environment',
    onClick: fn(),
  },
};
