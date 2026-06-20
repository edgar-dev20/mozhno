import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { SidePanel } from "@/app/components/SidePanel";
import { useState } from "react";

const meta: Meta<typeof SidePanel> = {
  title: "App/SidePanel",
  component: SidePanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <SidePanel open={open} onOpenChange={setOpen} title="Settings" description="Configure your flag settings">
        <div className="p-4 text-sm text-muted-foreground">Panel content goes here</div>
      </SidePanel>
    );
  },
};
