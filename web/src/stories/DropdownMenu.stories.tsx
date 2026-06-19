import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect, screen } from "storybook/test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { User, Settings, LogOut, Plus } from "@/shared/icons";

function DropdownDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
        Open Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><User size={14} /> Profile</DropdownMenuItem>
        <DropdownMenuItem><Settings size={14} /> Settings</DropdownMenuItem>
        <DropdownMenuItem><Plus size={14} /> New Project</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive"><LogOut size={14} /> Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const meta: Meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <DropdownDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open Menu" }));
    await expect(screen.getByText("My Account")).toBeVisible();
  },
};

export const KeyboardNavigation: Story = {
  render: () => <DropdownDemo />,
};
