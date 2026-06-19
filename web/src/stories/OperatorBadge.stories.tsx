import type { Meta, StoryObj } from "@storybook/react";
import { OperatorBadge } from "@/app/components/OperatorBadge";

const meta: Meta<typeof OperatorBadge> = {
  title: "App/OperatorBadge",
  component: OperatorBadge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OperatorBadge>;

export const Equals: Story = { args: { operator: "eq" } };
export const NotEquals: Story = { args: { operator: "ne" } };
export const In: Story = { args: { operator: "in" } };
export const NotIn: Story = { args: { operator: "notIn" } };
export const Contains: Story = { args: { operator: "contains" } };
export const GreaterThan: Story = { args: { operator: "gt" } };
export const LessThan: Story = { args: { operator: "lt" } };
export const GreaterOrEqual: Story = { args: { operator: "gte" } };
export const LessOrEqual: Story = { args: { operator: "lte" } };

export const AllOperators: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      {["eq", "ne", "in", "notIn", "contains", "gt", "gte", "lt", "lte"].map((op) => (
        <OperatorBadge key={op} operator={op} />
      ))}
    </div>
  ),
};
