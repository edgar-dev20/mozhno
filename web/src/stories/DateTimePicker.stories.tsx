import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import { DateTimePicker } from "@/shared/components/DateTimePicker";

function Demo(props: Partial<ComponentProps<typeof DateTimePicker>>) {
  const [value, setValue] = useState("");
  return <DateTimePicker value={value} onChange={setValue} placeholder="Select date and time" {...props} />;
}

const meta: Meta<typeof DateTimePicker> = {
  title: "Shared/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = { render: () => <Demo /> };
export const WithValue: Story = { render: () => <Demo value="2026-06-15T14:30:00" /> };
