import type { Meta, StoryObj } from "@storybook/react";
import { ColorIcon } from "@/shared/components/ColorIcon";

const meta: Meta<typeof ColorIcon> = {
  title: "Shared/ColorIcon",
  component: ColorIcon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ColorIcon>;

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ColorIcon color="#3b82f6" />
      <ColorIcon color="#3b82f6" className="size-5" />
      <ColorIcon color="#3b82f6" className="size-6" />
      <ColorIcon color="#3b82f6" className="size-8" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-2">
      <ColorIcon color="#ef4444" />
      <ColorIcon color="#f97316" />
      <ColorIcon color="#eab308" />
      <ColorIcon color="#22c55e" />
      <ColorIcon color="#3b82f6" />
      <ColorIcon color="#8b5cf6" />
      <ColorIcon color="#ec4899" />
    </div>
  ),
};
