import type { Meta, StoryObj } from "@storybook/react";
import { SkipLink } from "@/shared/components/SkipLink";

const meta: Meta<typeof SkipLink> = {
  title: "Shared/SkipLink",
  component: SkipLink,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SkipLink>;

export const Default: Story = {
  args: { href: "#main-content", children: "Skip to main content" },
};
