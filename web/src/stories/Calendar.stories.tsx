import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "storybook/test";
import { Calendar } from "@/app/components/ui/calendar";
import { useState } from "react";

function CalendarDemo({ defaultValue }: { defaultValue?: Date }) {
  const [date, setDate] = useState<Date | undefined>(defaultValue);
  return <Calendar mode="single" selected={date} onSelect={setDate} />;
}

const meta: Meta = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <CalendarDemo /> };

export const WithSelectedDate: Story = {
  render: () => <CalendarDemo defaultValue={new Date(2026, 5, 15)} />,
};

export const SelectDate: Story = {
  render: () => <CalendarDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dayCells = canvas.getAllByRole("gridcell");
    const target = dayCells.find((b) => !b.hasAttribute("data-selected") && !b.hasAttribute("disabled"));
    if (target) {
      await userEvent.click(target);
    }
  },
};
