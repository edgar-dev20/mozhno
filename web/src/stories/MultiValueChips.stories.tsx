import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { MultiValueChips } from "@/app/components/flags/MultiValueChips";
import { useState } from "react";

const meta: Meta<typeof MultiValueChips> = {
  title: "App/Flags/MultiValueChips",
  component: MultiValueChips,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultiValueChips>;

function EmptyRender() {
  const [v, s] = useState<string[]>([]);
  return <MultiValueChips values={v} onChange={s} />;
}

function WithValuesRender() {
  const [v, s] = useState<string[]>(["US", "CA", "UK"]);
  return <MultiValueChips values={v} onChange={s} />;
}

function WithValidValuesRender() {
  const [v, s] = useState<string[]>(["US"]);
  return <MultiValueChips values={v} onChange={s} validValues={["US", "CA", "UK", "DE", "FR"]} />;
}

export const Empty: Story = { render: EmptyRender };
export const WithValues: Story = { render: WithValuesRender };
export const WithValidValues: Story = { render: WithValidValuesRender };
