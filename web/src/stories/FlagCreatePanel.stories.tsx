import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { FlagCreatePanel } from "@/app/components/flags/FlagCreatePanel";

const meta: Meta<typeof FlagCreatePanel> = {
  title: "App/Flags/FlagCreatePanel",
  component: FlagCreatePanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FlagCreatePanel>;

export const Default: Story = { args: { allTags: [], onSave: fn() } };
