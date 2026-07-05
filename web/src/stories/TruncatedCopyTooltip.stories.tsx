import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "storybook/test";
import { TruncatedCopyTooltip } from "@/shared/components/TruncatedCopyTooltip";
import { TooltipProvider } from "@/app/components/ui/tooltip";

const meta: Meta<typeof TruncatedCopyTooltip> = {
  title: "Shared/TruncatedCopyTooltip",
  component: TruncatedCopyTooltip,
  tags: ["autodocs"],
  decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
};

export default meta;
type Story = StoryObj<typeof TruncatedCopyTooltip>;

export const Short: Story = {
  args: { value: "my-flag-name" },
};

export const Long: Story = {
  args: {
    value: "very-long-feature-flag-name-that-should-be-truncated-in-the-ui-12345",
  },
};

export const UUID: Story = {
  args: {
    value: "550e8400-e29b-41d4-a716-446655440000",
    className: "font-mono text-sm",
  },
};

export const HoverAndCopy: Story = {
  args: { value: "production-api-key-2024" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText("production-api-key-2024");
    await userEvent.hover(trigger);
    await expect(canvas.getByText("production-api-key-2024")).toBeInTheDocument();
  },
};
