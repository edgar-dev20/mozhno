import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '@/app/components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4 max-w-sm">
      <div className="text-sm">Above the separator</div>
      <Separator />
      <div className="text-sm">Below the separator</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-4">
      <div className="text-sm">Left</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Right</div>
    </div>
  ),
};

export const WithMargin: Story = {
  render: () => (
    <div className="space-y-4 max-w-sm">
      <div className="text-sm">Section 1</div>
      <Separator className="my-4" />
      <div className="text-sm">Section 2</div>
      <Separator className="my-4" />
      <div className="text-sm">Section 3</div>
    </div>
  ),
};
