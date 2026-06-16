import type { Meta, StoryObj } from "@storybook/react";
import { Wordmark } from "@/shared/components/Wordmark";

const meta: Meta<typeof Wordmark> = {
  title: "Shared/Wordmark",
  component: Wordmark,
  tags: ["autodocs"],
  args: { text: "mozhno" },
};

export default meta;
type Story = StoryObj<typeof Wordmark>;

export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };
export const ExtraLarge: Story = { args: { size: "xl" } };
