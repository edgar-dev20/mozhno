import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { SegmentIcon, SegmentIconPicker } from "@/app/components/SegmentIcon";
import { Toaster } from "@/app/components/ui/sonner";
import { useState } from "react";

const meta: Meta<typeof SegmentIcon> = {
  title: "App/SegmentIcon",
  component: SegmentIcon,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(S) => <><S /><Toaster /></>],
};

export default meta;
type Story = StoryObj<typeof SegmentIcon>;

export const Target: Story = { args: { name: "Target", size: 32 } };
export const Users: Story = { args: { name: "Users", size: 32 } };
export const Star: Story = { args: { name: "Star", size: 32 } };
export const All: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap p-4 max-w-sm">
      {["Target", "Users", "Star", "Heart", "Globe", "Shield", "Zap", "Rocket", "Gem", "Brain", "Crown", "Flame"].map((name) => (
        <SegmentIcon key={name} name={name} size={24} />
      ))}
    </div>
  ),
};

export const Picker: Story = {
  render: function PickerRender() { const [v, sv] = useState("Users"); return <SegmentIconPicker value={v} onChange={sv} />; },
};
