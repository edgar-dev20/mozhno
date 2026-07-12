import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from 'storybook/test';
import { InfoTip } from '@/shared/components/InfoTip';
import { TooltipProvider } from '@/app/components/ui/tooltip';

const meta: Meta<typeof InfoTip> = {
  title: 'Shared/InfoTip',
  component: InfoTip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  args: { text: 'This metric shows the total count of evaluations.' },
};

export default meta;
type Story = StoryObj<typeof InfoTip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button');
    await expect(btn).toBeInTheDocument();
  },
};

export const TopSide: Story = { args: { side: 'top' } };

export const BottomSide: Story = { args: { side: 'bottom' } };

export const LongText: Story = {
  args: {
    text: 'This value represents the total number of feature flag evaluations performed across all environments in the last 30 days. Higher values indicate more active usage.',
  },
};

export const CustomSize: Story = {
  args: { size: 16 },
};

export const CustomClass: Story = {
  args: { className: 'text-warning/60 hover:text-warning' },
};
