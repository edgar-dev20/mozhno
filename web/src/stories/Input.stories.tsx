import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  },
};

export const WithValue: Story = {
  args: { defaultValue: "Hello world", placeholder: "Enter text..." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("Hello world")).toBeInTheDocument();
  },
};

export const Typing: Story = {
  args: { placeholder: "Type here..." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type here...");
    await userEvent.type(input, "test");
    await expect(input).toHaveValue("test");
  },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled input" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Disabled input")).toBeDisabled();
  },
};

export const TypePassword: Story = {
  args: { type: "password", defaultValue: "secret", placeholder: "Password" },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="user@example.com" type="email" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="error-input">Username</Label>
      <Input id="error-input" placeholder="Enter username" aria-invalid />
      <span className="text-xs text-destructive">Username is already taken</span>
    </div>
  ),
};
