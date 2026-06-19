import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { Textarea } from "@/app/components/ui/textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: "Write something..." },
};

export const WithValue: Story = {
  args: { defaultValue: "This is a longer piece of text that spans multiple lines.\nIt demonstrates the textarea component." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toHaveValue("This is a longer piece of text that spans multiple lines.\nIt demonstrates the textarea component.");
  },
};

export const Typing: Story = {
  args: { placeholder: "Type multiline text..." },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ta = canvas.getByPlaceholderText("Type multiline text...");
    await userEvent.type(ta, "Line 1{enter}Line 2{enter}Line 3");
    await expect(ta).toHaveValue("Line 1\nLine 2\nLine 3");
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Cannot edit this content" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
};

export const WithRows: Story = {
  args: { rows: 8, placeholder: "Tall textarea..." },
};
