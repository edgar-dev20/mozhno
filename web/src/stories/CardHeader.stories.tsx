import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { CardHeader } from "@/shared/components/CardHeader";

const meta: Meta<typeof CardHeader> = {
  title: "Shared/CardHeader",
  component: CardHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CardHeader>;

export const TitleOnly: Story = { args: { title: "Settings" } };

export const WithSubtitle: Story = {
  args: { title: "Feature Flags", subtitle: "Manage your feature flags and rollouts" },
};

export const WithMeta: Story = {
  args: { title: "Environments", meta: "5 total", subtitle: "Production, staging, and development" },
};

export const LongTitle: Story = {
  args: {
    title: "This is a very long card title that might wrap",
    subtitle: "Subtitle with extra context",
    meta: "42",
  },
};
