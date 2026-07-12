import type { Meta, StoryObj } from '@storybook/react';
import { ColorIcon } from '@/shared/components/ColorIcon';
import { Tag } from '@/shared/icons';

const meta: Meta<typeof ColorIcon> = {
  title: 'Shared/ColorIcon',
  component: ColorIcon,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ColorIcon>;

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ColorIcon color="#3b82f6" icon={<Tag />} />
      <ColorIcon color="#3b82f6" className="size-5" icon={<Tag />} />
      <ColorIcon color="#3b82f6" className="size-6" icon={<Tag />} />
      <ColorIcon color="#3b82f6" className="size-8" icon={<Tag />} />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-2">
      <ColorIcon color="#ef4444" icon={<Tag />} />
      <ColorIcon color="#f97316" icon={<Tag />} />
      <ColorIcon color="#eab308" icon={<Tag />} />
      <ColorIcon color="#22c55e" icon={<Tag />} />
      <ColorIcon color="#3b82f6" icon={<Tag />} />
      <ColorIcon color="#8b5cf6" icon={<Tag />} />
      <ColorIcon color="#ec4899" icon={<Tag />} />
    </div>
  ),
};
