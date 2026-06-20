import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { useState } from "react";
import { DateRangePicker } from "@/shared/components/DateRangePicker";

function Demo(props: Record<string, any>) {
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  return <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f ?? null); setTo(t ?? null); }} placeholder="Select date range" {...props} />;
}

const meta: Meta<typeof DateRangePicker> = {
  title: "Shared/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = { render: () => <Demo /> };
export const WithPresets: Story = { render: () => <Demo presets /> };
export const WithRange: Story = {
  render: () => {
    function D() { const [f, sf] = useState<Date | null>(new Date(2026, 5, 1)); const [t, st] = useState<Date | null>(new Date(2026, 5, 15)); return <DateRangePicker from={f} to={t} onChange={(ff, tt) => { sf(ff ?? null); st(tt ?? null); }} placeholder="Select date range" />; }
    return <D />;
  },
};
