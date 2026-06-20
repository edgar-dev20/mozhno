import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { FormField } from "@/shared/components/FormField";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";

const meta: Meta<typeof FormField> = {
  title: "Shared/FormField",
  component: FormField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const WithInput: Story = {
  args: { label: "Username", children: <Input placeholder="Enter username" /> },
};

export const WithHint: Story = {
  args: {
    label: "Password",
    hint: "Must be at least 8 characters with a number and special character",
    children: <Input type="password" placeholder="Enter password" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    error: "Please enter a valid email address",
    children: <Input placeholder="user@example.com" type="email" aria-invalid />,
  },
};

export const WithSelect: Story = {
  args: {
    label: "Environment",
    children: (
      <Select defaultValue="production">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="development">Development</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
};

export const WithTextarea: Story = {
  args: {
    label: "Description",
    hint: "Brief description of this flag",
    children: <Textarea rows={3} placeholder="Describe this flag..." />,
  },
};

export const WithMaxLength: Story = {
  args: {
    label: "Name",
    maxLength: 50,
    value: "Hello",
    children: <Input defaultValue="Hello" placeholder="Enter name" />,
  },
};
