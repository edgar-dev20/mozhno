import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "@/shared/components/EmptyState";
import { Rocket } from "@/shared/icons";

const meta: Meta<typeof EmptyState> = {
  title: "Shared/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: { icon: <Rocket size={24} className="text-brand" />, title: "Nothing here", description: "There are no items to display." },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
export const WithAction: Story = { args: { buttonLabel: "Create", onAction: () => alert("Clicked") } };
