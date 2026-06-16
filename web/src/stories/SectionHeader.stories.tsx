import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "@/shared/components/SectionHeader";

const meta: Meta<typeof SectionHeader> = {
  title: "Shared/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  args: { title: "Page Title", description: "This is a description of the page content." },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {};
export const GradientOverride: Story = { args: { title: "Custom Gradient", description: "With a different gradient", gradientClass: "from-success to-info" } };
