import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: "Email address" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Email address")).toBeInTheDocument();
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="name">Full Name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-destructive">
        Email
      </Label>
      <Input id="email" type="email" placeholder="user@example.com" required />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="agree" />
      <Label htmlFor="agree">I agree to the terms and conditions</Label>
    </div>
  ),
};
