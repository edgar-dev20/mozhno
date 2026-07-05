import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "storybook/test";
import { Alert, AlertTitle, AlertDescription } from "@/app/components/ui/alert";
import { AlertCircle, Check, AlertTriangle, Info } from "@/shared/icons";

const meta: Meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Alert>
      <Info size={16} />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components and dependencies to your app.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toBeInTheDocument();
  },
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle size={16} />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert
      className="text-success [&>svg]:text-success"
      variant="default"
    >
      <Check size={16} />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert
      className="text-warning [&>svg]:text-warning"
      variant="default"
    >
      <AlertTriangle size={16} />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>This action will affect all environments.</AlertDescription>
    </Alert>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <Info size={16} />
      <AlertDescription>A simple alert with just a description and no title.</AlertDescription>
    </Alert>
  ),
};
