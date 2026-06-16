import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/shared/components/Card";

const meta: Meta<typeof Card> = {
  title: "Shared/Card",
  component: Card,
  tags: ["autodocs"],
  args: { children: <div className="p-6">Card content</div> },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = { args: { variant: "default" } };
export const Elevated: Story = { args: { variant: "elevated" } };
export const Panel: Story = { args: { variant: "panel" } };
export const Padded: Story = { args: { padded: true } };
export const Dimmed: Story = { args: { dimmed: true, variant: "default" } };
export const Selectable: Story = { args: { variant: "selectable", children: <div className="p-6">Clickable</div> } };
export const Selected: Story = { args: { variant: "selectable", selected: true, children: <div className="p-6">Selected</div> } };
