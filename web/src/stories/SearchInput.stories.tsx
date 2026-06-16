import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "@/shared/components/SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Shared/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: { value: "", placeholder: "Search..." },
  argTypes: { onChange: { action: "changed" } },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {};
export const WithValue: Story = { args: { value: "test query" } };
