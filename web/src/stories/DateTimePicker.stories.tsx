import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { useState } from "react";
import { DateTimePicker } from "@/shared/components/DateTimePicker";

function Demo(props: Record<string, any>) {
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
