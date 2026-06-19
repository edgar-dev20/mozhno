import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "storybook/test";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";

function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        onClick={() => toast("Default notification")}
      >
        Default
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium"
        onClick={() => toast.success("Operation completed")}
      >
        Success
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
        onClick={() => toast.error("Something went wrong")}
      >
        Error
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
        onClick={() =>
          toast("Event has been created", {
            description: "Monday, January 3rd at 6:00 PM",
            action: { label: "Undo", onClick: () => {} },
          })
        }
      >
        With Action
      </button>
    </div>
  );
}

const meta: Meta = {
  title: "UI/Toast",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const AllToasts: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Default" }));
    await expect(canvas.getByText("Default notification")).toBeInTheDocument();
  },
};
