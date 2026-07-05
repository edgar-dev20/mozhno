import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import { useState, type ComponentProps } from "react";
import { DatePicker } from "@/shared/components/DatePicker";

function DatePickerDemo(props: Partial<ComponentProps<typeof DatePicker>>) {
  const [date, setDate] = useState<Date | null>(null);
  return <DatePicker value={date} onChange={(d) => setDate(d ?? null)} placeholder="Pick a date" {...props} />;
}

const meta: Meta<typeof DatePicker> = {
  title: "Shared/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: () => <DatePickerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Pick a date" })).toBeInTheDocument();
  },
};

export const WithValue: Story = {
  render: () => {
    function Demo() {
      const [date, setDate] = useState<Date | null>(new Date(2026, 5, 15));
      return <DatePicker value={date} onChange={(d) => setDate(d ?? null)} placeholder="Pick a date" />;
    }
    return <Demo />;
  },
};

export const WithMinDate: Story = {
  render: () => <DatePickerDemo minDate={new Date(2026, 5, 1)} />,
};
