import type { Meta, StoryObj } from "@storybook/react";
import { UserProfileMenu } from "@/app/components/UserProfileMenu";
import { TooltipProvider } from "@/app/components/ui/tooltip";

const meta: Meta<typeof UserProfileMenu> = {
  title: "App/UserProfileMenu",
  component: UserProfileMenu,
  tags: ["autodocs"],
  decorators: [(S) => <TooltipProvider><S /></TooltipProvider>],
};

export default meta;
type Story = StoryObj<typeof UserProfileMenu>;

export const Default: Story = {};
