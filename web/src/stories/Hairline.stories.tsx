import type { Meta, StoryObj } from '@storybook/react';
import { Hairline } from '@/shared/components/Hairline';

const meta: Meta<typeof Hairline> = {
  title: 'Shared/Hairline',
  component: Hairline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Hairline>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4 max-w-sm">
      <div className="text-sm text-foreground/70">Section 1 content</div>
      <Hairline />
      <div className="text-sm text-foreground/70">Section 2 content</div>
    </div>
  ),
};

export const WithMargin: Story = {
  render: () => (
    <div className="space-y-0 max-w-sm">
      <div className="text-sm text-foreground/70 p-3">Top section</div>
      <Hairline className="my-4" />
      <div className="text-sm text-foreground/70 p-3">Bottom section</div>
    </div>
  ),
};
