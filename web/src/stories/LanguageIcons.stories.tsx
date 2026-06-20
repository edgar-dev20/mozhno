import type { Meta, StoryObj } from "@storybook/react";
import { JavaIcon, JavaScriptIcon } from "@/app/components/LanguageIcons";

const meta: Meta = {
  title: "App/LanguageIcons",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj;

export const Java: Story = { render: () => <JavaIcon size={32} /> };
export const JavaScript: Story = { render: () => <JavaScriptIcon size={32} /> };

export const All: Story = {
  render: () => (
    <div className="flex gap-6 p-6">
      <div className="flex flex-col items-center gap-2"><JavaIcon size={32} /><span className="text-xs text-muted-foreground">Java</span></div>
      <div className="flex flex-col items-center gap-2"><JavaScriptIcon size={32} /><span className="text-xs text-muted-foreground">JavaScript</span></div>
    </div>
  ),
};
