import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import { Skeleton } from "@/app/components/ui/skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const TextLine: Story = {
  args: { className: "h-4 w-64" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByText("", { selector: ".animate-pulse" });
    await expect(el).toHaveClass("animate-pulse");
  },
};

export const Card: Story = {
  render: () => (
    <div className="space-y-4 p-6 w-80">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
};
