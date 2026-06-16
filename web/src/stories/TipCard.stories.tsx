import type { Meta, StoryObj } from "@storybook/react";
import { TipCard } from "@/app/components/TipCard";

const meta: Meta<typeof TipCard> = {
  title: "App/TipCard",
  component: TipCard,
  tags: ["autodocs"],
  args: { text: "This is a helpful tip for users.", label: "Tip", storageKey: "storybook" },
};

export default meta;
type Story = StoryObj<typeof TipCard>;

export const Default: Story = {};
export const WithoutLabel: Story = { args: { label: undefined, text: "A tip without a label badge." } };
