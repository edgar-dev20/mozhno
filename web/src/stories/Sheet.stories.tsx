import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect, screen } from "storybook/test";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import { useState } from "react";

function SheetDemo({ side = "right", title = "Sheet Title" }: { side?: "left" | "right" | "top" | "bottom"; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>Open Sheet</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>This sheet slides in from the {side}.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

const meta: Meta = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Right: Story = {
  render: () => <SheetDemo side="right" title="Right Sheet" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open Sheet" }));
    await expect(screen.getByText("Right Sheet")).toBeVisible();
  },
};

export const Left: Story = { render: () => <SheetDemo side="left" title="Left Sheet" /> };
export const Top: Story = { render: () => <SheetDemo side="top" title="Top Sheet" /> };
export const Bottom: Story = { render: () => <SheetDemo side="bottom" title="Bottom Sheet" /> };
