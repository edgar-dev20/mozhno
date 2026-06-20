import type { Meta, StoryObj } from "@storybook/react";
import { fn, within, expect } from "storybook/test";
import { ConstraintRow } from "@/app/components/ConstraintRow";

const SAMPLE_CONTEXTS = [
  { id: 1, name: "Country", type: "STRING" as const, createdAt: "", updatedAt: "" },
  { id: 2, name: "Platform", type: "STRING" as const, createdAt: "", updatedAt: "" },
  { id: 3, name: "Version", type: "STRING" as const, createdAt: "", updatedAt: "" },
] as any[];

const meta: Meta<typeof ConstraintRow> = {
  title: "App/ConstraintRow",
  component: ConstraintRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConstraintRow>;

export const Active: Story = {
  args: {
    id: "c1",
    contextDefId: 1,
    operator: "eq",
    valuesPreview: "US, CA",
    contexts: SAMPLE_CONTEXTS,
    isActive: true,
    onToggle: fn(),
    onContextChange: fn(),
    onOperatorChange: fn(),
    onRemove: fn(),
    children: () => <span>Value editor placeholder</span>,
  },
};

export const Inactive: Story = {
  args: {
    id: "c2",
    contextDefId: 2,
    operator: "in",
    valuesPreview: "ios, android",
    contexts: SAMPLE_CONTEXTS,
    isActive: false,
    onToggle: fn(),
    onContextChange: fn(),
    onOperatorChange: fn(),
    onRemove: fn(),
    children: () => <span>Value editor placeholder</span>,
  },
};

export const EmptyValue: Story = {
  args: {
    id: "c3",
    contextDefId: 1,
    operator: "gt",
    valuesPreview: "",
    contexts: SAMPLE_CONTEXTS,
    isActive: true,
    onToggle: fn(),
    onContextChange: fn(),
    onOperatorChange: fn(),
    onRemove: fn(),
    children: () => <span>Value editor placeholder</span>,
  },
};
